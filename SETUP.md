# VS Code Snake Game - Setup and Usage Guide

## ✅ Extension is Ready!

The VS Code Snake Game extension has been successfully created and compiled!

## 🎮 Features Implemented

✓ **Snake passes through empty lines** - No collision on blank lines
✓ **Code breaking effect** - When snake hits text, the line temporarily disappears (opacity 0.1 for 1 second)
✓ **Dynamic scoring** - Large files give more points per food (1 point per 10 lines)
✓ **Real-time gameplay** - Visual snake and food decorations
✓ **Arrow key controls** - Intuitive movement
✓ **Status bar** - Shows score, snake length, and points per food

## 📦 How to Test the Extension

### Method 1: Run in VS Code Extension Development Host

1. Open this folder in VS Code:
   ```bash
   code .
   ```

2. Press `F5` to launch the Extension Development Host

3. In the new window, open any file (larger files = more points!)

4. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac) to start the game

5. Use arrow keys to control the snake

6. Press `Escape` to exit

### Method 2: Install Locally

1. Package the extension:
   ```bash
   npx vsce package
   ```

2. Install the .vsix file:
   - VS Code → Extensions → ... → Install from VSIX

## 🎯 Game Mechanics

- **Snake Head**: Green highlighted character
- **Food**: ⭐ star icon
- **Controls**: Arrow keys (↑ ↓ ← →)
- **Exit**: Press `Escape`

### Scoring System
- File with 100 lines = 10 points per food
- File with 50 lines = 5 points per food
- File with 10 lines = 1 point per food

### Special Features
1. **Empty Line Pass-Through**: Snake moves freely through blank lines
2. **Code Breaking**: When snake hits text characters, the line becomes nearly invisible for 1 second
3. **Wrap Around**: Snake wraps around screen edges

## 🐛 Testing Tips

- Try different file sizes to see score multiplier changes
- Test on files with lots of empty lines
- Watch the "code breaking" effect when hitting text

## 📁 Project Structure

```
devsnakegame/
├── src/
│   ├── extension.ts      # Main extension activation
│   └── snakeGame.ts      # Game logic and rendering
├── out/                   # Compiled JavaScript
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript config
└── README.md             # User documentation
```

## 🚀 Next Steps

The extension is ready to test! Just press F5 in VS Code to launch it.

Enjoy breaking your code with Snake! 🐍
