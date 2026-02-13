# 🚀 Quick Start Guide

## Play the Game in 3 Steps!

### Method 1: Instant Play (Recommended)

```bash
# Clone and run
git clone https://github.com/ivikasavnish/snake-vscode.git
cd uno-vscode
code .
```

Then press `F5` in VS Code to launch the Extension Development Host.

### Method 2: Install Locally

If you want to use it in your regular VS Code without the development host:

```bash
# Clone the repository
git clone https://github.com/ivikasavnish/snake-vscode.git
cd uno-vscode

# Package the extension
npx vsce package

# Install the .vsix file:
# VS Code → Extensions (Ctrl+Shift+X) → ... menu → Install from VSIX
```

## Once Installed:

1. ✅ Open **any file** in VS Code (try a large file for more points!)
2. ✅ Press `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
3. ✅ Use **Arrow Keys** to play
4. ✅ Press `ESC` to exit

## Game Controls

| Key | Action |
|-----|--------|
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Start Game |
| `↑` | Move Up |
| `↓` | Move Down |
| `←` | Move Left |
| `→` | Move Right |
| `ESC` | Exit Game |

## 🎯 Pro Tips

1. **Larger files = Higher scores**
   - 10 lines = 1 pt/food
   - 50 lines = 5 pts/food
   - 100+ lines = 10 pts/food

2. **Empty lines are safe** - Snake passes through without collision

3. **Watch the code break!** - When you hit text, it becomes nearly invisible for 1 second

4. **Only lose by hitting yourself** - Text collisions just break code temporarily

## ❓ Troubleshooting

**Extension doesn't start?**
- Make sure the `out/` folder exists with compiled JS files
- Run `tsc -p .` to compile if needed

**Keys not working?**
- Make sure the game has started (you should see the status bar)
- The editor window must be focused

**Can't see the snake?**
- The snake is a green highlighted block - check your VS Code theme
- Try a different color theme if visibility is poor

## 🐛 Found a Bug?

Report it at: https://github.com/ivikasavnish/snake-vscode/issues

---

**Enjoy the game! 🐍**
