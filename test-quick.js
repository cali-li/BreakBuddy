const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');

const path = require('path');

const Store = require('electron-store');

 

const store = new Store();

 

let mainWindow;

let reminderWindow;

let screenProtectorWindow;

let timerInterval;

let isWorking = true;

let reminderCount = 0;

let settings = {

  workTime: 1, // 1 minute for testing

  restTime: 1, // 1 minute for testing

  reminderCount: 0

};

 

// Load settings from store

function loadSettings() {

  const savedSettings = store.get('settings');

  if (savedSettings) {

    settings = { ...settings, ...savedSettings };

  }

}

 

// Save settings to store

function saveSettings() {

  store.set('settings', settings);

}

 

function createMainWindow() {

  mainWindow = new BrowserWindow({

    width: 800, // Doubled from 400

    height: 1200, // Doubled from 600

    webPreferences: {

      nodeIntegration: true,

      contextIsolation: false

    },

    resizable: false,

    minimizable: true,

    maximizable: false,

    alwaysOnTop: false

  });

 

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  // mainWindow.webContents.openDevTools(); // Open dev tools for testing

 

  mainWindow.on('closed', () => {

    mainWindow = null;

  });

}

 

function createReminderWindow() {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

 

  reminderWindow = new BrowserWindow({

    width: 800, // Doubled from 400

    height: 600, // Doubled from 300

    x: (width - 800) / 2, // Adjusted for new width

    y: (height - 600) / 2, // Adjusted for new height

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

    transparent: true

  });

 

  reminderWindow.loadFile(path.join(__dirname, 'src/reminder.html'));

  reminderWindow.setAlwaysOnTop(true, 'screen-saver');

}

 

function createScreenProtector() {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

 

  screenProtectorWindow = new BrowserWindow({

    width: width,

    height: height,

    x: 0,

    y: 0,

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

    focusable: false

  });

 

  screenProtectorWindow.loadFile(path.join(__dirname, 'src/screen-protector.html'));

  screenProtectorWindow.setAlwaysOnTop(true, 'screen-saver');

}

 

function startTimer() {

  const interval = isWorking ? settings.workTime * 60 * 1000 : settings.restTime * 60 * 1000;

 

  console.log(`Starting timer: ${isWorking ? 'Work' : 'Rest'} for ${interval/1000} seconds`);

 

  timerInterval = setInterval(() => {

    if (isWorking) {

      // Work time is up, show reminder

      reminderCount++;

      console.log(`Work time up! Reminder ${reminderCount}/2`);

     

      if (reminderCount <= 2) {

        createReminderWindow();

      } else {

        // Force break with screen protector

        console.log('Creating screen protector...');

        createScreenProtector();

        isWorking = false;

        reminderCount = 0;

        startTimer();

      }

    } else {

      // Rest time is up, start working again

      console.log('Rest time up! Starting work timer...');

      if (screenProtectorWindow) {

        screenProtectorWindow.close();

        screenProtectorWindow = null;

      }

      isWorking = true;

      reminderCount = 0;

      startTimer();

    }

  }, interval);

}

 

function stopTimer() {

  if (timerInterval) {

    clearInterval(timerInterval);

    timerInterval = null;

  }

}

 

// Function to start rest timer immediately

function startRestTimer() {

  console.log('Starting rest timer immediately...');

  stopTimer();

  isWorking = false;

  reminderCount = 0;

  startTimer();

}

 

// IPC handlers - only register if ipcMain is available

if (typeof ipcMain !== 'undefined') {

  ipcMain.handle('get-settings', () => {

    return settings;

  });

 

  ipcMain.handle('save-settings', (event, newSettings) => {

    settings = { ...settings, ...newSettings };

    saveSettings();

    return settings;

  });

 

  ipcMain.handle('start-timer', () => {

    console.log('Starting timer from UI...');

    stopTimer();

    isWorking = true;

    reminderCount = 0;

    startTimer();

    return { isWorking, reminderCount };

  });

 

  ipcMain.handle('stop-timer', () => {

    console.log('Stopping timer from UI...');

    stopTimer();

    isWorking = false;

    reminderCount = 0;

    return { isWorking, reminderCount };

  });

 

  ipcMain.handle('get-timer-status', () => {

    return { isWorking, reminderCount };

  });

 

  ipcMain.handle('close-reminder', () => {

    console.log('Closing reminder window...');

    if (reminderWindow) {

      reminderWindow.close();

      reminderWindow = null;

    }

    return true;

  });

 

  ipcMain.handle('take-break-now', () => {

    console.log('User chose to take break now');

    if (reminderWindow) {

      reminderWindow.close();

      reminderWindow = null;

    }

    startRestTimer();

    return true;

  });

 

  ipcMain.handle('close-screen-protector', () => {

    console.log('Closing screen protector...');

    if (screenProtectorWindow) {

      screenProtectorWindow.close();

      screenProtectorWindow = null;

    }

    return true;

  });

}

 

app.whenReady().then(() => {

  loadSettings();

  createMainWindow();

 

  console.log('Break Time Reminder App Started!');

  console.log('Test settings: Work time = 1 min, Rest time = 1 min');

  console.log('Press Ctrl+Shift+B to show the main window');

 

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