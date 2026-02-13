import * as vscode from 'vscode';
import { SnakeGame } from './snakeGame';

export function activate(context: vscode.ExtensionContext) {
    console.log('Snake Game extension is now active!');

    let currentGame: SnakeGame | undefined;

    let disposable = vscode.commands.registerCommand('snakegame.start', () => {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage('Please open a file to play Snake Game!');
            return;
        }

        if (currentGame) {
            currentGame.dispose();
        }

        currentGame = new SnakeGame(editor);
        currentGame.start();

        currentGame.onGameOver(() => {
            currentGame = undefined;
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
