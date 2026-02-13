"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnakeGame = void 0;
const vscode = __importStar(require("vscode"));
class SnakeGame {
    constructor(editor) {
        this.snake = [];
        this.direction = 'right';
        this.food = null;
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = null;
        this.keyListener = null;
        this.snakeDecorations = [];
        this.foodDecoration = null;
        this.hiddenLinesDecoration = null;
        this.hiddenLines = new Set();
        this.gameOverCallback = null;
        this.pointsPerFood = 1;
        this.editor = editor;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.calculatePoints();
    }
    calculatePoints() {
        const lineCount = this.editor.document.lineCount;
        this.pointsPerFood = Math.max(1, Math.floor(lineCount / 10));
    }
    start() {
        this.isRunning = true;
        this.initializeSnake();
        this.spawnFood();
        this.setupKeyBindings();
        this.gameLoop = setInterval(() => this.update(), 150);
        this.statusBar.show();
        this.updateStatusBar();
        // Force initial render
        this.render();
        console.log('Snake Game Started!');
        console.log('Snake position:', this.snake);
        console.log('Food position:', this.food);
        vscode.window.showInformationMessage(`🐍 Snake Game Started! Use arrow keys. File: ${this.editor.document.lineCount} lines (${this.pointsPerFood} pts/food). Look for GREEN blocks!`, 'Got it!');
    }
    initializeSnake() {
        // Start at the top of the file, at the end of the first line
        const firstLine = 0;
        const firstLineLength = this.editor.document.lineAt(firstLine).text.length;
        const startChar = Math.max(0, firstLineLength - 1);
        this.snake = [
            { line: firstLine, char: startChar },
            { line: firstLine, char: Math.max(0, startChar - 1) },
            { line: firstLine, char: Math.max(0, startChar - 2) }
        ];
        // Scroll to top to show the snake
        this.scrollToSnake();
    }
    setupKeyBindings() {
        this.keyListener = vscode.commands.registerCommand('type', (args) => {
            if (!this.isRunning) {
                return vscode.commands.executeCommand('default:type', args);
            }
            const char = args.text;
            if (char === '\u001b') {
                this.gameOver();
                return;
            }
            return vscode.commands.executeCommand('default:type', args);
        });
        const changeDirection = (newDirection) => {
            const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
            if (this.direction !== opposites[newDirection]) {
                this.direction = newDirection;
            }
        };
        vscode.commands.executeCommand('setContext', 'snakeGameActive', true);
        const commands = [
            vscode.commands.registerCommand('snakegame.up', () => changeDirection('up')),
            vscode.commands.registerCommand('snakegame.down', () => changeDirection('down')),
            vscode.commands.registerCommand('snakegame.left', () => changeDirection('left')),
            vscode.commands.registerCommand('snakegame.right', () => changeDirection('right')),
            vscode.commands.registerCommand('snakegame.exit', () => this.gameOver())
        ];
        commands.forEach(cmd => this.keyListener?.dispose);
    }
    update() {
        if (!this.isRunning) {
            return;
        }
        const head = this.snake[0];
        const newHead = this.getNewHead(head);
        if (this.checkCollision(newHead)) {
            this.gameOver();
            return;
        }
        this.snake.unshift(newHead);
        if (this.food && newHead.line === this.food.line && newHead.char === this.food.char) {
            this.score += this.pointsPerFood;
            this.spawnFood();
            this.updateStatusBar();
        }
        else {
            this.snake.pop();
        }
        this.checkTextCollision(newHead);
        this.scrollToSnake();
        this.render();
    }
    getNewHead(head) {
        const lineCount = this.editor.document.lineCount;
        let newHead = { ...head };
        switch (this.direction) {
            case 'up':
                newHead.line = head.line - 1;
                if (newHead.line < 0) {
                    newHead.line = lineCount - 1;
                }
                break;
            case 'down':
                newHead.line = head.line + 1;
                if (newHead.line >= lineCount) {
                    newHead.line = 0;
                }
                break;
            case 'left':
                newHead.char = head.char - 1;
                if (newHead.char < 0) {
                    // Move to previous line at the end
                    newHead.line = head.line - 1;
                    if (newHead.line < 0) {
                        newHead.line = lineCount - 1;
                    }
                    const lineLength = this.editor.document.lineAt(newHead.line).text.length;
                    newHead.char = Math.max(0, lineLength);
                }
                break;
            case 'right':
                const currentLineLength = this.editor.document.lineAt(newHead.line).text.length;
                newHead.char = head.char + 1;
                // Move to next line if past end of current line
                if (newHead.char > currentLineLength + 5) {
                    newHead.line = head.line + 1;
                    if (newHead.line >= lineCount) {
                        newHead.line = 0;
                    }
                    newHead.char = 0;
                }
                break;
        }
        return newHead;
    }
    checkCollision(pos) {
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].line === pos.line && this.snake[i].char === pos.char) {
                return true;
            }
        }
        return false;
    }
    checkTextCollision(pos) {
        if (pos.line < 0 || pos.line >= this.editor.document.lineCount) {
            return;
        }
        const line = this.editor.document.lineAt(pos.line);
        const lineText = line.text;
        if (lineText.trim().length === 0) {
            return;
        }
        if (pos.char >= 0 && pos.char < lineText.length && lineText[pos.char].trim() !== '') {
            this.hiddenLines.add(pos.line);
            setTimeout(() => {
                this.hiddenLines.delete(pos.line);
                this.render();
            }, 1000);
        }
    }
    spawnFood() {
        const lineCount = this.editor.document.lineCount;
        let attempts = 0;
        while (attempts < 100) {
            const line = Math.floor(Math.random() * lineCount);
            const lineLength = Math.max(10, this.editor.document.lineAt(line).text.length);
            const char = Math.floor(Math.random() * lineLength);
            const pos = { line, char };
            if (!this.checkCollision(pos)) {
                this.food = pos;
                return;
            }
            attempts++;
        }
        this.food = { line: Math.floor(lineCount / 2), char: 10 };
    }
    render() {
        this.clearDecorations();
        // Render snake head (more visible)
        const snakeHeadDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: '#00ff00',
            color: '#000000',
            border: '3px solid #ffff00',
            borderRadius: '4px',
            fontWeight: 'bold',
            textDecoration: 'none; font-size: 1.2em; box-shadow: 0 0 15px #00ff00;'
        });
        // Render snake body
        const snakeBodyDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: '#00cc00',
            color: '#000000',
            border: '1px solid #00ff00',
            borderRadius: '2px'
        });
        // Head is first element
        if (this.snake.length > 0) {
            const head = this.snake[0];
            const headLine = Math.max(0, Math.min(head.line, this.editor.document.lineCount - 1));
            const headChar = Math.max(0, head.char);
            this.editor.setDecorations(snakeHeadDecorationType, [
                new vscode.Range(headLine, headChar, headLine, headChar + 1)
            ]);
            this.snakeDecorations.push(snakeHeadDecorationType);
        }
        // Body is remaining elements
        if (this.snake.length > 1) {
            const bodyRanges = this.snake.slice(1).map(pos => {
                const line = Math.max(0, Math.min(pos.line, this.editor.document.lineCount - 1));
                const char = Math.max(0, pos.char);
                return new vscode.Range(line, char, line, char + 1);
            });
            this.editor.setDecorations(snakeBodyDecorationType, bodyRanges);
            this.snakeDecorations.push(snakeBodyDecorationType);
        }
        if (this.food) {
            const foodDecorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: '#ffff00',
                color: '#000000',
                before: {
                    contentText: '⭐⭐⭐',
                    color: '#ffff00',
                    fontWeight: 'bold',
                    textDecoration: 'none; font-size: 1.5em; text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000;'
                },
                border: '3px solid #ff0000',
                borderRadius: '5px',
                textDecoration: 'none; animation: blink 1s linear infinite;'
            });
            const foodLine = Math.max(0, Math.min(this.food.line, this.editor.document.lineCount - 1));
            const foodChar = Math.max(0, this.food.char);
            this.editor.setDecorations(foodDecorationType, [
                new vscode.Range(foodLine, foodChar, foodLine, foodChar + 3)
            ]);
            this.foodDecoration = foodDecorationType;
        }
        if (this.hiddenLines.size > 0) {
            const hiddenDecorationType = vscode.window.createTextEditorDecorationType({
                opacity: '0.1',
                backgroundColor: 'rgba(255, 0, 0, 0.1)'
            });
            const hiddenRanges = Array.from(this.hiddenLines).map(line => {
                const validLine = Math.max(0, Math.min(line, this.editor.document.lineCount - 1));
                return new vscode.Range(validLine, 0, validLine, this.editor.document.lineAt(validLine).text.length);
            });
            this.editor.setDecorations(hiddenDecorationType, hiddenRanges);
            this.hiddenLinesDecoration = hiddenDecorationType;
        }
    }
    clearDecorations() {
        this.snakeDecorations.forEach(d => d.dispose());
        this.snakeDecorations = [];
        if (this.foodDecoration) {
            this.foodDecoration.dispose();
            this.foodDecoration = null;
        }
        if (this.hiddenLinesDecoration) {
            this.hiddenLinesDecoration.dispose();
            this.hiddenLinesDecoration = null;
        }
    }
    updateStatusBar() {
        this.statusBar.text = `🐍 Snake Game | Score: ${this.score} | Length: ${this.snake.length} | ${this.pointsPerFood} pts/food`;
    }
    scrollToSnake() {
        if (this.snake.length === 0) {
            return;
        }
        const head = this.snake[0];
        const headLine = Math.max(0, Math.min(head.line, this.editor.document.lineCount - 1));
        // Create a range at the snake head position
        const range = new vscode.Range(headLine, 0, headLine, 0);
        // Scroll to reveal the snake head, keeping it centered
        this.editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
    gameOver() {
        this.isRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        vscode.window.showInformationMessage(`Game Over! Final Score: ${this.score} | Snake Length: ${this.snake.length}`);
        this.dispose();
        if (this.gameOverCallback) {
            this.gameOverCallback();
        }
    }
    onGameOver(callback) {
        this.gameOverCallback = callback;
    }
    dispose() {
        this.isRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.keyListener) {
            this.keyListener.dispose();
        }
        this.clearDecorations();
        this.statusBar.dispose();
        vscode.commands.executeCommand('setContext', 'snakeGameActive', false);
    }
}
exports.SnakeGame = SnakeGame;
//# sourceMappingURL=snakeGame.js.map