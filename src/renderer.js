const { ipcRenderer } = require('electron');

 

// DOM elements

const startBtn = document.getElementById('start-btn');

const stopBtn = document.getElementById('stop-btn');

const timerMinutes = document.getElementById('timer-minutes');

const timerSeconds = document.getElementById('timer-seconds');

const timerLabel = document.getElementById('timer-label');

const statusDot = document.getElementById('status-dot');

const statusText = document.getElementById('status-text');

const reminderCount = document.getElementById('reminder-count');

const workTimeInput = document.getElementById('work-time');

const restTimeInput = document.getElementById('rest-time');

const saveSettingsBtn = document.getElementById('save-settings');

const timerCircle = document.querySelector('.timer-circle');

 

let countdownInterval;

let currentTime = 0;

let isTimerRunning = false;

let currentSettings = null;

let isResting = false;

 

// Web Audio API setup for sound playback

let audioContext = null;

let audioBuffer = null;

 

// Initialize Web Audio API

function initAudio() {

  try {

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

  } catch (error) {

    console.log('Web Audio API not supported:', error);

  }

}

 

// Function to play audio file using Web Audio API

async function playAudioFile(filePath) {

  try {

    if (!audioContext) {

      initAudio();

    }

   

    if (!audioContext) {

      console.log('Audio context not available');

      return;

    }

   

    // Fetch the audio file

    const response = await fetch(`file://${filePath}`);

    const arrayBuffer = await response.arrayBuffer();

   

    // Decode the audio data

    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

   

    // Create audio source and play

    const source = audioContext.createBufferSource();

    source.buffer = audioBuffer;

    source.connect(audioContext.destination);

    source.start(0);

   

    console.log('Playing audio file:', filePath);

  } catch (error) {

    console.log('Audio playback failed:', error);

    // Fallback to console beep

    console.log('\x07');

  }

}

 

// Listen for play-sound messages from main process

ipcRenderer.on('play-sound', (event, filePath) => {

  playAudioFile(filePath);

});

 

// Initialize the app

async function init() {

  currentSettings = await ipcRenderer.invoke('get-settings');

  workTimeInput.value = currentSettings.workTime;

  restTimeInput.value = currentSettings.restTime;

 

  updateTimerDisplay(currentSettings.workTime * 60);

  updateStatus('Ready to work!', 'ready');

}

 

// Update timer display

function updateTimerDisplay(seconds) {

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

 

  timerMinutes.textContent = minutes.toString().padStart(2, '0');

  timerSeconds.textContent = remainingSeconds.toString().padStart(2, '0');

}

 

// Update status

function updateStatus(text, state) {

  statusText.textContent = text;

  statusDot.className = `status-dot ${state}`;

 

  // Update timer circle class for color changes

  if (state === 'resting') {

    timerCircle.classList.add('resting');

  } else {

    timerCircle.classList.remove('resting');

  }

}

 

// Start countdown timer

function startCountdown(duration) {

  currentTime = duration;

  updateTimerDisplay(currentTime);

 

  countdownInterval = setInterval(() => {

    currentTime--;

    updateTimerDisplay(currentTime);

   

    if (currentTime <= 0) {

      clearInterval(countdownInterval);

    }

  }, 1000);

}

 

// Stop countdown timer

function stopCountdown() {

  if (countdownInterval) {

    clearInterval(countdownInterval);

    countdownInterval = null;

  }

}

 

// Event listeners

startBtn.addEventListener('click', async () => {

  currentSettings = await ipcRenderer.invoke('get-settings');

  const result = await ipcRenderer.invoke('start-timer');

 

  isTimerRunning = true;

  isResting = false;

  startBtn.disabled = true;

  stopBtn.disabled = false;

 

  updateStatus('Working hard!', 'working');

  timerLabel.textContent = 'Work Time';

  startCountdown(currentSettings.workTime * 60);

 

  // Start polling for status updates

  pollTimerStatus();

});

 

stopBtn.addEventListener('click', async () => {

  const result = await ipcRenderer.invoke('stop-timer');

 

  isTimerRunning = false;

  isResting = false;

  startBtn.disabled = false;

  stopBtn.disabled = true;

 

  stopCountdown();

  updateStatus('Ready to work!', 'ready');

  timerLabel.textContent = 'Work Time';

  reminderCount.textContent = '';

 

  currentSettings = await ipcRenderer.invoke('get-settings');

  updateTimerDisplay(currentSettings.workTime * 60);

});

 

saveSettingsBtn.addEventListener('click', async () => {

  const newSettings = {

    workTime: parseInt(workTimeInput.value),

    restTime: parseInt(restTimeInput.value)

  };

 

  currentSettings = await ipcRenderer.invoke('save-settings', newSettings);

 

  if (!isTimerRunning) {

    updateTimerDisplay(currentSettings.workTime * 60);

  }

 

  // Show success feedback

  saveSettingsBtn.textContent = 'Saved!';

  setTimeout(() => {

    saveSettingsBtn.textContent = 'Save Settings';

  }, 2000);

});

 

// Poll timer status for updates

function pollTimerStatus() {

  const pollInterval = setInterval(async () => {

    if (!isTimerRunning) {

      clearInterval(pollInterval);

      return;

    }

   

    const status = await ipcRenderer.invoke('get-timer-status');

    currentSettings = await ipcRenderer.invoke('get-settings');

   

    if (status.isWorking && !isResting) {

      // Still working

      updateStatus('Working hard!', 'working');

      timerLabel.textContent = 'Work Time';

      reminderCount.textContent = status.reminderCount > 0 ?

        `Reminder ${status.reminderCount}/2` : '';

    } else if (!status.isWorking && !isResting) {

      // Just started resting

      isResting = true;

      updateStatus('Taking a well-deserved break!', 'resting');

      timerLabel.textContent = 'Break Time';

      reminderCount.textContent = '';

     

      // Stop current countdown and start rest countdown

      stopCountdown();

      startCountdown(currentSettings.restTime * 60);

    } else if (!status.isWorking && isResting) {

      // Still resting

      updateStatus('Taking a well-deserved break!', 'resting');

      timerLabel.textContent = 'Break Time';

      reminderCount.textContent = '';

    } else if (status.isWorking && isResting) {

      // Just finished resting, back to work

      isResting = false;

      updateStatus('Working hard!', 'working');

      timerLabel.textContent = 'Work Time';

      reminderCount.textContent = '';

     

      // Stop current countdown and start work countdown

      stopCountdown();

      startCountdown(currentSettings.workTime * 60);

    }

  }, 1000);

}

 

// Initialize when DOM is loaded

document.addEventListener('DOMContentLoaded', init);

 

// Handle window focus to refresh status

window.addEventListener('focus', async () => {

  if (isTimerRunning) {

    const status = await ipcRenderer.invoke('get-timer-status');

    currentSettings = await ipcRenderer.invoke('get-settings');

   

    if (status.isWorking) {

      updateStatus('Working hard!', 'working');

      timerLabel.textContent = 'Work Time';

      reminderCount.textContent = status.reminderCount > 0 ?

        `Reminder ${status.reminderCount}/2` : '';

    } else {

      updateStatus('Resting', 'resting');

      timerLabel.textContent = 'Rest Time';

      reminderCount.textContent = '';

    }

  }

});

 

// Listen for timer state changes from main process

ipcRenderer.on('timer-state-changed', async (event, data) => {

 

  if (isTimerRunning) {

    currentSettings = await ipcRenderer.invoke('get-settings');

   

    if (data.isWorking) {

      // Back to work mode

      isResting = false;

      updateStatus('Working hard!', 'working');

      timerLabel.textContent = 'Work Time';

      reminderCount.textContent = data.reminderCount > 0 ?

        `Reminder ${data.reminderCount}/2` : '';

     

      // Restart countdown for work time

      stopCountdown();

      startCountdown(currentSettings.workTime * 60);

    } else {

      // Break mode

      isResting = true;

      updateStatus('Taking a well-deserved break!', 'resting');

      timerLabel.textContent = 'Break Time';

      reminderCount.textContent = '';

     

      // Start countdown for break time

      stopCountdown();

      startCountdown(currentSettings.restTime * 60);

    }

  }

});