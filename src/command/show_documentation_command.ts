/* eslint-disable no-useless-escape */
import { window, ExtensionContext, commands, Uri } from 'vscode';
import * as vscode from 'vscode';
import { Renderer } from '../util/renderer';

export class ShowDocumentationCommand {

	private static readonly dotPath = 'cultsim.show.documentation';

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		context.subscriptions.push(commands.registerCommand(ShowDocumentationCommand.dotPath, (external = true) => this.execute(context, external)));
	}


	async execute(context: ExtensionContext, external: boolean) {
		if (external) {
			await vscode.env.openExternal(Uri.parse("https://docs.google.com/document/d/1BZiUrSiT8kKvWIEvx5DObThL4HMGVI1CluJR20CWBU0/edit"));
			return;
		}
		const panel = window.createWebviewPanel(
			ShowDocumentationCommand.dotPath + ".view",
			'Documentation',
			vscode.ViewColumn.One,
			{}
		);

		// And set its HTML content
		panel.webview.html = await this.getHtmlForWebview(panel.webview);
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
		const assetsBaseURI = Uri.joinPath(this.context.extensionUri, 'media', 'documentation');
		const html = await Renderer.htmlForWebView(
			webview,
			Uri.joinPath(assetsBaseURI, 'CultistSimulatorModdingGuide.html'),
			assetsBaseURI,
			"override.css"
		);
		return html.replace(/\"images\//g, '"' + webview.asWebviewUri(Uri.joinPath(assetsBaseURI, 'images')) + "/");
	}
}