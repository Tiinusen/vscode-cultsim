import * as vscode from 'vscode';
import path = require('path');
import { Renderer } from '../util/renderer';
import { Uri } from 'vscode';
import { Content, ContentType } from '../model/content';

export class BoardEditor {
	constructor(context: vscode.ExtensionContext) {
		context.subscriptions.push(BoardEditorProvider.register(context));
	}
}

/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class BoardEditorProvider implements vscode.CustomTextEditorProvider {
	static UI_PATH = null;
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new BoardEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(BoardEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'cultsim.editor.board';

	private static readonly scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];

	constructor(
		private readonly context: vscode.ExtensionContext
	) {

	}

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {

		webviewPanel.webview.options = {
			enableScripts: true
		};
		webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'change',
				document: document.getText(),
			});
		}
		const content = Content.fromString(document.getText());
		if (content == null || content.type == ContentType.Unknown) {
			vscode.commands.executeCommand('workbench.action.toggleEditorType');
			return;
		}

		// console.log(await Content.fromCore());

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'toggle-editor':
					vscode.window.showWarningMessage(e.message);
					vscode.commands.executeCommand('workbench.action.toggleEditorType');
					return;
				case 'reload':
					vscode.window.showWarningMessage(e.message);
					vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction');
					return;
				case 'error':
					vscode.window.showErrorMessage(e.message);
					return;
				case 'info':
					vscode.window.showInformationMessage(e.message);
					return;
				case 'warning':
					vscode.window.showWarningMessage(e.message);
					return;
				case 'change':
					(() => {
						const edit = new vscode.WorkspaceEdit();
						edit.replace(
							document.uri,
							new vscode.Range(0, 0, document.lineCount, 0),
							e.document);
						return vscode.workspace.applyEdit(edit);
					})();
			}
		});

		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
		const assetsBaseURI = Uri.joinPath(this.context.extensionUri, 'media', 'board');
		return await Renderer.htmlForWebView(
			webview,
			Uri.joinPath(this.context.extensionUri, 'src', 'view', 'board_editor', 'board.html'),
			assetsBaseURI,
			"../reset.css",
			"../vscode.css",
			"../../src/view/board_editor/board.css",
			"../../dist/board.js",
			"../fa/css/fontawesome.css",
			"../fa/css/brands.css",
			"../fa/css/solid.css"
		);
	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			JSON.stringify(json, null, 2));

		return vscode.workspace.applyEdit(edit);
	}
}
