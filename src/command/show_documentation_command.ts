/* eslint-disable no-useless-escape */
import { ExtensionContext, commands, Uri } from 'vscode';
import * as vscode from 'vscode';

export class ShowDocumentationCommand {

	private static readonly dotPath = 'cultsim.show.documentation';

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		context.subscriptions.push(commands.registerCommand(ShowDocumentationCommand.dotPath, (external = true) => this.execute(context, external)));
	}


	async execute(context: ExtensionContext, external: boolean) {
		await vscode.env.openExternal(Uri.parse("https://docs.google.com/document/d/1BZiUrSiT8kKvWIEvx5DObThL4HMGVI1CluJR20CWBU0/edit"));
	}
}