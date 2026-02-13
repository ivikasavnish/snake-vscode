# VS Code Snake Game Extension

Play Snake game right in your VS Code editor with a twist!

## Features

- 🐍 Snake moves through your code
- 📄 Snake passes through empty lines
- 💥 When snake hits text, the code temporarily disappears
- 📊 Score based on file size (larger files = more points)
- ⌨️ Arrow keys to control the snake
- 🎮 Real-time gameplay with decorations

## Usage

1. Open any file in VS Code
2. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
3. Use arrow keys to control the snake
4. Press `Escape` to exit the game

## Game Rules

- Snake passes through empty lines without collision
- Hitting text makes the line temporarily disappear (code breaks!)
- Longer files give more points per food
- Game over if snake hits itself
- Collect food (⭐) to grow and score points

## Installation

Install from VS Code Extensions marketplace or build from source:

```bash
npm install
npm run compile
```

Enjoy breaking your code!
