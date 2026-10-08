// assets/games/multiplayer.js
'use strict';

/**
 * Lightweight MQTT lobby + room transport for PixelB8 arcade games.
 * Public-broker multiplayer is intended for casual play, not real-money games.
 */
window.ArcadeMultiplayer = (() => {
    const BROKER = 'wss://broker.hivemq.com:8884/mqtt';
    const ROOT = 'pixelb8/arcade/v3';
    const clientId = `P8_${cryptoRandom(12)}`;

    let client = null;
    let connected = false;
    let gameId = '';
    let roomCode = '';
    let playerName = `PLAYER_${Math.floor(Math.random() * 9000 + 1000)}`;
    let playerRole = 'player';
    let isHost = false;
    let hostId = '';
    let roomInfo = null;
    let pendingRoom = null;
    let heartbeatTimer = null;
    let pruneTimer = null;

    const rooms = new Map();
    const roster = new Map();
    const callbacks = {
        rooms: () => {},
        roster: () => {},
        message: () => {},
        connected: () => {},
        error: error => console.error(error)
    };

    function cryptoRandom(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const bytes = new Uint8Array(length);
        if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
        else for (let i = 0; i < length; i++) bytes[i] = Math.random() * 256;
        return Array.from(bytes, value => chars[value % chars.length]).join('');
    }

    function safeName(value) {
        return String(value || '').replace(/[^\w \-]/g, '').trim().slice(0, 18) || `PLAYER_${cryptoRandom(4)}`;
    }

    function roomDirectoryTopic(code = '+') {
        return `${ROOT}/${gameId}/rooms/${code}`;
    }

    function roomMessageTopic(code = roomCode) {
        return `${ROOT}/${gameId}/tables/${code}`;
    }

    function init(options = {}) {
        if (!options.gameId) throw new Error('ArcadeMultiplayer.init requires gameId.');
        gameId = String(options.gameId).replace(/[^\w-]/g, '').toLowerCase();
        playerName = safeName(options.playerName || playerName);
        if (options.onRooms) callbacks.rooms = options.onRooms;
        if (options.onRoster) callbacks.roster = options.onRoster;
        if (options.onMessage) callbacks.message = options.onMessage;
        if (options.onConnected) callbacks.connected = options.onConnected;
        if (options.onError) callbacks.error = options.onError;
        connectBroker();
    }

    function connectBroker() {
        if (client) return;
        if (typeof mqtt === 'undefined') {
            callbacks.error(new Error('MQTT library is missing.'));
            return;
        }

        client = mqtt.connect(BROKER, {
            clientId,
            clean: true,
            reconnectPeriod: 2500,
            connectTimeout: 10000
        });

        client.on('connect', () => {
            connected = true;
            client.subscribe(roomDirectoryTopic());
            if (pendingRoom) activatePendingRoom();
        });
        client.on('reconnect', () => { connected = false; });
        client.on('offline', () => { connected = false; });
        client.on('error', callbacks.error);
        client.on('message', handleMessage);

        pruneTimer = setInterval(() => {
            const cutoff = Date.now() - 35000;
            let changed = false;
            for (const [code, info] of rooms) {
                if ((info.updatedAt || 0) < cutoff) { rooms.delete(code); changed = true; }
            }
            if (changed) emitRooms();
            pruneRoster();
        }, 5000);
    }

    function handleMessage(topic, raw) {
        const text = raw.toString();
        if (topic.startsWith(`${ROOT}/${gameId}/rooms/`)) {
            const code = topic.split('/').pop();
            if (!text) rooms.delete(code);
            else {
                try {
                    const info = JSON.parse(text);
                    if (info.code && info.updatedAt > Date.now() - 35000) rooms.set(code, info);
                } catch (error) { callbacks.error(error); }
            }
            emitRooms();
            return;
        }

        if (topic !== roomMessageTopic() || !text) return;
        try {
            const message = JSON.parse(text);
            if (!message || !message.type) return;
            if (message.type === 'JOIN') {
                roster.set(message.senderId, {
                    id: message.senderId,
                    name: safeName(message.name),
                    role: message.role || 'player',
                    status: message.status || 'waiting',
                    seenAt: Date.now()
                });
                if (isHost) {
                    publish('WELCOME', { targetId: message.senderId, hostId: clientId, roster: getRoster() });
                    publishRoomListing();
                }
                emitRoster();
            } else if (message.type === 'WELCOME' && (!message.targetId || message.targetId === clientId)) {
                hostId = message.hostId || hostId;
                (message.roster || []).forEach(person => roster.set(person.id, { ...person, seenAt: Date.now() }));
                emitRoster();
            } else if (message.type === 'PRESENCE') {
                roster.set(message.senderId, {
                    id: message.senderId,
                    name: safeName(message.name),
                    role: message.role || 'player',
                    status: message.status || 'waiting',
                    seenAt: Date.now()
                });
                if (isHost) publishRoomListing();
                emitRoster();
            } else if (message.type === 'LEAVE') {
                roster.delete(message.senderId);
                if (isHost) publishRoomListing();
                emitRoster();
            }
            callbacks.message(message);
        } catch (error) {
            callbacks.error(error);
        }
    }

    function hostRoom(options = {}) {
        const code = String(options.code || cryptoRandom(4)).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        pendingRoom = {
            action: 'host',
            code,
            mode: options.mode || 'freeplay',
            maxPlayers: Math.max(2, Math.min(8, Number(options.maxPlayers) || 6)),
            name: options.name || `${playerName}'s table`,
            status: 'waiting'
        };
        if (connected) activatePendingRoom();
        return code;
    }

    function joinRoom(code, role = 'player') {
        pendingRoom = {
            action: 'join',
            code: String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6),
            role: role === 'spectator' ? 'spectator' : 'player'
        };
        if (!pendingRoom.code) throw new Error('Room code is required.');
        if (connected) activatePendingRoom();
    }

    function activatePendingRoom() {
        if (!pendingRoom || roomCode) return;
        roomCode = pendingRoom.code;
        isHost = pendingRoom.action === 'host';
        hostId = isHost ? clientId : '';
        playerRole = pendingRoom.role || 'player';
        if (isHost) {
            roomInfo = {
                code: roomCode,
                name: pendingRoom.name,
                mode: pendingRoom.mode,
                maxPlayers: pendingRoom.maxPlayers,
                status: 'waiting',
                hostId
            };
        }
        client.subscribe(roomMessageTopic(), () => {
            roster.set(clientId, { id: clientId, name: playerName, role: playerRole, status: 'waiting', seenAt: Date.now() });
            publish('JOIN', { name: playerName, role: playerRole, status: 'waiting' });
            if (isHost) {
                publishRoomListing();
                heartbeatTimer = setInterval(() => {
                    publish('PRESENCE', { name: playerName, role: playerRole, status: roomInfo?.status || 'waiting' });
                    publishRoomListing();
                }, 10000);
            } else {
                heartbeatTimer = setInterval(() => publish('PRESENCE', {
                    name: playerName, role: playerRole, status: 'connected'
                }), 10000);
            }
            callbacks.connected({ code: roomCode, isHost, clientId, role: playerRole });
            emitRoster();
            pendingRoom = null;
        });
    }

    function publish(type, payload = {}) {
        if (!client || !connected || !roomCode) return false;
        client.publish(roomMessageTopic(), JSON.stringify({
            type,
            senderId: clientId,
            name: playerName,
            sentAt: Date.now(),
            ...payload
        }));
        return true;
    }

    function publishRoomListing() {
        if (!isHost || !roomInfo || !client || !connected) return;
        const players = getRoster().filter(person => person.role !== 'spectator');
        const spectators = getRoster().filter(person => person.role === 'spectator');
        const listing = {
            ...roomInfo,
            hostName: roster.get(clientId)?.name || playerName,
            players: players.map(person => ({
                id: person.id,
                name: person.name,
                status: roomInfo.playerStates?.[person.id] || person.status
            })),
            spectators: spectators.length,
            playerCount: players.length,
            updatedAt: Date.now()
        };
        client.publish(roomDirectoryTopic(roomCode), JSON.stringify(listing), { retain: true, qos: 0 });
        rooms.set(roomCode, listing);
        emitRooms();
    }

    function updateRoom(patch = {}) {
        if (!isHost || !roomInfo) return;
        roomInfo = { ...roomInfo, ...patch, code: roomCode, hostId };
        publishRoomListing();
    }

    function updatePresence(patch = {}) {
        const current = roster.get(clientId) || { id: clientId, name: playerName, role: playerRole };
        roster.set(clientId, { ...current, ...patch, seenAt: Date.now() });
        publish('PRESENCE', {
            name: current.name,
            role: current.role,
            status: patch.status || current.status || 'connected'
        });
        if (isHost) publishRoomListing();
        emitRoster();
    }

    function setPlayerName(value) {
        playerName = safeName(value);
        const current = roster.get(clientId);
        if (current) {
            current.name = playerName;
            current.seenAt = Date.now();
            updatePresence({ name: playerName });
        }
        return playerName;
    }

    function pruneRoster() {
        if (!roomCode) return;
        const cutoff = Date.now() - 32000;
        let changed = false;
        for (const [id, person] of roster) {
            if (id !== clientId && (person.seenAt || 0) < cutoff) { roster.delete(id); changed = true; }
        }
        if (changed) {
            emitRoster();
            if (isHost) publishRoomListing();
        }
    }

    function emitRooms() {
        callbacks.rooms(Array.from(rooms.values()).sort((a, b) => {
            if (a.status !== b.status) return a.status === 'waiting' ? -1 : 1;
            return b.updatedAt - a.updatedAt;
        }));
    }

    function emitRoster() {
        callbacks.roster(getRoster());
    }

    function getRoster() {
        return Array.from(roster.values()).sort((a, b) => {
            if (a.id === hostId) return -1;
            if (b.id === hostId) return 1;
            return a.name.localeCompare(b.name);
        });
    }

    function disconnect() {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (pruneTimer) clearInterval(pruneTimer);
        heartbeatTimer = pruneTimer = null;
        if (client && roomCode) {
            publish('LEAVE');
            if (isHost) client.publish(roomDirectoryTopic(roomCode), '', { retain: true });
            client.unsubscribe(roomMessageTopic());
        }
        roomCode = '';
        hostId = '';
        roomInfo = null;
        isHost = false;
        roster.clear();
        if (client) { client.end(true); client = null; }
        connected = false;
    }

    window.addEventListener('beforeunload', disconnect);

    return {
        init,
        hostRoom,
        joinRoom,
        publish,
        updateRoom,
        updatePresence,
        setPlayerName,
        getRooms: () => Array.from(rooms.values()),
        getRoster,
        getRoom: () => roomCode,
        getClientId: () => clientId,
        getHostId: () => hostId,
        isHost: () => isHost,
        disconnect,
        generateRoomCode: () => cryptoRandom(4)
    };
})();

// --- UNIVERSAL CYBER-CHAT MODULE ---
// Reusable Drop-in Chat UI for all PixelB8 Multiplayer Games
window.CyberChat = (() => {
    const emojis = [
        '😀','😂','🤣','😎','😍','🥳','🤔','😱',
        '😭','🤬','💀','👀','🤝','👍',
        '👎','👏','🙏','💪','❤️','💔','🔥','✨',
        '⚡','💥','💯','🎉','🏆','🎯','🎲','🎮',
        '🛡️','⚔️','🔫','💰','💎','📈','📉',
        '🚀','🛸','👽','🤖','🌌','🪐','🌍','☄️',
        '🐄','🐔','🐟','🍺','🚬','🙃'
    ];
    let colorResolver = null;

    function init(containerId, getColorCallback) {
        colorResolver = getColorCallback;
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div id="chat-messages" class="chat-messages"></div>

            <form id="chat-form" class="chat-input-row">
                <div id="emoji-picker" class="emoji-picker hidden">
                    ${emojis.map(e => `<span onclick="document.getElementById('chat-input').value += '${e}'">${e}</span>`).join('')}
                </div>
                <button type="button" id="emoji-btn" style="background: none; border: 1px solid #233544; border-radius: 4px; padding: 5px; cursor: pointer;">😀</button>
                <input id="chat-input" type="text" placeholder="Comms..." autocomplete="off">
                <button type="submit" class="primary">SEND</button>
            </form>
        `;

        const picker = document.getElementById('emoji-picker');
        document.getElementById('emoji-btn').onclick = (e) => {
            e.stopPropagation();
            picker.classList.toggle('hidden');
        };
        document.addEventListener('click', () => picker.classList.add('hidden'));
        picker.onclick = (e) => e.stopPropagation();

        document.getElementById('chat-form').onsubmit = (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input');
            const text = input.value.trim();
            if (text && window.ArcadeMultiplayer) {
                window.ArcadeMultiplayer.publish('CHAT', { text });
                input.value = '';
            }
        };
    }

    function handleMessage(msg) {
        if (!msg || msg.type !== 'CHAT') return;
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        // XSS Protection
        const senderName = String(msg.name || 'Unknown').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const text = String(msg.text || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const color = colorResolver ? colorResolver(msg.senderId) : 'var(--accent, #19f5c6)';

        const msgEl = document.createElement('div');
        msgEl.innerHTML = `<b style="color:${color}">${senderName}:</b> ${text}`;
        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    return { init, handleMessage };
})();