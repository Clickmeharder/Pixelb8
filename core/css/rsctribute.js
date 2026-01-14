const clientWidth = 512;
const clientHeight= 346;
const fadeIn  = 0;
const fadeOut = 1;
const states_login  = 0;
const states_create = 1;
const states_load   = 2;
const states_game   = 3;
const editorWidth = 256;
const editorHeight = 256;
let state  = states_login;
let inventorySize = 30;
let isMouseDown = false;
let sprites = [];
let views   = [];
let gearStatName = ["Armour", "WeaponAim", "WeaponPower", "Magic", "Prayer"];
let gearStat     = [1, 1, 1, 1, 1];
let skillName = ["Attack", "Defense", "Strength", "Hits", "Ranged", "Prayer", "Magic", "Cooking", "Woodcut", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblaw", "Agility", "Thieving"];
let skillLevel = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

let appearanceTopBottomColors = [
  '#ff0000', '#ff8000', '#ffe000', '#a0e000', '#00E000', '#008000', '#00A080', '#00B0FF', '#080FF', '#0030F0', '#e000e0', '#303030', '#604000', '#805000', '#ffffff'];
let appearanceHairColors = [
   '#ffc030', '#ffa040', '#805030', '#604020', '#303030', '#ff6020', '#ff4000', '#ffffff', '#00FF00', '#0FFFFFF'
];
let skillExp = [];
let skillExpTable = [];
let canvas = document.querySelector(".le-canvas");
let ctx    = canvas.getContext("2d");

// would be used for tinting the sprites to give different colors
// but I cant access the image data because the files are loaded cross-domain..
// so we won't get any colors yet unless I fix new sprites or move the sprites into image:data bleh
let spriteEditorCanvas = document.querySelector(".sprite-editor"); 
let spriteEditorCtx    = spriteEditorCanvas.getContext("2d");

function loadExpTable() {
  let l = 0;
  for (let i1 = 0; i1 < 99; i1++) {
    let j1 = i1 + 1;
    let l1 = parseInt(j1 + 300 * Math.pow(2, j1 / 7));
    l += l1;
    skillExpTable[i1] = (l & 0xffffffc) / 4;
  }  
  for (let i = 0; i < skillName.length; i++) {
    if (skillLevel[i] === 1) {
      skillExp[i] = 0;
    } else skillExp[i] = skillExpTable[skillLevel[i]-2];
  }
} loadExpTable();

let mousePosition = {x:0,y:0};
let keyboard = [];
  canvas.width = Math.max(clientWidth, window.innerWidth-32);
  canvas.height = Math.max(clientHeight, window.innerHeight-32); 
//ctx.translate(0.5, 0.5);

let allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789!\"!$%^&*()-_=+[{]};:'@#~,<.>/?\\| ";

keyboard.shift = false;
keyboard.back  = false;
for(let x = 0; x < 256; ++x) {
  keyboard[x] = false;
}

class Character {
  constructor() {
    this.gender = 0;
    this.skin   = 0;
    this.head   = 0;
    this.hair   = 0;
    this.top    = 0;
    this.bottom = 0;        
  }
  
  isLoaded(direction, frame = 0) {
    let s = this.getSprites(direction, frame);    
    return s.top.isLoaded() && s.bottom.isLoaded() && s.head.isLoaded();
  }
  
  draw(x, y, direction, frame = 0) {    
    if (!this.isLoaded(direction, frame)) return;
    let s = this.getSprites(direction, frame);
    let top = s.top;
    let bottom = s.bottom;
    let head = s.head;
    let totalHeight = 96;
    let totalWidth  = 40;
    let headHeight  = 15;    
    let bottomHeight = bottom.getHeight();
    let bodyOffsetY   = 4;
    let headOffsetY   = 4;
    let bodyOffsetX   = 0;
    let headOffsetX   = 0;
    let bottomX = x + (totalWidth/2 - bottom.getWidth()/2);    
    if (direction === 0) bottomX -= 2;        
    if (direction === 1) { 
      bodyOffsetY = 8; 
      bodyOffsetX = 1;
      headOffsetY = 7;
      headOffsetX = -1;
    }
    bottom.draw(bottomX, y + (totalHeight - bottomHeight));
    top.draw(x +bodyOffsetX+ (totalWidth/2 - top.getWidth()/2), y + (totalHeight - bottomHeight - top.getHeight()) + bodyOffsetY);
    head.draw(x +headOffsetX+ (totalWidth/2-head.getWidth()/2), y + (totalHeight - bottomHeight - top.getHeight() - headHeight) + headOffsetY);
    
  }
  getSprites(direction, frame = 0) {
    return {     
      top: sprites[`top-${this.gender}-${direction}-${frame}`],
      bottom: sprites[`bottom-0-${direction}-${frame}`],
      head: sprites[`head-${this.head}-${direction}-${frame}`]
    };
  }
}

class FadeInOut {  
  constructor() {
    this.value = 0.0;    
    this.fadeDuration = 4.0;
    this.stallDuration = 2.0;
    this.stallTime = 0.0;
    this.fadeTime = 0.0;
    this.timeOffset = 0.0;
    this.fadeType = fadeIn;
    this.reverse = false;
    this.done = false;
    this.lastUpdate = 0.0;
  }
  
  update(total) {        
    let elapsed = (total - this.lastUpdate) / 1000;
    this.lastUpdate = total;    
    if (isNaN(elapsed)) return;     
    if (this.timeOffset > 0) {
      this.timeOffset -= elapsed;
      return;
    }    
    this.fadeTime += this.reverse ? -elapsed : elapsed;             
    this.value = this.fadeTime / this.fadeDuration;            
    if (this.value >= 1.0) this.reverse = true;
    if (this.reverse && this.value <= 0.0) {
      this.reverse = false;
    }
  }  
}

class LoginView {
  constructor() {
    this.fader   = new FadeInOut();      
    this.reverse = false;
    this.bgIndex    = 0;
    this.frontIndex = 1;
    this.state = 0; 
    this.username = '';
    this.password = '';
    this.loginText = "Please enter your username and password";
    this.focusedInput = 0;
    this.inputIndex   = 0;
    this.lastUpdate   = 0;
    this.timeDelta    = 0;
    this.inputTimer   = 0;
  }
  
  draw(x, y) {    
    this.drawBackground(x, y);
    this.drawTexts(x, y);
    this.drawInputs(x, y);
    this.drawBorder(x, y);
  }
      
  update(total) {    
    this.fader.update(total);    
    let elapsed = total - this.lastUpdate;    
    if (isNaN(elapsed)) return;
    this.timeDelta = elapsed;
    this.lastUpdate = total;
    this.inputTimer -= (this.timeDelta/1000);    
    if (this.inputTimer < 0) {
      this.inputTimer = 0;
    }
  }  
  
  drawBorder(x, y) {
    let renderY = y + 325;
    let height = 10;
    let width  = clientWidth;
    var grd = ctx.createLinearGradient(x, renderY, x, renderY + height);
    grd.addColorStop(0, "rgba(0, 102, 128, 0)");
    grd.addColorStop(0.5, "rgb(0, 102, 128)");
    grd.addColorStop(1, "rgba(0, 102, 128, 0)");
    
    ctx.fillStyle = grd;    
    ctx.fillRect(x, renderY, width, height);
  }
  
  drawBackground(x, y) {
    let yOffset = 0;
    // if (this.bgIndex === 2) yOffset-=2;
    ctx.save();
    sprites["login"].drawExact(0, this.bgIndex * 198+yOffset, 0, 198, x, y, 0, 198);                    
    ctx.globalAlpha = this.fader.value;        
    sprites["login"].drawExact(0, this.frontIndex * 198, 0, 198, x, y, 0, 198);        
    ctx.restore();
    sprites["logo"].draw(x + 38, y + 13);      
    if (this.reverse === false && this.fader.value >= 0.99) {      
      this.bgIndex = (this.frontIndex + 1) % 3;
      this.reverse = true;
    }
    if (this.reverse === true && this.fader.value <= 0.01) {
      this.reverse = false;
      this.frontIndex = this.bgIndex;
    }            
  }
  
  drawTexts(x, y) {
    if (this.state === 0) {          
      this.drawText("Welcome to RuneScape Classic", x + 155, y + 230);
      this.drawText("You DON'T need a members account to use this server", x + 75, y + 250);
    } else {
      this.setTextStyle(12, "white");      
      let size = ctx.measureText(this.loginText);
      ctx.fillText(this.loginText, x + (clientWidth / 2 - size.width/2), y + 210);
    }    
  }
  
  drawInputs(x, y) {
    this.inputIndex = 0;
    if (this.state === 0) { 
      let btnWidth = 185;      
      if (this.drawButton("Click here to login", x + (clientWidth/2) - (btnWidth/2), y + 265, btnWidth, 38)) {
        this.state = 1; // display the "input credentials" screen
      }
    } else {
        let inputWidth = 200;
        this.username = this.drawInput("Username:", this.username, x + 40, y + 220, inputWidth, 42);
        this.password = this.drawInput("Password:", this.password, x + 90, y + 270, inputWidth, 42, true);
        if (this.drawButton("Ok", x + clientWidth - 180, y + 225, 130, 26)) {
          this.loginText = "Please wait... Connecting to server";          
          setTimeout(() => {
            if (this.username.length > 0 && this.password.length > 0) {
              state = states_create;
            } else if (this.username.length > 0 && this.password.length === 0) {
              this.loginText = "Invalid username or password. Try again, or create a new account";
            } else {
              this.loginText = "Sorry! Unable to connect. Check internet settings or try another world";
            }
          }, 2000);
        }
        if (this.drawButton("Cancel", x + clientWidth - 180, y + 257, 130, 26)) {
          this.state = 0;
          this.loginText = "Please enter your username and password";
        }
    }
  }
  
  handleUserInput(text) {    
    let keyWasDown = false;
    let charDown = "";    
    if (text.length < 20) {
      for (let x = 0; x < allowedChars.length; x++) {
        let char = allowedChars[x];
        let key  = char.charCodeAt(0);
        if (keyboard[key] === true) {
          charDown += (keyboard.shift === true 
            ? char 
            : char.toLowerCase());
          keyWasDown=true;
        }
      }   
    }    
    keyWasDown = keyWasDown || keyboard.back === true;    
    if (keyWasDown === false) this.inputTimer = 0;        
    if (this.inputTimer > 0) return text;               
    text = keyboard.back === true 
      ? text.substring(0, text.length-1)
      : text + charDown;    
    if (keyWasDown === true) this.inputTimer = 0.1;        
    return text;
  }
  
  secretText(value, replacement) {
    let output = "";
    for(let x = 0; x < value.length; x++) {
      output += replacement;
    }
    return output;
  }
  
  setTextStyle(size = 12, color = "white") {
    ctx.font = `bold ${size}pt Calibri`;
    ctx.fillStyle = color;     
  }
  drawText(text, x, y, size = 12, color = "white") {
    this.setTextStyle(size, color);
    ctx.fillText(text, x, y);
  }   
  
  drawInput(text, value, x, y, width, height, isPassword = false) {        
    this.drawInputBackground(x, y, width, height);    
    this.setTextStyle(13, "black");
    let size = ctx.measureText(text);
    ctx.fillText(text, x + (width/2 - size.width/2), y + 15);      
    this.setTextStyle(12, "black");
    // if you click on this input, we should focus on it :-)
    if (isMouseDown === true 
        && mousePosition.x >= x && mousePosition.x < x+width
        && mousePosition.y >= y && mousePosition.y < y+height) {
          this.focusedInput = this.inputIndex;
    }
    // when focused, we will add an asterisk / star to show the user we are editing this text
    if (this.focusedInput === this.inputIndex) {      
      value = this.handleUserInput(value);
      let displayText = isPassword ? this.secretText(value, "X") : value;
      let valueSize = ctx.measureText(displayText + "*");
      ctx.fillText(displayText + "*", x + (width/2 - valueSize.width/2), y + 35);
    } else {
      let displayText = isPassword ? this.secretText(value, "X") : value;
      let valueSize = ctx.measureText(displayText);
      ctx.fillText(displayText, x + (width/2 - valueSize.width/2), y + 35);      
    }        
    this.inputIndex++;
    return value;
  }    
  
  drawButton(text, x, y, width, height) {
    ctx.font = "bold 14pt Calibri";
    let size = ctx.measureText(text);
    let renderX = x + (width / 2 - (size.width / 2));
    let renderY = y + (height / 2) + 5;    
    this.drawInputBackground(x, y, width, height);        
    ctx.fillStyle = "black";            
    ctx.fillText(text, renderX, renderY);    
    // return whether or not user has mouse down on the button
    // this is so we can give a faster response to "if user clicked on the button"
    // this is similar to how Unity works with their editor GUI :-)   
    if (isMouseDown === true 
        && mousePosition.x >= x && mousePosition.x < x+width
        && mousePosition.y >= y && mousePosition.y < y+height) {
          return true;
    }
       
    return false;    
  }
  
  drawInputBackground(x, y, width, height) {
    let outerBorderlight  = 'rgb(135, 146, 179)';
    let outerBorderdark   = 'rgb(84, 93, 120)';
    let innerBorderLight  = 'rgb(97, 112, 151)';
    let innerBorderDark   = 'rgb(88, 102, 136)';
    let fillGradientStart = 'rgb(88, 97, 125)';
    let fillGradientStop  = 'rgb(129, 139, 172)';       
    
    ctx.fillStyle = outerBorderdark;
    ctx.beginPath();    
    ctx.fillRect(x, y, width, height);    
    ctx.closePath(); 
        
    ctx.strokeStyle = outerBorderlight;       
    ctx.lineWidth = 1;    
    // draw upper line    
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width - 1, y);
    ctx.moveTo(x, y + 1);
    ctx.lineTo(x + width - 2, y + 1);
    ctx.stroke();
    
    // draw the left line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height - 1);
    ctx.moveTo(x + 1, y);
    ctx.lineTo(x + 1, y + height - 2)
    ctx.stroke();
    
    ctx.strokeStyle = innerBorderLight;    
    // draw the inner left line
    ctx.beginPath();    
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + 2, y + height - 3);
    ctx.stroke();
           
    // draw the inner upper line
    ctx.beginPath();    
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + width - 3, y + 2);
    ctx.stroke();
    
    
    ctx.strokeStyle = innerBorderDark;    
    // draw the inner lower line
    ctx.beginPath();    
    ctx.moveTo(x + 2, y + height - 3);
    ctx.lineTo(x + width - 3, y  + height - 3);
    ctx.stroke();
    
    // draw the inner right line
    ctx.beginPath();    
    ctx.moveTo(x + width - 3, y + 2);
    ctx.lineTo(x + width - 3, y + height - 3);
    ctx.stroke();
    
    var grd = ctx.createLinearGradient(x, y, x, y + height);
    grd.addColorStop(0, fillGradientStart);
    grd.addColorStop(1, fillGradientStop);
    
    ctx.fillStyle = grd;    
    ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
  }
}

class LoadWorldView {
  constructor() {
    this.isLoading = false;
    this.text = "Loading... Please wait";
  }
  draw(x, y) {                
    ctx.font = `bold 12pt Calibri`;
    ctx.fillStyle = "white";     
    let size = ctx.measureText(this.text);
    ctx.fillText(this.text, x + clientWidth / 2 - size.width / 2, y + 180);
  }
  update(elapsed) {   
    if (this.isLoading === false) {
      setTimeout(() => state = states_game, 1000);
      this.isLoading = true;
    }
  }
}

class Item {
  constructor() {
    this.sprite = undefined;
    this.name = "";
    this.amount = 0;
    this.stackable = false;
    this.equipped = false;
  }
}

class GameView {
  constructor() {
    this.character = undefined;
    this.inventoryItems = [];    
    this.activeMenuIndex = -1;
    for(let i = 0; i < inventorySize; i++) {
      this.inventoryItems[i] = new Item();
    }
  }
  draw(x, y) {            
    if (!sprites["world"].isLoaded()) {
      ctx.font = `bold 12pt Calibri`;
      ctx.fillStyle = "white";     
      let text = "Loading... Please wait";
      let size = ctx.measureText(text);
      ctx.fillText(text, x + clientWidth / 2 - size.width / 2, y + 180);      
      return;
    }
    
    this.drawBackground(x, y);    
    this.drawCharacter(x, y);
    this.drawUI(x, y);
  }
  drawBackground(x, y) {
    sprites["world"].draw(x, y);
  }
  
  drawCharacter(x, y) {
    if (this.character) {
      this.character.draw(x + clientWidth / 2 - 18, y + 100, 1);
    }
  }
  
  drawBox(x, y, width, height, style) {
    ctx.beginPath();
    ctx.fillStyle = style;
    ctx.fillRect(x, y, width, height);
    ctx.fill();
  }  
  
  drawLineY(x, y, height) {
    ctx.strokeStyle = "black";
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(x+0.5, y+0.5);
    ctx.lineTo(x+0.5, y+0.5 + height);
    ctx.stroke();
  }
  
  drawLineX(x, y, width) {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(x+0.5, y+0.5);
    ctx.lineTo(x+0.5 + width, y+0.5);
    ctx.stroke();
  }
    
  getCombatLevel() {
    let atk = skillLevel[0];
    let def = skillLevel[1];
    let str = skillLevel[2];
    let hit = skillLevel[3];
    let rng = skillLevel[4];
    let pra = skillLevel[5];
    let mag = skillLevel[6];       
    let a = (atk+def+str+hit) / 4;
    let b = (mag+pra) / 8;
    if (rng * 1.5 >= atk+str) {
      return parseInt((def + hit) / 4 + b + (rng * 0.375));
    }
    return parseInt(a + b);
  }
  
  getSkillTotal() {
    let total = 0;
    for (let i = 0; i < skillLevel.length; i++) 
      total+=skillLevel[i];
    return total;
  }
  
  getExpForNextLevel(skillIndex) {
    let nextLevel = skillExpTable[0];
    for (let l3 = 0; l3 < 98; l3++) {
      if (skillExp[skillIndex] >= skillExpTable[l3]) {
        nextLevel = skillExpTable[l3 + 1];
      }
    }
    return nextLevel;
  }
  
  drawLabel(text, value, x, y, size, textColor = "white", valueColor = "yellow") {
      let textSize = ctx.measureText(text);
      this.drawShadowText(text, x, y, size, textColor);
      this.drawShadowText(value, x + textSize.width, y, size, valueColor); 
  }
  
  drawShadowText(text, x, y, size, color) {
    this.drawTextThin(text, x+1, y+1, size, "black");
    this.drawTextThin(text, x, y, size, color);
  }

  drawText(text, x, y, size, color) {
    ctx.font = `bold ${size}pt Calibri`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }  

  setTextThinStyle(size = 12, color = "white") {
    ctx.font = `${size}pt Open Sans`;
    ctx.fillStyle = color;     
  }
  
  drawTextThin(text, x, y, size = 12, color = "white") {
    this.setTextThinStyle(size, color);
    ctx.fillText(text, x, y);
  }       
  
  drawUI(x, y) {
    for (let i = 0; i < 6; i++) {   
      let posx = (x + (clientWidth - 35)) - (33 * i);
      this.drawMenuItem(posx, y+3, i);  
    }
  }
  
  drawMenuItem(x, y, index) {
    let width = 32;
    let height = 32;
    if ((mousePosition.x >= x && mousePosition.x < x+width
        && mousePosition.y >= y && mousePosition.y < y+height) || this.activeMenuIndex === index) {
      
      let sprite = sprites[`menu-${index}`];
      let i = 5 - index;      
      // inv
      this.activeMenuIndex = index;
      if (index === 0) {        
        sprite.draw(x - 213, y);   
        this.drawInventory(x, y-3);
      }
      // map
      else if (index === 1) {
        sprite.draw(x - 91, y);
        this.drawMap(x, y);
      }
      else {
        sprite.draw(x - (i * 33), y);
        switch(index) {
          case 2: 
            this.drawStats(x, y-3);
            break;
          case 3: 
            this.drawSpells(x, y);
            break;
          case 4: 
            this.drawFriends(x, y);
            break;
          case 5: 
            this.drawSettings(x, y);
            break;
        }
      }
    }
  }
  
  drawInventory(x,y) {
    let l = clientWidth - 248;
    for(let i1 = 0; i1 < inventorySize; i1++) {      
      let boxX = x - l + (i1 % 5) * 49 + 51;
      let boxY = y + 36 + parseInt(i1 / 5) * 34;
      if (i1 < inventorySize && this.inventoryItems[i1].equipped === true) {
        this.drawBox(boxX, boxY, 49, 34, "rgba(255,0,0,0.5)");
      } else {
        this.drawBox(boxX, boxY, 49, 34, "rgba(181, 181, 181, 0.5)");
      }
      if (i1 < inventorySize && this.inventoryItems[i1].sprite) {
        this.inventoryItems[i1].sprite.draw(boxX, boxY);
        // if (item is stackable, eg coin) then
        //    drawString (amount, boxX + 1, boxY + 10, fontSize, color:yellow)
      }          
    }
    
    for (let i = 1; i <= 4; i++)
      this.drawLineY(x - l + (i * 49) + 2 + 49, y + 36, parseInt(inventorySize / 5) * 34);
    
    for (let i = 1; i <= 5; i++)
      this.drawLineX(x - l + 49 + 2, y + 36 + i * 34, 245);
             
    if(mousePosition.x < x - 218 || mousePosition.y >= y + 244) {
      this.activeMenuIndex = -1;
    }  
  }
  
  
  drawMap(x,y) {
    let boxX = x - 88;    
    let boxY = y + 36;
    let boxWidth = 156;
    let boxHeight = 152;
    this.drawBox(boxX, boxY, boxWidth, boxHeight, "black");
    if(mousePosition.x < x - 92 || mousePosition.y >= y + 190) {
      this.activeMenuIndex = -1;
    }  
  }
  
  drawStats(x,y) {
    // this contains both quests and stats
    let tabWidth  = 196;
    let height = 275;
    let renderX = x - 98;
    let renderY = y + 36;
    this.drawBox(renderX, renderY, tabWidth / 2, 24, "rgba(220, 220, 220, 0.5)");
    this.drawBox(renderX + tabWidth / 2, renderY, tabWidth/2, 24, "rgba(160, 160, 160, 0.5)");
    this.drawBox(renderX, renderY + 24, tabWidth, height - 24, "rgba(220, 220, 220, 0.5)");    
    this.drawLineX(renderX, renderY + 24, tabWidth);
    this.drawLineY(renderX + tabWidth / 2, renderY, 24);
    this.drawText("Stats", renderX + 30, renderY +  18, 13, "black");
    this.drawText("Quests", renderX + 25 + tabWidth / 2, renderY +  18, 13, "black");    
    
    // todo: add quest tab content    
    let l1 = y + 72;    
    let skillHoverIndex = -1;
    this.drawShadowText("Skills", renderX + 7, l1, 10, "yellow");
    l1 += 13;        
    for(let k2 = 0; k2 < 9; k2++) {      
      let skillNameColor = "white"; 
      if (mousePosition.x >= renderX+10 && mousePosition.y >= l1 - 11 
          && mousePosition.y < l1 + 2 && mousePosition.x< renderX+90) {
        skillNameColor = "red";
        skillHoverIndex = k2;
      }                 
      this.drawLabel(skillName[k2] + ":", `${skillLevel[k2]}/${skillLevel[k2]}`, 
                     renderX + 7, l1, 9, skillNameColor, "yellow");                                  
      skillNameColor = "white"
      if (mousePosition.x >= renderX+90 && mousePosition.y >= l1 - 11 
          && mousePosition.y < l1 + 2 && mousePosition.x < renderX+196) {
        skillNameColor = "red";
        skillHoverIndex = k2+9;
      }         
      this.drawLabel(skillName[k2 + 9] + ":", `${skillLevel[k2+ 9]}/${skillLevel[k2+ 9]}`, 
        renderX + tabWidth / 2, l1, 9, skillNameColor, "yellow");         
      l1+= 13;
    }
    
    this.drawLabel("Quest Points:", "0", (renderX + tabWidth / 2), l1, 9);    
    l1 += 12;
    this.drawLabel("Fatigue:", "0%", renderX+7, l1-13, 9);    
    l1 += 8;
    this.drawShadowText("Equipment Status", renderX+7, l1, 10, "yellow");
    l1 += 12;    
    for(let i3 = 0; i3 < 3; i3++) {
      this.drawLabel(gearStatName[i3] + ":", gearStat[i3], renderX + 7, l1, 9);
      if (i3 < 2) 
        this.drawLabel(gearStatName[i3 + 3] + ":", gearStat[i3], renderX + tabWidth / 2 +25, l1, 9);
      l1 += 13;
    }
    l1 += 6;
    this.drawLineX(renderX, l1 - 15, tabWidth);    
    if (skillHoverIndex !== -1) {      
      this.drawShadowText(skillName[skillHoverIndex] + " skill", renderX + 7, l1, 9, "yellow");
      l1+=12;      
      let nextLevel = this.getExpForNextLevel(skillHoverIndex);      
      this.drawShadowText(`Total xp: ${skillExp[skillHoverIndex]}`, renderX + 7, l1, 9, "white");
      l1 += 12;
      this.drawShadowText(`Next level at: ${nextLevel}`, renderX + 7, l1, 9, "white");      
    } else {
      this.drawShadowText("Overall levels", renderX + 7, l1, 9, "yellow");
      l1 += 12;
      let skillTotal = this.getSkillTotal();
      this.drawShadowText(`Skill total: ${skillTotal}`, renderX +  7, l1, 9, "white");
      l1+= 12;
      let combatLevel = this.getCombatLevel();
      this.drawShadowText(`Combat level: ${combatLevel}`, renderX +  7, l1, 9, "white");
    }    
    if(mousePosition.x < x - 105 || mousePosition.y >= y + height+36) {
      this.activeMenuIndex = -1;
    }  
  }
  
  drawSpells(x, y) {
    let width = 196;
    let height = 182;
    let renderY = y+33;
    let renderX = x-65;
    this.drawBox(renderX, renderY, width / 2, 24, "rgba(220, 220, 220, 0.5)");
    this.drawBox(renderX + width / 2, renderY, width/2, 24, "rgba(160, 160, 160, 0.5)");
    this.drawBox(renderX, renderY + 24, width, height - 24, "rgba(220, 220, 220, 0.5)");    
    this.drawLineX(renderX, renderY + 24, width);
    this.drawLineY(renderX + width / 2, renderY, 24);
    this.drawText("Magic", renderX + 30, renderY +  18, 13, "black");
    this.drawText("Prayers", renderX + 25 + width / 2, renderY +  18, 13, "black");    
    if(mousePosition.x < renderX || mousePosition.y >= renderY + height) {
      this.activeMenuIndex = -1;
    }
  }
  
  drawFriends(x,y) {
    let width = 196;
    let height = 182;
    let renderY = y+33;
    let renderX = x-32;
    this.drawBox(renderX, renderY, width / 2, 24, "rgba(220, 220, 220, 0.5)");
    this.drawBox(renderX + width / 2, renderY, width/2, 24, "rgba(160, 160, 160, 0.5)");
    this.drawBox(renderX, renderY + 24, width, height - 24, "rgba(220, 220, 220, 0.5)");    
    this.drawLineX(renderX, renderY + 24, width);
    this.drawLineY(renderX + width / 2, renderY, 24);
    this.drawText("Friends", renderX + 25, renderY +  18, 13, "black");
    this.drawText("Ignore", renderX + 25 + width / 2, renderY +  18, 13, "black");    
    if(mousePosition.x < renderX || mousePosition.y >= renderY + height) {
      this.activeMenuIndex = -1;
    }    
  }
  drawSettings(x,y) {
    let width = 196;
    let height = 256+40;
    let renderY = y-3;
    let renderX = x+1;
        
    this.drawBox(renderX, renderY + 36, width, 62, "rgba(181, 181, 181, 0.627)");
    this.drawBox(renderX, renderY + 98, width, 68, "rgba(201, 201, 201, 0.627)");
    this.drawBox(renderX, renderY + 166, width, 90, "rgba(181, 181, 181, 0.627)");
    this.drawBox(renderX, renderY + 256, width, 40, "rgba(201, 201, 201, 0.627)");
    
    let j1 = renderX + 3;
    let l1 = renderY + 49;
    
    this.drawText("Game options - click to toggle", j1, l1, 9, "black");
    l1 += 15;
    this.drawLabel("Camera angle mode - ", "     Auto", j1, l1, 9, "white", "rgb(0,255,0)");
    l1 += 15;
    this.drawLabel("Mouse buttons - ", " Two", j1, l1, 9, "white", "rgb(0,255,0)");
    l1 += 15;    
    this.drawLabel("Sound effects - ", " on", j1, l1, 9, "white", "rgb(0,255,0)");
    l1 += 17;    
       
    this.drawShadowText("To achange your contact details", j1, l1, 8, "rgb(240,240,240)");
    l1 += 15;    
    this.drawShadowText("password, recovery questions, etc.", j1, l1, 8, "rgb(240,240,240)");
    l1 += 15;        
    this.drawShadowText("please select account management", j1, l1, 8, "rgb(240,240,240)");
    l1 += 15;        
    this.drawShadowText("from the runescap.com front page", j1, l1, 8, "rgb(240,240,240)");
    l1 += 19;    
    
    this.drawText("Privacy settings. Will be applied to", j1, l1, 9, "black");
    l1 += 15;
    this.drawText("all people not on your friends list", j1, l1, 9, "black");
    l1 += 15;
    this.drawLabel("Block chat messages: ", "     <off>", j1, l1, 9, "white", "rgb(255,0,0)");
    l1 += 15;
    this.drawLabel("Block private messages: ", "<off>", j1, l1, 9, "white", "rgb(255,0,0)");
    l1 += 15;    
    this.drawLabel("Block trade requests: ", "<off>", j1, l1, 9, "white", "rgb(255,0,0)");
    l1 += 15;    
    this.drawLabel("Block duel requests: ", "<off>", j1, l1, 9, "white", "rgb(255,0,0)");
    l1 += 17;
    this.drawText("Always logout when you finish", j1, l1, 9, "black");
    l1 += 15;
        
    if (mousePosition.x > j1-3 && mousePosition.y >= l1-11 && mousePosition.x <= renderX + width && mousePosition.y < renderY + height) {
      this.drawShadowText("Click here to logout", j1, l1, 9, "yellow");
      if (isMouseDown) {
        state = states_login;
      }
    } else {
      this.drawShadowText("Click here to logout", j1, l1, 9, "white");
    }
       
    
    
    if(mousePosition.x < renderX || mousePosition.y >= renderY + height) {
      this.activeMenuIndex = -1;
    }       
  }
  
  update(elapsed) {    
  }
}

class CharacterCreatorView {
  constructor() {    
    this.character = new Character();
  }
  
  draw(x, y) {        
    if (this.character.isLoaded(0) === false || this.character.isLoaded(2) === false || this.character.isLoaded(4) === false) {
      ctx.font = `bold 12pt Calibri`;
      ctx.fillStyle = "white";     
      let text = "Loading... Please wait";
      let size = ctx.measureText(text);
      ctx.fillText(text, x + clientWidth / 2 - size.width / 2, y + 180);
      return;
    }
    this.drawCharacter(x, y);    
    this.drawTexts(x, y);
    this.drawButtons(x, y);
    this.drawBorder(x, y - 40);    
    this.drawBorder(x, y + 325);    
  }  
  
  update(elapsed) { } 

  drawTexts(x, y) {    
    ctx.font = "bold 14pt Calibri";
    ctx.fillStyle = "white";
    let headerText = "Please design Your Character";        
    let headerSize = ctx.measureText(headerText);    
    ctx.fillText(headerText, x + clientWidth/2 - headerSize.width/2, y-10);    
    ctx.font = "bold 10pt Calibri";
    ctx.fillText("Front", x + 175, y + 115);
    ctx.fillText("Side", x + 240, y + 115);
    ctx.fillText("Back", x + 305, y + 115);        
  }
  
  drawArrowButtonTexts(x, y) {     
    ctx.fillStyle = "white";
    ctx.font = "10pt Calibri";
    let yoff = -10;
    // left col    
    ctx.fillText("Head", x + 170, y + yoff + 160);
    ctx.fillText("Type", x + 170, y + yoff + 175);    
    ctx.fillText("Gender", x + 165, y+ yoff + 209);        
    ctx.fillText("Skin", x + 173, y + yoff + 245);
    ctx.fillText("Color", x + 170, y + yoff + 260);    
    // right col    
    ctx.fillText("Hair", x + 303, y+ yoff  + 160);
    ctx.fillText("Color", x + 300, y+ yoff  + 175);    
    ctx.fillText("Top", x + 305, y + yoff + 202);    
    ctx.fillText("Color", x + 300, y + yoff + 217);        
    ctx.fillText("Bottom", x + 295, y + yoff + 245);
    ctx.fillText("Color", x + 300, y + yoff + 260);    
  }
  
  drawCharacter(x, y) {    
    this.character.draw(x + 90 + 82,  y + 5, 0);
    this.character.draw(x + 90 + 143, y + 5, 2);
    this.character.draw(x + 90 + 210, y + 5, 4);
  }
  
  drawArrowButtons(x, y) {
    this.drawArrowButtonTexts(x, y);    
    this.drawButtonBorders(x, y-2);    
    // head
    if (this.drawArrowButton(x+134, y+145, 1)) {      
      this.character.head--;
      if (this.character.head < 0) this.character.head = 0;
    }
    if (this.drawArrowButton(x+214, y+145, 0)) {            
      this.character.head++;
      if (this.character.head > 4) this.character.head = 4;
    }    
    // gender
    if (this.drawArrowButton(x+134, y+187, 1)) {      
      this.character.gender = 0;
    }
    if (this.drawArrowButton(x+214, y+187, 0)) {            
      this.character.gender = 1;
    }    
    // skin color
    if (this.drawArrowButton(x+134, y+230, 1)) {      
      this.character.skin--;
      if (this.character.skin < 0) this.character.skin = 0;
    }
    if (this.drawArrowButton(x+214, y+230, 0)) {            
      this.character.skin++;
      if (this.character.skin > 4) this.character.skin = 4;
    }
    
    // hair color
    if (this.drawArrowButton(x+264, y+145, 1)) {      
      this.character.hair--;
      if (this.character.hair < 0) this.character.hair = 0;
    }
    if (this.drawArrowButton(x+344, y+145, 0)) {            
      this.character.hair++;
      if (this.character.hair > 4) this.character.hair = 4;
    }    
    // top color
    if (this.drawArrowButton(x+264, y+187, 1)) {      
      this.character.top--;
      if (this.character.top < 0) this.character.top = 0;
    }
    if (this.drawArrowButton(x+344, y+187, 0)) {            
      this.character.top++;
      if (this.character.top > 4) this.character.top = 4;
    }    
    // bottom color
    if (this.drawArrowButton(x+264, y+230, 1)) {      
      this.character.bottom--;
      if (this.character.bottom < 0) this.character.bottom = 0;
    }    
    if (this.drawArrowButton(x+344, y+230, 0)) {            
      this.character.bottom++;
      if (this.character.bottom > 4) this.character.bottom = 4;
    }
  }
  
  drawButtons(x, y) {        
    this.btnIndex = 0;
    if (views[states_login].drawButton("Accept", x + (clientWidth / 2) - 100, y + 275, 200, 30)) {
      state = states_load;
      views[states_load].isLoading = false;
      views[states_game].character = this.character;
    }    
    this.drawArrowButtons(x+6, y);
  }
  
  drawButtonBorders(x, y) {    
    this.drawButtonBorder(x + 158, y + 137, 52, 36);
    this.drawButtonBorder(x + 158, y + 179, 52, 36);
    this.drawButtonBorder(x + 158, y + 222, 52, 36);    
    this.drawButtonBorder(x + 288, y + 137, 52, 36);
    this.drawButtonBorder(x + 288, y + 179, 52, 36);
    this.drawButtonBorder(x + 288, y + 222, 52, 36);
  }
  
  drawButtonBorder(x, y, width, height) {    
    let outerBorderlight  = 'rgb(135, 146, 179)';
    ctx.fillStyle = outerBorderlight;  
    ctx.lineWidth=2;
    let radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();       
  }
  
  drawArrowButton(x, y, direction) {   
    let width = 20;
    let height = 17;
    let index  = this.btnIndex++;    
    sprites[`arrow-${direction}`].draw(x, y);
    if (isMouseDown === false && this.btnDown === index
        && mousePosition.x >= x && mousePosition.x < x+width
        && mousePosition.y >= y && mousePosition.y < y+height) {
        this.btnDown = -1;
        return true;
    }    
    if (isMouseDown === true 
        && mousePosition.x >= x && mousePosition.x < x+width
        && mousePosition.y >= y && mousePosition.y < y+height) {          
          this.btnDown = index;          
    }    
    return false;    
  }  
  
  drawBorder(x, y) {
    let renderY = y;
    let height = 10;
    let width  = clientWidth;
    var grd = ctx.createLinearGradient(x, renderY, x, renderY + height);
    grd.addColorStop(0, "rgba(0, 102, 128, 0)");
    grd.addColorStop(0.5, "rgb(0, 102, 128)");
    grd.addColorStop(1, "rgba(0, 102, 128, 0)");
    
    ctx.fillStyle = grd;    
    ctx.fillRect(x, renderY, width, height);
  }
}


class Sprite {
  constructor(name, image) {
    this.name = name;
    this.src = image;  
    this.width = image.width;
    this.height = image.height;
  }
  
  getWidth() {
    this.width = this.src.width;
    return this.src.width;
  }
  
  getHeight() {    
    this.height = this.src.height;
    return this.src.height;
  }
  
  isLoaded() {
    if (!this.src.complete) {
        return false;
    }
    if (typeof this.src.naturalWidth !== "undefined" && this.src.naturalWidth === 0) {
        return false;
    }
    return true;
  }
  
  draw(x, y) {
    if (this.src) {
      /* if(colorTint) {        
        spriteEditorCtx.drawImage(this.src, 0, 0);
        let data = spriteEditorCtx.getImageData(0, 0, editorWidth, editorHeight);        
      } */
      ctx.drawImage(this.src, x, y);
    }
  }
  
  drawExact(sx, sy, swidth, sheight, x, y, width = 0, height = 0) {
    if (this.src) { 
      if (swidth === 0) swidth = this.getWidth();
      if (sheight === 0) sheight = this.getHeight();
      if (width === 0) width = this.getWidth();
      if (height === 0) height = this.getHeight();
      ctx.drawImage(this.src, sx, sy, swidth, sheight, x, y, width, height)
    }
  }
}

canvas.addEventListener('mousemove', evt => mousePosition = getMousePos(canvas, evt), false);
window.addEventListener('mousedown', evt => isMouseDown = true, false);
window.addEventListener('touchstart', evt => isMouseDown = true, false);
window.addEventListener('touchend', evt => isMouseDown = false, false);
window.addEventListener('mouseup', evt => isMouseDown = false, false);
window.addEventListener('keydown', evt =>  { keyboard[evt.which] = true; keyboard.shift = evt.shiftKey; keyboard.back = evt.keyCode === 8; }, false);
window.addEventListener('keyup', evt => { keyboard[evt.which] = false; keyboard.shift = evt.shiftKey; keyboard.back = false; }, false);
window.addEventListener('resize', () => {
  canvas.width = Math.max(clientWidth, window.innerWidth-32);
  canvas.height = Math.max(clientHeight, window.innerHeight-32); 
}, false);

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function loadSprites() {
  let spriteElements = document.querySelectorAll(".sprite");
  for(let img of spriteElements) {
    let name = img.classList[1];       
    sprites[name] = new Sprite(name, img, 0, 0);    
  }
}

function createViews() {
  views[states_login]  = new LoginView();
  views[states_create] = new CharacterCreatorView();
  views[states_load]   = new LoadWorldView();
  views[states_game]   = new GameView();
}

const run = function(e) {  
  update(e);
  draw();  
  window.requestAnimationFrame(run);
};

const update = function(elapsed) {
  views[state].update(elapsed);
};

const draw = function() {    
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  views[state].draw(canvas.width / 2 - (clientWidth/2), 50); 
};

loadSprites();
createViews();
run();

if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 ){
    views[states_login].username = "xx awesome xx";
    views[states_login].password = "blablabala";
}
