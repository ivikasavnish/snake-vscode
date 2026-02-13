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
        this.direction = 'left'; // Start moving left from end of line
        this.food = null;
        this.score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.keyListener = null;
        this.snakeDecorations = [];
        this.foodDecoration = null;
        this.hiddenLinesDecoration = null;
        this.hiddenLines = new Set();
        this.gameOverCallback = null;
        this.pointsPerFood = 1;
        this.commentPatterns = { single: [], multi: [] };
        this.maxColumn = 120;
        this.editor = editor;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.calculatePoints();
        this.detectLanguage();
        this.calculateViewportWidth();
    }
    calculatePoints() {
        const lineCount = this.editor.document.lineCount;
        this.pointsPerFood = Math.max(1, Math.floor(lineCount / 10));
    }
    detectLanguage() {
        const languageId = this.editor.document.languageId;
        const fileName = this.editor.document.fileName;
        // Define comment patterns for different languages
        if (languageId === 'javascript' || languageId === 'typescript' ||
            languageId === 'java' || languageId === 'c' || languageId === 'cpp' ||
            languageId === 'csharp' || languageId === 'go' || languageId === 'rust') {
            this.commentPatterns.single = [/\/\/.*/];
            this.commentPatterns.multi = [/\/\*[\s\S]*?\*\//];
        }
        else if (languageId === 'python' || languageId === 'ruby' ||
            languageId === 'shell' || languageId === 'bash') {
            this.commentPatterns.single = [/#.*/];
            this.commentPatterns.multi = [/""".+?"""/s, /'''.+?'''/s];
        }
        else if (languageId === 'html' || languageId === 'xml') {
            this.commentPatterns.multi = [/<!--[\s\S]*?-->/];
        }
        else if (languageId === 'css' || languageId === 'scss' || languageId === 'less') {
            this.commentPatterns.multi = [/\/\*[\s\S]*?\*\//];
        }
        console.log(`Language detected: ${languageId}, comment patterns loaded`);
    }
    calculateViewportWidth() {
        // Get visible range to determine viewport width
        const visibleRanges = this.editor.visibleRanges;
        if (visibleRanges.length > 0) {
            const firstRange = visibleRanges[0];
            this.maxColumn = Math.min(150, Math.max(80, firstRange.end.character + 20));
        }
        else {
            this.maxColumn = 120;
        }
        console.log(`Viewport width set to: ${this.maxColumn} columns`);
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
        // Start at the end of the first line (right side focus)
        const firstLine = 0;
        const firstLineText = this.editor.document.lineAt(firstLine).text;
        const lineLength = firstLineText.length;
        // Start at the end or at maxColumn, whichever is smaller
        const startChar = Math.min(lineLength, this.maxColumn - 3);
        this.snake = [
            { line: firstLine, char: startChar },
            { line: firstLine, char: startChar + 1 },
            { line: firstLine, char: startChar + 2 }
        ];
        // Start moving left from the end
        this.direction = 'left';
        // Scroll to top to show the snake
        this.scrollToSnake();
        console.log(`Snake initialized at line ${firstLine}, column ${startChar}, moving LEFT`);
    }
    setupKeyBindings() {
        // Register arrow key commands
        const upCommand = vscode.commands.registerCommand('snakegame.up', () => {
            if (this.isRunning && !this.isPaused && this.direction !== 'down') {
                this.direction = 'up';
                console.log('Direction changed to: UP');
            }
        });
        const downCommand = vscode.commands.registerCommand('snakegame.down', () => {
            if (this.isRunning && !this.isPaused && this.direction !== 'up') {
                this.direction = 'down';
                console.log('Direction changed to: DOWN');
            }
        });
        const leftCommand = vscode.commands.registerCommand('snakegame.left', () => {
            if (this.isRunning && !this.isPaused && this.direction !== 'right') {
                this.direction = 'left';
                console.log('Direction changed to: LEFT');
            }
        });
        const rightCommand = vscode.commands.registerCommand('snakegame.right', () => {
            if (this.isRunning && !this.isPaused && this.direction !== 'left') {
                this.direction = 'right';
                console.log('Direction changed to: RIGHT');
            }
        });
        const pauseCommand = vscode.commands.registerCommand('snakegame.pause', () => {
            this.togglePause();
        });
        const stopCommand = vscode.commands.registerCommand('snakegame.stop', () => {
            this.stopGame();
        });
        const exitCommand = vscode.commands.registerCommand('snakegame.exit', () => {
            this.gameOver();
        });
        // Store disposables
        this.keyListener = {
            dispose: () => {
                upCommand.dispose();
                downCommand.dispose();
                leftCommand.dispose();
                rightCommand.dispose();
                pauseCommand.dispose();
                stopCommand.dispose();
                exitCommand.dispose();
            }
        };
        vscode.commands.executeCommand('setContext', 'snakeGameActive', true);
        console.log('Arrow key bindings registered. Press arrow keys to move!');
    }
    update() {
        if (!this.isRunning || this.isPaused) {
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
    togglePause() {
        if (!this.isRunning) {
            return;
        }
        this.isPaused = !this.isPaused;
        this.updateStatusBar();
        if (this.isPaused) {
            vscode.window.showInformationMessage('⏸️ Game PAUSED! Press Space to resume, ESC to stop.');
            console.log('Game PAUSED');
        }
        else {
            vscode.window.showInformationMessage('▶️ Game RESUMED!');
            console.log('Game RESUMED');
        }
    }
    stopGame() {
        if (!this.isRunning) {
            return;
        }
        vscode.window.showInformationMessage(`🛑 Game STOPPED! Final Score: ${this.score} | Length: ${this.snake.length}`);
        console.log('Game manually stopped by user');
        this.dispose();
        if (this.gameOverCallback) {
            this.gameOverCallback();
        }
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
                // Align to end of new line
                const upLineLength = this.editor.document.lineAt(newHead.line).text.length;
                newHead.char = Math.min(head.char, Math.min(upLineLength, this.maxColumn - 1));
                break;
            case 'down':
                newHead.line = head.line + 1;
                if (newHead.line >= lineCount) {
                    newHead.line = 0;
                }
                // Align to end of new line
                const downLineLength = this.editor.document.lineAt(newHead.line).text.length;
                newHead.char = Math.min(head.char, Math.min(downLineLength, this.maxColumn - 1));
                break;
            case 'left':
                newHead.char = head.char - 1;
                if (newHead.char < 0) {
                    // Wrap to right side
                    newHead.char = this.maxColumn - 1;
                }
                break;
            case 'right':
                newHead.char = head.char + 1;
                // Wrap at maxColumn
                if (newHead.char >= this.maxColumn) {
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
        // Empty lines don't cause collision
        if (lineText.trim().length === 0) {
            return;
        }
        // Check if position has text
        if (pos.char >= 0 && pos.char < lineText.length && lineText[pos.char].trim() !== '') {
            const char = lineText[pos.char];
            // Check if we're in a comment
            if (this.isInComment(lineText, pos.char)) {
                // Eating comment! Give bonus points
                this.score += Math.floor(this.pointsPerFood / 2);
                this.updateStatusBar();
                console.log('💬 Ate comment character! Bonus points!');
            }
            // Hide the line temporarily
            this.hiddenLines.add(pos.line);
            setTimeout(() => {
                this.hiddenLines.delete(pos.line);
                this.render();
            }, 1000);
        }
    }
    isInComment(lineText, charPos) {
        // Check single-line comments
        for (const pattern of this.commentPatterns.single) {
            const match = lineText.match(pattern);
            if (match && match.index !== undefined) {
                const commentStart = match.index;
                if (charPos >= commentStart) {
                    return true;
                }
            }
        }
        // For now, just check single-line comments
        // Multi-line comment detection would require document-level parsing
        return false;
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
        let statusText = `🐍 Snake Game | Score: ${this.score} | Length: ${this.snake.length} | ${this.pointsPerFood} pts/food`;
        if (this.isPaused) {
            statusText = `⏸️ PAUSED | ${statusText} | Space=Resume ESC=Stop`;
        }
        else if (this.isRunning) {
            statusText = `▶️ ${statusText} | Space=Pause ESC=Stop`;
        }
        this.statusBar.text = statusText;
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