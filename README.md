# 🐍 Code Snake Game - VS Code Extension

Play Snake game right in your VS Code editor with a unique twist - break your code while you play!

![Snake Game Demo](https://img.shields.io/badge/VS%20Code-Extension-blue?style=flat-square&logo=visual-studio-code)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)

## ✨ Features

- 🐍 **Snake moves through your code** - Navigate freely across your files
- 📄 **Pass through empty lines** - No collision on blank lines
- 💥 **Code-breaking effect** - Text temporarily disappears when snake hits it (becomes nearly invisible for 1 second)
- 📊 **Dynamic scoring** - Larger files give more points per food (1 point per 10 lines)
- ⌨️ **Arrow key controls** - Intuitive WASD-like gameplay
- 🎮 **Real-time gameplay** - Beautiful decorations and status bar
- ⭐ **Collect food** - Grow your snake and increase your score

## 🎮 How to Play

### Installation

**Option 1: Download & Install VSIX (Easiest!)**
1. Download the latest release: [vscode-snake-game-1.0.2.vsix](https://github.com/ivikasavnish/snake-vscode/raw/main/vscode-snake-game-1.0.2.vsix)
2. Open VS Code
3. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
4. Click the `...` menu → `Install from VSIX`
5. Select the downloaded file
6. Reload VS Code

**Option 2: Install from Repository**
1. Clone this repository:
   ```bash
   git clone https://github.com/ivikasavnish/snake-vscode.git
   cd uno-vscode
   ```

2. Open in VS Code and press `F5` to launch the Extension Development Host

**Option 3: Build from Source**
```bash
git clone https://github.com/ivikasavnish/snake-vscode.git
cd uno-vscode
tsc -p .
# Press F5 in VS Code to test
```

### Starting the Game

1. Open **any file** in VS Code (larger files = more points!)
2. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
3. Or run command: `Snake Game: Start Game`

### Controls

- **↑ ↓ ← →** Arrow keys to move the snake
- **ESC** Exit the game

## 🎯 Game Mechanics

### Scoring System
- **Small files (10 lines)**: 1 point per food ⭐
- **Medium files (50 lines)**: 5 points per food ⭐
- **Large files (100+ lines)**: 10 points per food ⭐

### Special Features

1. **Empty Line Pass-Through**
   - Snake moves freely through blank lines without collision
   - Perfect for navigating sparse code files

2. **Code Breaking Effect** 💥
   - When snake hits text characters, the line becomes nearly invisible
   - Line opacity drops to 0.1 for 1 second, then recovers
   - Your code is "broken" temporarily!

3. **Wrap-Around World**
   - Snake wraps around edges of the file
   - Top connects to bottom, left to right

4. **Self-Collision Game Over**
   - Only way to lose is hitting your own snake
   - Text collisions just break the code temporarily

## 🎨 Visual Elements

- **Snake**: Green highlighted blocks with lime borders
- **Food**: ⭐ Yellow star emoji
- **Broken Code**: Red-tinted transparent text (temporary)
- **Status Bar**: Shows score, snake length, and points multiplier

## 🛠️ Development

```bash
# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Run in Extension Development Host
Press F5 in VS Code
```

## 📋 Requirements

- VS Code 1.75.0 or higher
- TypeScript 4.9+ (for development)

## 🐛 Known Issues

- None yet! Report issues at [GitHub Issues](https://github.com/ivikasavnish/snake-vscode/issues)

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📜 License

MIT License - See LICENSE file for details

## 🎮 Tips for Maximum Fun

1. **Try different file types**: Code files, markdown, JSON - each plays differently!
2. **Larger files = higher scores**: Open big files for maximum points
3. **Watch the code break**: Position yourself to hit lines of code
4. **Challenge yourself**: How long can you grow your snake?

---

**Made with ❤️ by vikasavnish**

Enjoy breaking your code! 🐍💻
