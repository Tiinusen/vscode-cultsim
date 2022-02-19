/* eslint-disable no-useless-escape */
import { ExtensionContext, commands, Uri, env } from 'vscode';
import * as vscode from 'vscode';

export class StartCultistCommand {

	private static readonly dotPath = 'cultsim.start.cultist';

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		context.subscriptions.push(commands.registerCommand(StartCultistCommand.dotPath, () => this.execute(context)));
	}


	async execute(context: ExtensionContext) {
		await env.openExternal(Uri.parse("steam://rungameid/718670"));
	}
}