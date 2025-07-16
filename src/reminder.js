const { ipcRenderer } = require('electron');

 

// DOM elements

const takeBreakBtn = document.getElementById('take-break-btn');

const continueWorkingBtn = document.getElementById('continue-working-btn');

const reminderNumber = document.getElementById('reminder-number');

 

// Get reminder number from URL parameters or default to 1

const urlParams = new URLSearchParams(window.location.search);

const reminderCount = parseInt(urlParams.get('reminder') || '1');

reminderNumber.textContent = reminderCount;

 

// Function to close window safely

function closeWindow() {

  try {

    window.close();

  } catch (error) {

    console.log('Window close error:', error);

  }

}

 

// Handle take break button

takeBreakBtn.addEventListener('click', async () => {

  try {

    // Disable button to prevent double-clicks

    takeBreakBtn.disabled = true;

    takeBreakBtn.textContent = 'Starting Break...';

   

    await ipcRenderer.invoke('take-break-now');

    closeWindow();

  } catch (error) {

    console.log('Take break error:', error);

    closeWindow();

  }

});

 

// Handle continue working button

continueWorkingBtn.addEventListener('click', async () => {

  try {

    // Disable button to prevent double-clicks

    continueWorkingBtn.disabled = true;

    continueWorkingBtn.textContent = 'Continuing...';

   

    await ipcRenderer.invoke('close-reminder');

    closeWindow();

  } catch (error) {

    console.log('Continue working error:', error);

    closeWindow();

  }

});

 

// Removed auto-close timeout - reminder stays until user clicks a button

 

// Add some visual feedback for button interactions

[takeBreakBtn, continueWorkingBtn].forEach(btn => {

  btn.addEventListener('mousedown', () => {

    if (!btn.disabled) {

      btn.style.transform = 'scale(0.95)';

    }

  });

 

  btn.addEventListener('mouseup', () => {

    if (!btn.disabled) {

      btn.style.transform = 'scale(1)';

    }

  });

 

  btn.addEventListener('mouseleave', () => {

    if (!btn.disabled) {

      btn.style.transform = 'scale(1)';

    }

  });

});

 

// Ensure window stays on top

setInterval(() => {

  try {

    // This will help keep the window focused

    if (window && !window.closed) {

      window.focus();

    }

  } catch (error) {

    // Window might be closed

  }

}, 1000);