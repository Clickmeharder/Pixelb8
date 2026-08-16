	function loginWithTwitch() {
		const clientId = '1nvm719cyeb2ces4kjsf89bpcgsnah'; // Replace with your Client ID
		const redirectUri = 'https://pixelb8.lol/eu/cos';
		const scope = 'user:read:email';
		const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
		window.location.href = authUrl;
	}

	// Function to extract query parameters from the URL
	function getQueryParam(param) {
		const params = new URLSearchParams(window.location.search);
		return params.get(param);
	}

	// Check if the URL has an authorization code
	const authCode = getQueryParam('code');

	if (authCode) {
		// Exchange the authorization code for an access token
		fetch('https://id.twitch.tv/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: '1nvm719cyeb2ces4kjsf89bpcgsnah',
				code: authCode,
				grant_type: 'authorization_code',
				redirect_uri: 'https://pixelb8.lol/eu/cos'
			})
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok: ' + response.statusText);
			}
			return response.json();
		})
		.then(data => {
			if (data.access_token) {
				const accessToken = data.access_token;
				console.log('Access Token:', accessToken);
				fetchUserData(accessToken);
			} else {
				console.error('No access token returned:', data);
			}
		})
		.catch(error => {
			console.error('Error exchanging code for token:', error);
			if (error.response) {
				return error.response.text().then(text => console.error('Error details:', text));
			}
		});
	}
	// Function to fetch user data from Twitch
	function fetchUserData(accessToken) {
		fetch('https://api.twitch.tv/helix/users', {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Client-ID': '1nvm719cyeb2ces4kjsf89bpcgsnah'
			}
		})
		.then(response => response.json())
		.then(data => {
			if (data.data && data.data.length > 0) {
				const userData = data.data[0];
				const username = userData.display_name;
				const profilePicture = userData.profile_image_url;

				// Display the user info on the page
				document.getElementById('user-info').innerHTML = `
					<h3>Welcome, ${username}</h3>
					<img src="${profilePicture}" alt="Profile Picture" />
				`;
			} else {
				console.error('User data not found:', data);
			}
		})
		.catch(error => console.error('Error fetching user data:', error));
	}