/* eslint-disable no-useless-escape */
import { ExtensionContext, commands, Uri, env } from 'vscode';
import * as vscode from 'vscode';

export class ShowReferenceCommand {

	private static readonly dotPath = 'cultsim.show.reference';

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		context.subscriptions.push(commands.registerCommand(ShowReferenceCommand.dotPath, () => this.execute(context)));
	}


	async execute(context: ExtensionContext) {
		await env.openExternal(Uri.parse("https://www.frangiclave.net/"));
	}
}