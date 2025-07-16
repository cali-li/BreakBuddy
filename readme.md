# BreakBuddy - Break Time Reminder App

 

A friendly Electron app that reminds you to take healthy breaks during your work sessions.

 

## Features

 

- ⏰ **Customizable Work/Rest Intervals**: Set your preferred work and break durations

- 🔔 **Smart Reminders**: Get gentle reminders when work time ends

- 🛡️ **Screen Protector**: Forces you to rest after ignoring reminders

- 🎵 **Custom Sound Notifications**: Play your own MP3 files for work/rest alerts

- ⌨️ **Global Shortcuts**: Press Ctrl+Shift+B to show the app anytime

- 💾 **Settings Persistence**: Your preferences are saved automatically

 

## Quick Start

 

### Prerequisites

- Node.js (version 14 or higher)

- npm (comes with Node.js)

 

### Installation

 

1. **Install Dependencies**:

   ```bash

   npm install

   ```

 

2. **Add Sound Files** (Optional):

   - Create a `clock_chime` folder in the root directory

   - Add your MP3 files:

     - `work_time_is_up.mp3` - Plays when work time ends

     - `rest_time_is_up.mp3` - Plays when rest time ends

 

3. **Run the App**:

   ```bash

   # Main app (45 min work, 5 min rest)

   npm start

  

   # Demo mode (6 seconds each)

   npm run demo

  

   # Quick test (1 minute each)

   npm test

   ```

 

## File Structure

 

```

break-buddy/

├── src/

│   ├── main.js              # Main Electron process

│   ├── index.html           # Main app UI

│   ├── renderer.js          # Main app logic

│   ├── styles.css           # Main app styling

│   ├── reminder.html        # Reminder popup UI

│   ├── reminder.js          # Reminder logic

│   ├── reminder-styles.css  # Reminder styling

│   ├── screen-protector.html # Screen protector UI

│   ├── screen-protector.js  # Screen protector logic

│   └── screen-protector-styles.css # Screen protector styling

├── clock_chime/             # Sound files (optional)

│   ├── work_time_is_up.mp3

│   └── rest_time_is_up.mp3

├── demo.js                  # Demo version (6-second timers)

├── test-quick.js           # Quick test version (1-minute timers)

├── package.json            # Dependencies and scripts

└── README.md              # This file

```

 

## How It Works

 

1. **Work Session**: Set your work duration and start the timer

2. **First Reminder**: When work time ends, you get a friendly reminder

3. **Second Reminder**: If you continue working, you get another reminder

4. **Screen Protector**: After 2 reminders, BreakBuddy forces you to rest

5. **Rest Session**: Take your break while the screen protector is active

6. **Repeat**: After rest time, you're back to work!

 

## Commands

 

- `npm start` - Run the main app (45 min work, 5 min rest)

- `npm run demo` - Run demo mode (6 seconds each)

- `npm test` - Run quick test (1 minute each)

- `npm run build` - Build the app for distribution

 

## Global Shortcuts

 

- `Ctrl+Shift+B` - Show/hide the main window

 

## Customization

 

### Sound Files

- Place your MP3 files in the `clock_chime` folder

- Name them exactly: `work_time_is_up.mp3` and `rest_time_is_up.mp3`

- The app will play these sounds when timers complete

 

### Timer Settings

- Work time: 1-120 minutes (default: 45)

- Rest time: 1-30 minutes (default: 5)

- Settings are saved automatically

 

## Troubleshooting

 

### Sound Not Working

- Ensure MP3 files exist in `clock_chime` folder

- Check file names are exactly as specified

- App will fall back to console beep if files are missing

 

### App Not Starting

- Make sure Node.js is installed (version 14+)

- Run `npm install` to install dependencies

- Check console for error messages

 

### Screen Protector Issues

- The screen protector is designed to stay on top

- It will automatically close when rest time is complete

- If stuck, restart the app

 

## Development

 

### Adding Features

- Main logic is in `src/main.js`

- UI is in `src/index.html` and `src/renderer.js`

- Reminder system is in `src/reminder.js`

- Screen protector is in `src/screen-protector.js`

 

### Building for Distribution

```bash

npm run build

```

 

This creates distributable packages for Windows, macOS, and Linux.

 

## License

 

MIT License - Feel free to modify and distribute!

 

## Support

 

If you encounter issues:

1. Check the console for error messages

2. Ensure all dependencies are installed

3. Verify sound files are in the correct location

4. Try running in demo mode first

 

Enjoy your healthy work breaks! 🎉