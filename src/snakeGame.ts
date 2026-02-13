import * as vscode from 'vscode';

interface Position {
    line: number;
    char: number;
}

export class SnakeGame {
    private editor: vscode.TextEditor;
    private snake: Position[] = [];
    private direction: 'up' | 'down' | 'left' | 'right' = 'right';
    private food: Position | null = null;
    private score: number = 0;
    private isRunning: boolean = false;
    private gameLoop: NodeJS.Timeout | null = null;
    private keyListener: vscode.Disposable | null = null;
    private snakeDecorations: vscode.TextEditorDecorationType[] = [];
    private foodDecoration: vscode.TextEditorDecorationType | null = null;
    private hiddenLinesDecoration: vscode.TextEditorDecorationType | null = null;
    private hiddenLines: Set<number> = new Set();
    private gameOverCallback: (() => void) | null = null;
    private statusBar: vscode.StatusBarItem;
    private pointsPerFood: number = 1;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.calculatePoints();
    }

    private calculatePoints() {
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
        vscode.window.showInformationMessage(
            `Snake Game Started! Use arrow keys. File size: ${this.editor.document.lineCount} lines (${this.pointsPerFood} pts/food)`
        );
    }

    private initializeSnake() {
        const middleLine = Math.floor(this.editor.document.lineCount / 2);
        this.snake = [
            { line: middleLine, char: 5 },
            { line: middleLine, char: 4 },
            { line: middleLine, char: 3 }
        ];
    }

    private setupKeyBindings() {
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

        const changeDirection = (newDirection: 'up' | 'down' | 'left' | 'right') => {
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

    private update() {
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
        } else {
            this.snake.pop();
        }

        this.checkTextCollision(newHead);
        this.render();
    }

    private getNewHead(head: Position): Position {
        const lineCount = this.editor.document.lineCount;
        let newHead = { ...head };

        switch (this.direction) {
            case 'up':
                newHead.line = head.line - 1;
                if (newHead.line < 0) newHead.line = lineCount - 1;
                break;
            case 'down':
                newHead.line = head.line + 1;
                if (newHead.line >= lineCount) newHead.line = 0;
                break;
            case 'left':
                newHead.char = head.char - 1;
                if (newHead.char < 0) {
                    const lineLength = this.editor.document.lineAt(newHead.line).text.length;
                    newHead.char = Math.max(0, lineLength);
                }
                break;
            case 'right':
                newHead.char = head.char + 1;
                const lineLength = this.editor.document.lineAt(newHead.line).text.length;
                if (newHead.char > lineLength + 10) {
                    newHead.char = 0;
                }
                break;
        }

        return newHead;
    }

    private checkCollision(pos: Position): boolean {
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].line === pos.line && this.snake[i].char === pos.char) {
                return true;
            }
        }
        return false;
    }

    private checkTextCollision(pos: Position) {
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

    private spawnFood() {
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

    private render() {
        this.clearDecorations();

        const snakeDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(0, 255, 0, 0.3)',
            border: '1px solid lime',
            borderRadius: '2px'
        });

        const snakeRanges = this.snake.map(pos => {
            const line = Math.max(0, Math.min(pos.line, this.editor.document.lineCount - 1));
            const char = Math.max(0, pos.char);
            return new vscode.Range(line, char, line, char + 1);
        });

        this.editor.setDecorations(snakeDecorationType, snakeRanges);
        this.snakeDecorations.push(snakeDecorationType);

        if (this.food) {
            const foodDecorationType = vscode.window.createTextEditorDecorationType({
                before: {
                    contentText: '⭐',
                    color: 'yellow'
                }
            });

            const foodLine = Math.max(0, Math.min(this.food.line, this.editor.document.lineCount - 1));
            const foodChar = Math.max(0, this.food.char);
            this.editor.setDecorations(foodDecorationType, [
                new vscode.Range(foodLine, foodChar, foodLine, foodChar)
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

    private clearDecorations() {
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

    private updateStatusBar() {
        this.statusBar.text = `🐍 Snake Game | Score: ${this.score} | Length: ${this.snake.length} | ${this.pointsPerFood} pts/food`;
    }

    private gameOver() {
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

    onGameOver(callback: () => void) {
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
