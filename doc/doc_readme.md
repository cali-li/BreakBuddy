## BreakBuddy - Break Time Reminder App

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