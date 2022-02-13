/* eslint-disable no-useless-escape */
import { ExtensionContext, commands } from 'vscode';
import * as vscode from 'vscode';

export class ToggleEditorCommand {

	private static readonly dotPath = 'cultsim.editor.toggle';

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		context.subscriptions.push(commands.registerCommand(ToggleEditorCommand.dotPath, () => this.execute(context)));
	}


	async execute(context: ExtensionContext) {
		await commands.executeCommand('workbench.action.toggleEditorType');
	}
}