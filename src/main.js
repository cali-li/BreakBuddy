const { app, BrowserWindow, ipcMain, screen, globalShortcut, dialog } = require('electron');

const path = require('path');

const Store = require('electron-store');

const fs = require('fs');

 

const store = new Store();

 

let mainWindow;

let reminderWindow;

let screenProtectorWindows = []; // Array to hold multiple screen protector windows

let timerInterval;

let isWorking = true;

let reminderCount = 0;

let settings = {

  workTime: 45, // minutes

  restTime: 5,  // minutes

  reminderCount: 0

};

 

// Function to play custom MP3 sounds for work and rest time

function playBeepSound(isWorkTime = true) {

  try {

    // Get the path to the clock_chime folder (in root directory)

    const clockChimePath = path.join(__dirname, '..', 'clock_chime');

   

    if (isWorkTime) {

      // Play work time sound

      const workSoundPath = path.join(clockChimePath, 'work_time_is_up.mp3');

     

      // Check if file exists

      if (fs.existsSync(workSoundPath)) {

        // Send to renderer process to play using Web Audio API

        if (mainWindow && !mainWindow.isDestroyed()) {

          mainWindow.webContents.send('play-sound', workSoundPath);

        }

        console.log('Work time is up! - Playing work sound');

      } else {

        console.log('Work sound file not found:', workSoundPath);

        console.log('\x07'); // Fallback console beep

      }

    } else {

      // Play rest time sound

      const restSoundPath = path.join(clockChimePath, 'rest_time_is_up.mp3');

     

      // Check if file exists

      if (fs.existsSync(restSoundPath)) {

        // Send to renderer process to play using Web Audio API

        if (mainWindow && !mainWindow.isDestroyed()) {

          mainWindow.webContents.send('play-sound', restSoundPath);

        }

        console.log('Rest time is up! - Playing rest sound');

      } else {

        console.log('Rest sound file not found:', restSoundPath);

        console.log('\x07'); // Fallback console beep

      }

    }

  } catch (error) {

    console.log('Sound playback error:', error.message);

    console.log('\x07'); // Fallback console beep

  }

}

 

// Load settings from store

function loadSettings() {

  const savedSettings = store.get('settings');

  if (savedSettings) {

    settings = { ...settings, ...savedSettings };

  } else {

  }

}

 

// Save settings to store

function saveSettings() {

  store.set('settings', settings);

}

 

function createMainWindow() {

  mainWindow = new BrowserWindow({

    width: 800,

    height: 600,

    webPreferences: {

      nodeIntegration: true,

      contextIsolation: false

    },

    resizable: false,

    minimizable: true,

    maximizable: false,

    alwaysOnTop: false

  });

 

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // mainWindow.webContents.openDevTools(); // Open dev tools for testing

 

  mainWindow.on('closed', () => {

    mainWindow = null;

  });

}

 

function createReminderWindow() {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

 

  reminderWindow = new BrowserWindow({

    width: width, // Full screen width

    height: height, // Full screen height

    x: 0, // Start at top-left corner

    y: 0, // Start at top-left corner

    webPreferences: {

      nodeIntegration: true,

      contextIsolation: false

    },

    alwaysOnTop: true,

    resizable: false,

    minimizable: false,

    maximizable: false,

    skipTaskbar: true,

    frame: false,

    transparent: true,

    focusable: true,

    show: false // Don't show until ready

  });

 

  reminderWindow.loadFile(path.join(__dirname, 'reminder.html'));

 

  // Ensure reminder stays on top with highest priority

  reminderWindow.setAlwaysOnTop(true, 'screen-saver', 1);

 

  // Show the window after it's loaded and ensure it's on top

  reminderWindow.once('ready-to-show', () => {

    reminderWindow.show();

    reminderWindow.focus();

    reminderWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  });

 

  // Keep it always on top and focused

  reminderWindow.on('blur', () => {

    reminderWindow.focus();

    reminderWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  });

 

  // Track window close events

  reminderWindow.on('closed', () => {

    reminderWindow = null;

  });

}

 

function createScreenProtector() {

  // Get all displays

  const displays = screen.getAllDisplays();

  console.log(`Creating screen protectors for ${displays.length} displays`);

 

  // Clear any existing screen protectors first

  if (screenProtectorWindows && screenProtectorWindows.length > 0) {

    console.log('Clearing existing screen protectors...');

    screenProtectorWindows.forEach((window, index) => {

      if (window && !window.isDestroyed()) {

        try {

          window.destroy();

        } catch (error) {

          console.log(`Error destroying existing screen protector ${index + 1}:`, error);

        }

      }

    });

    screenProtectorWindows = [];

  }

 

  // Create screen protector for each display

  displays.forEach((display, index) => {

    console.log(`Creating screen protector ${index + 1}/${displays.length} for display:`, {

      x: display.bounds.x,

      y: display.bounds.y,

      width: display.size.width,

      height: display.size.height

    });

   

    const screenProtectorWindow = new BrowserWindow({

      width: display.size.width,

      height: display.size.height,

      x: display.bounds.x,

      y: display.bounds.y,

      webPreferences: {

        nodeIntegration: true,

        contextIsolation: false

      },

      alwaysOnTop: true,

      resizable: false,

      minimizable: false,

      maximizable: false,

      skipTaskbar: true,

      frame: false,

      transparent: true,

      focusable: false, // Prevent focus to make it harder to bypass

      show: false // Don't show until ready

    });

 

    screenProtectorWindow.loadFile(path.join(__dirname, 'screen-protector.html'));

   

    // Ensure screen protector stays on top of all applications

    screenProtectorWindow.setAlwaysOnTop(true, 'screen-saver', 1);

   

    // Show the window after it's loaded

    screenProtectorWindow.once('ready-to-show', () => {

      screenProtectorWindow.show();

      screenProtectorWindow.focus();

      screenProtectorWindow.setAlwaysOnTop(true, 'screen-saver', 1);

      console.log(`Screen protector ${index + 1} is now visible`);

    });

   

    // Keep it always on top

    screenProtectorWindow.on('blur', () => {

      screenProtectorWindow.focus();

      screenProtectorWindow.setAlwaysOnTop(true, 'screen-saver', 1);

    });

   

    // Track window close events

    screenProtectorWindow.on('closed', () => {

      console.log(`Screen protector ${index + 1} was closed`);

      // Remove from our tracking array

      if (screenProtectorWindows) {

        const windowIndex = screenProtectorWindows.indexOf(screenProtectorWindow);

        if (windowIndex > -1) {

          screenProtectorWindows.splice(windowIndex, 1);

          console.log(`Removed screen protector ${index + 1} from tracking array`);

        }

      }

    });

   

    // Store reference to this window

    if (!screenProtectorWindows) {

      screenProtectorWindows = [];

    }

    screenProtectorWindows.push(screenProtectorWindow);

    console.log(`Added screen protector ${index + 1} to tracking array. Total: ${screenProtectorWindows.length}`);

  });

 

  console.log(`Created ${screenProtectorWindows.length} screen protectors total`);

 

  // Let the screen protector handle its own closing via its countdown

  const restTimeMs = settings.restTime * 60 * 1000;

  setTimeout(() => {

    console.log('Auto-closing screen protectors on all screens...');

    console.log(`Found ${screenProtectorWindows ? screenProtectorWindows.length : 0} screen protectors to close`);

   

    if (screenProtectorWindows && screenProtectorWindows.length > 0) {

      screenProtectorWindows.forEach((window, index) => {

        if (window && !window.isDestroyed()) {

          try {

            console.log(`Auto-closing screen protector ${index + 1}/${screenProtectorWindows.length}`);

            window.close();

          } catch (error) {

            console.log(`Error auto-closing screen protector ${index + 1}:`, error);

          }

        } else {

          console.log(`Screen protector ${index + 1} is already destroyed or null`);

        }

      });

      screenProtectorWindows = [];

    } else {

      console.log('No screen protectors found to auto-close');

    }

    console.log('All screen protectors auto-closed');

  }, restTimeMs + 1000); // Add 1 second buffer

}

 

function startTimer() {

  // Clear any existing timer first

  stopTimer();

 

  const interval = isWorking ? settings.workTime * 60 * 1000 : settings.restTime * 60 * 1000;

 

  timerInterval = setInterval(() => {

    // Clear the interval immediately to prevent overlapping

    clearInterval(timerInterval);

    timerInterval = null;

   

    if (isWorking) {

      // Work time is up, show reminder

      reminderCount++;

     

      // Play beep sound for work time completion

      playBeepSound(true);

     

      if (reminderCount <= 2) {

        createReminderWindow();

        // Don't start a new timer here - wait for user action

      } else {

        // Force break with screen protector

        startForcedBreak();

      }

    } else {

      // Rest time is up, start working again

      console.log('Rest time ended - closing all screen protectors...');

      console.log(`Found ${screenProtectorWindows ? screenProtectorWindows.length : 0} screen protectors to close`);

     

      if (screenProtectorWindows && screenProtectorWindows.length > 0) {

        // Create a copy of the array to avoid modification during iteration

        const windowsToClose = [...screenProtectorWindows];

        console.log(`Will close ${windowsToClose.length} screen protectors`);

       

        windowsToClose.forEach((window, index) => {

          if (window && !window.isDestroyed()) {

            try {

              console.log(`Timer closing screen protector ${index + 1}/${windowsToClose.length}`);

              window.destroy();

            } catch (error) {

              console.log(`Error destroying screen protector ${index + 1}:`, error);

            }

          } else {

            console.log(`Screen protector ${index + 1} is already destroyed or null`);

          }

        });

       

        // Clear the array after closing all windows

        screenProtectorWindows = [];

        console.log('All screen protectors closed by timer');

      } else {

        console.log('No screen protectors found to close by timer');

      }

     

      // Play beep sound for rest time completion

      playBeepSound(false);

     

      isWorking = true;

      reminderCount = 0;

      startTimer(); // Start the work timer immediately

    }

  }, interval);

}

 

function stopTimer() {

  if (timerInterval) {

    clearInterval(timerInterval);

    timerInterval = null;

  }

}

 

// Function to start rest timer immediately (normal break)

function startRestTimer() {

  stopTimer();

 

  // Close any existing reminder window

  if (reminderWindow) {

    reminderWindow.close();

    reminderWindow = null;

  }

 

  isWorking = false;

  reminderCount = 0;

  startTimer(); // Start rest timer

}

 

// Function to start forced break with screen protector

function startForcedBreak() {

  stopTimer();

 

  // Close any existing reminder window

  if (reminderWindow) {

    reminderWindow.close();

    reminderWindow = null;

  }

 

  // Create screen protector immediately for forced break

  createScreenProtector();

 

  isWorking = false;

  reminderCount = 0;

  startTimer(); // Start rest timer

}

 

// Function to handle reminder intervals (3 minutes between reminders)

function startReminderInterval() {

  stopTimer();

 

  // Start a 3-minute timer for the next reminder

  timerInterval = setInterval(() => {

    clearInterval(timerInterval);

    timerInterval = null;

   

    reminderCount++;

    if (reminderCount <= 2) {

      createReminderWindow();

    } else {

      // Force break with screen protector

      startForcedBreak();

    }

  }, 3 * 60 * 1000); // 3 minutes

}

 

// IPC handlers

ipcMain.handle('get-settings', () => {

  return settings;

});

 

ipcMain.handle('save-settings', (event, newSettings) => {

  settings = { ...settings, ...newSettings };

  saveSettings();

  return settings;

});

 

ipcMain.handle('start-timer', () => {

  stopTimer();

  isWorking = true;

  reminderCount = 0;

  startTimer();

  return { isWorking, reminderCount };

});

 

ipcMain.handle('stop-timer', () => {

  stopTimer();

  isWorking = false;

  reminderCount = 0;

  return { isWorking, reminderCount };

});

 

ipcMain.handle('get-timer-status', () => {

  return { isWorking, reminderCount };

});

 

ipcMain.handle('close-reminder', () => {

  if (reminderWindow) {

    reminderWindow.close();

    reminderWindow = null;

  }

 

  // Start 3-minute reminder interval

  startReminderInterval();

 

  return true;

});

 

ipcMain.handle('take-break-now', () => {

  if (reminderWindow) {

    reminderWindow.close();

    reminderWindow = null;

  }

  startRestTimer();

  return true;

});

 

ipcMain.handle('close-screen-protector', () => {

  console.log('Manual close requested - closing all screen protectors...');

  if (screenProtectorWindows && screenProtectorWindows.length > 0) {

    screenProtectorWindows.forEach((window, index) => {

      if (window && !window.isDestroyed()) {

        try {

          console.log(`Closing screen protector ${index + 1}/${screenProtectorWindows.length}`);

          window.destroy();

        } catch (error) {

          console.log(`Error destroying screen protector ${index + 1}:`, error);

        }

      }

    });

    screenProtectorWindows = [];

  }

 

  // Start the next work timer after closing

  // Stop any existing timer first

  stopTimer();

 

  // Close any existing reminder windows to prevent immediate reminders

  if (reminderWindow) {

    reminderWindow.close();

    reminderWindow = null;

  }

 

  setTimeout(() => {

    isWorking = true;

    reminderCount = 0; // Ensure reminder count is 0 for fresh start

    startTimer();

  }, 5000); // 5-second buffer time as originally requested

 

  return true;

});

 

app.whenReady().then(() => {

  loadSettings();

  createMainWindow();

 

  // Register global shortcuts

  globalShortcut.register('CommandOrControl+Shift+B', () => {

    if (mainWindow) {

      mainWindow.show();

      mainWindow.focus();

    }

  });

});

 

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {

    app.quit();

  }

});

 

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {

    createMainWindow();

  }

});

 

app.on('will-quit', () => {

  globalShortcut.unregisterAll();

  stopTimer();

});

