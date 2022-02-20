/* eslint-disable no-useless-escape */
import { ExtensionContext, commands, Uri, env } from 'vscode';
import * as vscode from 'vscode';
import { VSCode } from '../view/board_editor/vscode';

export class OpenLogCommand {

	private static readonly dotPath = 'cultsim.open.log';

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		context.subscriptions.push(commands.registerCommand(OpenLogCommand.dotPath, () => this.execute(context)));
	}


	async execute(context: ExtensionContext) {
        const workspaceURI = vscode.workspace.workspaceFolders[0].uri;
        const logURI = Uri.joinPath(workspaceURI, "..", "..", "Player.log");
        try {
			await vscode.workspace.fs.stat(logURI);
		} catch {
            vscode.window.showWarningMessage("Player.json has not yet been created, try starting the game first");
            return;
		}
        for(const document of vscode.workspace.textDocuments){
            if(document.uri.fsPath == logURI.fsPath) return;
        }
		commands.executeCommand(
            "vscode.open",
            logURI
        );
	}
}