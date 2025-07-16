const { ipcRenderer } = require('electron');

 

// DOM elements

const minutesElement = document.getElementById('minutes');

const secondsElement = document.getElementById('seconds');

 

let countdownInterval;

let remainingTime = 0; // Will be set based on settings

 

// Get rest time from main process and start countdown

async function initializeTimer() {

  try {

    const settings = await ipcRenderer.invoke('get-settings');

    remainingTime = settings.restTime * 60; // Convert minutes to seconds

    console.log(`Screen protector: Starting countdown for ${remainingTime} seconds (${settings.restTime} minutes)`);

    startCountdown();

  } catch (error) {

    console.error('Error getting settings:', error);

    // Fallback to 5 minutes if settings can't be loaded

    remainingTime = 5 * 60;

    startCountdown();

  }

}

 

// Start countdown timer

function startCountdown() {

  updateDisplay();

 

  countdownInterval = setInterval(() => {

    remainingTime--;

    updateDisplay();

   

    if (remainingTime <= 0) {

      clearInterval(countdownInterval);

      console.log('Screen protector: Time up, closing window');

      // Close the window when time is up

      window.close();

    }

  }, 1000);

}

 

// Update display

function updateDisplay() {

  const minutes = Math.floor(remainingTime / 60);

  const seconds = remainingTime % 60;

 

  minutesElement.textContent = minutes.toString().padStart(2, '0');

  secondsElement.textContent = seconds.toString().padStart(2, '0');

 

  console.log(`Screen protector: ${minutes}:${seconds.toString().padStart(2, '0')} remaining`);

}

 

// Keep window on top

function keepOnTop() {

  // Try to focus the window

  window.focus();

 

  // Ensure the window stays on top

  if (window.electronAPI) {

    window.electronAPI.setAlwaysOnTop(true);

  }

}

 

// Set up periodic checks to keep window on top

setInterval(keepOnTop, 100);

 

// Prevent all user interactions

document.addEventListener('keydown', (e) => {

  // Allow some basic keyboard shortcuts for accessibility

  if (e.ctrlKey && e.key === 'c') return; // Copy

  if (e.ctrlKey && e.key === 'v') return; // Paste

  if (e.ctrlKey && e.key === 'z') return; // Undo

  if (e.ctrlKey && e.key === 'y') return; // Redo

  if (e.ctrlKey && e.key === 'a') return; // Select all

 

  // Block all other keyboard shortcuts

  e.preventDefault();

  e.stopPropagation();

});

 

document.addEventListener('keyup', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

document.addEventListener('mousedown', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

document.addEventListener('mouseup', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

document.addEventListener('click', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

document.addEventListener('contextmenu', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

document.addEventListener('wheel', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

// Prevent window from being closed by user

window.addEventListener('beforeunload', (e) => {

  e.preventDefault();

  e.returnValue = '';

  return '';

});

 

// Prevent window from being resized or moved

window.addEventListener('resize', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

window.addEventListener('move', (e) => {

  e.preventDefault();

  e.stopPropagation();

});

 

// Start the countdown when the page loads

document.addEventListener('DOMContentLoaded', () => {

  console.log('Screen protector: DOM loaded, initializing timer');

  initializeTimer();

});

 

// Handle window focus to ensure it stays on top

window.addEventListener('blur', () => {

  window.focus();

});

 

// Prevent any form of window manipulation

window.addEventListener('focus', () => {

  // Keep the window focused

});

 

// Disable right-click context menu

document.addEventListener('contextmenu', (e) => {

  e.preventDefault();

  return false;

});

 

// Prevent text selection

document.addEventListener('selectstart', (e) => {

  e.preventDefault();

  return false;

});

 

// Prevent drag and drop

document.addEventListener('dragstart', (e) => {

  e.preventDefault();

  return false;

});

 

document.addEventListener('drop', (e) => {

  e.preventDefault();

  return false;

});

 

document.addEventListener('dragover', (e) => {

  e.preventDefault();

  return false;

});

 

// Additional security measures

document.addEventListener('visibilitychange', () => {

  // If page becomes hidden, try to show it again

  if (document.hidden) {

    window.focus();

  }

});

 

// Prevent any form of window manipulation

window.addEventListener('load', () => {

  // Ensure window is on top

  window.focus();

 

  // Set up periodic focus checks

  setInterval(() => {

    if (!document.hasFocus()) {

      window.focus();

    }

  }, 500);

});