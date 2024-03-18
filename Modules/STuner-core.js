blank.jsconst radioButtons = document.querySelectorAll('input[name="ST-styleRadio"]');
const currentColorSpan = document.querySelector('#ST-CurrentColor span');
const colorPicker = document.getElementById('ST-colorPicker');
const opacitySlider = document.getElementById('opacity-slider');

// Store the original color when a radio button is checked
let originalColor = '';
radioButtons.forEach(radioButton => {
    radioButton.addEventListener('change', () => {
        const selectedVar = getSelectedVariable(radioButton.value);
        const sliderInput = document.querySelector('.slider-input');

        // Check if the selected radio button is for transparency
        if (radioButton.value === 'staticpage-transparency' || radioButton.value === 'hudoverlay-transparency') {
            // If it's for transparency, set the slider to its maximum value and update its value
            sliderInput.value = sliderInput.max;
            const opacityValue = getOpacityValue(selectedVar);
            opacitySlider.value = opacityValue;
        } else {
            // For other radio buttons, reset the slider to its maximum value and update color-related settings
            sliderInput.value = sliderInput.max;
            originalColor = getComputedStyle(document.documentElement).getPropertyValue(selectedVar).trim();
            colorPicker.value = originalColor;
            document.documentElement.style.setProperty('--current-color', originalColor);
        }
    });
});
// Additional event listener for the color picker
colorPicker.addEventListener('input', (event) => {
    const selectedVar = getSelectedVariable(getCheckedRadioButtonValue());
    document.documentElement.style.setProperty(selectedVar, event.target.value);
    
    // Set the --current-color variable
    document.documentElement.style.setProperty('--current-color', event.target.value);

    currentColorSpan.textContent = event.target.value;
    originalColor = event.target.value
});

function getCheckedRadioButtonValue() {
    return document.querySelector('input[name="ST-styleRadio"]:checked').value;
}

function getSelectedVariable(style) {
    switch (style) {
      case 'mainbody-text-color':
        return '--mainbody-text-color';
      case 'mainbody-bg-color':
        return '--mainbody-bg-color';
      case 'mainbody-transparency':
        return '--mainbody-opacity'; 
//scrollbar style root vars
      case 'scrollbar-bg-color':
        return '--scrollbar-bg-color';
      case 'scrollbar-border-color':
        return '--scrollbar-border-color';
      case 'scrollbar-thumb-border-color':
        return '--scrollbar-thumb-border-color';
//static page main style root vars??
      case 'staticpage-text-color':
        return '--staticpage-text-color';
      case 'staticpage-bg-color':
        return '--staticpage-bg-color';
      case 'staticpage-transparency':
        return '--staticpage-opacity';
      case 'staticpage-border-color':
        return '--staticpage-border-color';
/*staticpage border*//*
      case 'staticpage-border-width':
        return '--staticpage-border-width';
      case 'staticpage-border-style':
        return '--staticpage-border-style';
      case 'staticpage-border-radius':
        return '--staticpage-border-radius';
*/
        

//static page panel style root vars
      case 'staticpage-panels-border-color':
        return '--staticpage-panels-border-color';
/*staticpage panels border stuff*//*
      case 'staticpage-panels-border-width':
        return '--staticpage-panels-border-width';
      case 'staticpage-panels-border-style':
        return '--staticpage-panels-border-style';
      case 'staticpage-panels-border-radius':
        return '--staticpage-panels-border-radius';
*/
      case 'staticpage-panels-text-color':
        return '--staticpage-panels-text-color';
      case 'staticpage-panels-headertext-color':
        return '--staticpage-panels-headertext-color';
      case 'staticpage-panels-bg-color':
        return '--staticpage-panels-bg-color';
      case 'staticpage-panels-transparency':
        return '--staticpage-panels-opacity';
//static page Header/Footer panel style root vars
      case 'staticpage-HFpanels-border-color':
        return '--staticpage-HFpanels-border-color';
/*hfpanels border stuff*//*
      case 'staticpage-HFpanels-border-width':
        return '--staticpage-HFpanels-border-width';
      case 'staticpage-HFpanels-border-style':
        return '--staticpage-HFpanels-border-style';
      case 'staticpage-HFpanels-border-radius':
        return '--staticpage-HFpanels-border-radius';
*/
      case 'staticpage-HFpanels-text-color':
        return '--staticpage-HFpanels-text-color';
      case 'staticpage-HFpanels-bg-color':
        return '--staticpage-HFpanels-bg-color';
      case 'staticpage-HFpanels-transparency':
        return '--staticpage-HFpanels-opacity';
        

//static page side panels style root vars
      case 'staticpage-sidepanels-border-color':
        return '--staticpage-sidepanels-border-color';
/*staticpage side panels border stuff*//*
      case 'staticpage-sidepanels-border-width':
        return '--staticpage-sidepanels-border-width';
      case 'staticpage-sidepanels-border-style':
        return '--staticpage-sidepanels-border-style';
      case 'staticpage-sidepanels-border-radius':
        return '--staticpage-sidepanels-border-radius';
*/
      case 'staticpage-sidepanels-text-color':
        return '--staticpage-sidepanels-text-color';
      case 'staticpage-sidepanels-bg-color':
        return '--staticpage-sidepanels-bg-color';
      case 'staticpage-sidepanels-transparency':
        return '--staticpage-sidepanels-opacity';

//static page maincontent style root vars
      case 'staticpage-maincontent-border-color':
        return '--staticpage-maincontent-border-color';

/*staticpage maincontent border stuff*//*
      case 'staticpage-maincontent-border-width':
        return '--staticpage-maincontent-border-width';
      case 'staticpage-maincontent-border-style':
        return '--staticpage-maincontent-border-style';
      case 'staticpage-sidepanels-border-radius':
        return '--staticpage-maincontent-border-radius';
*/
      case 'staticpage-maincontent-text-color':
        return '--staticpage-maincontent-text-color';
      case 'staticpage-maincontent-bg-color':
        return '--staticpage-maincontent-bg-color';
      case 'staticpage-inner-bg-color':
        return '--staticpage-inner-bg-color';
      case 'staticpage-inner-transparency':
        return '--staticpage-inner-opacity';

//hudoverlay main style root vars
      case 'HUD-applet-border-color':
        return '--HUD-applet-border-color';
      case 'hudoverlay-border-color':
        return '--hudoverlay-border-color';
/*
      case 'hudoverlay-border-width':
        return '--hudoverlay-border-width';
      case 'hudoverlay-border-style':
        return '--hudoverlay-border-style';
      case 'hudoverlay-border-radius':
        return '--hudoverlay-border-radius';
*/
      case 'HUD-bg-color':
        return '--HUD-bg-color';
      case 'HUD-text-color':
        return '--HUD-text-color';
      case 'HUD-border-color':
        return '--HUD-border-color';
        
      case 'hudoverlay-bg-color':
        return '--hudoverlay-bg-color';
      case 'hudoverlay-transparency':
        return '--hudoverlay-opacity';
      case 'HUD-windows-bg-color':
        return '--HUD-windows-bg-color';
      case 'HUD-active-border-color':
        return '--HUD-active-border-color';
        
//unused example new root vars
/*
      case 'newradiobutton6':
        return '--newradiobutton6';
      case 'newradiobutton7':
        return '--newradiobutton7';
      case 'newradiobutton5':
        return '--newradiobutton5';
      case 'newradiobutton6':
        return '--newradiobutton6';
      case 'newradiobutton7':
        return '--newradiobutton7';
        // Add more cases if needed
*/
      default:
        return '';
    }
}

// Function to get the opacity value from the root variable
function getOpacityValue(selectedVar) {
    // Get the opacity value from the root variable
    const opacityString = getComputedStyle(document.documentElement).getPropertyValue(selectedVar).trim();
    // Convert the opacity string to a number
    return parseFloat(opacityString);
}


function setColorOpacity() {
  // set color to either rainbow or normal paint color 
	let newColor
  if (ifRainbowColor) {
    const hue = (frameCount * 2) % 360	
    newColor = color(`hsba(${hue}, 100%, 100%, 0.6)`)
  } else {
		newColor = paintColor
  }

  // set the color and opacity of the stroke and fill
  newColor.setAlpha(opacity)
  setrootvar(newColor)
}

opacitySlider.addEventListener('input', () => {
    const checkedRadioButtonValue = getCheckedRadioButtonValue();
    const selectedVar = getSelectedVariable(checkedRadioButtonValue);
    const opacity = opacitySlider.value;
    
    // Check if the selected radio button is for transparency
    if (checkedRadioButtonValue === 'staticpage-transparency' || 
        checkedRadioButtonValue === 'hudoverlay-transparency' ||
        checkedRadioButtonValue === 'mainbody-transparency') {
        // Set the opacity root variable directly
        document.documentElement.style.setProperty(selectedVar, opacity);
        console.log('checked button:', checkedRadioButtonValue);
        console.log('Selected var:', selectedVar);
        console.log('Slider value:', opacity);
        return; // Exit early since we've handled the transparency case
    }
    
    // For other cases (non-transparency), update color-related settings
    const rgbaColor = convertHexToRGBA(originalColor, opacity);
    document.documentElement.style.setProperty(selectedVar, rgbaColor);
    document.documentElement.style.setProperty('--current-color', rgbaColor);
    currentColorSpan.textContent = rgbaColor;
    console.log('checked button:', checkedRadioButtonValue);
    console.log('Selected var:', selectedVar);
    console.log('Slider value:', opacity);
});

// Helper function to convert hex color to RGBA with opacity
function convertHexToRGBA(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}

//==========================
// END OF STYLE TUNER CODE
//===========================