import * as vscode from 'vscode';
import * as https from 'https';
import { Renderer } from '../util/renderer';
import { Uri } from 'vscode';
import { Content, ContentType } from '../model/content';
import { Transform } from 'stream';
import { Entity } from '../model/entity';

export class BoardEditor implements vscode.CustomTextEditorProvider {
	static UI_PATH = null;

	public static async register(context: vscode.ExtensionContext, coreContent: Content) {
		const provider = new BoardEditor(context, coreContent);
		const providerRegistration = vscode.window.registerCustomEditorProvider(BoardEditor.viewType, provider);
		context.subscriptions.push(providerRegistration);
	}

	private static readonly viewType = 'cultsim.editor.board';

	private _coreContent: Content;

	constructor(private readonly context: vscode.ExtensionContext, coreContent?: Content) {
		this._coreContent = coreContent;
	}

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

		const disableInteractiveUI: boolean = vscode.workspace.getConfiguration('cultsim').get('disableInteractiveUI');
		if (disableInteractiveUI) {
			vscode.commands.executeCommand('workbench.action.toggleEditorType');
			return;
		}

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
		webviewPanel.webview.onDidReceiveMessage(async e => {
			try {
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
						await this.save(document, e.document);
						return;
					case 'request':
						try {
							if (!e?.method) return;
							webviewPanel.webview.postMessage({
								type: 'response',
								id: e.id,
								response: await this.request(webviewPanel.webview, e.method, ...e.args)
							});
						} catch (e) {
							webviewPanel.webview.postMessage({
								type: 'response',
								id: e.id,
								error: e
							});
						}
						return;
				}
			} catch (e) {
				vscode.window.showErrorMessage(e.message);
			}
		});

		updateWebview();
	}

	private async request(webview: vscode.Webview, method: string, ...args: any[]): Promise<any> {
		method = method[0].toUpperCase() + method.substring(1);
		if (!(`request${method}` in this)) throw new Error(`Request method "${method}" unsupported`);
		const response = await this[`request${method}`](webview, ...args);
		return response || null;
	}

	private async requestClone(webview: vscode.Webview, type: string, sourceID: string, destinationID: string) {
		const imageURL = await this.requestImage(webview, type, sourceID);
		if (imageURL.includes('vscode-resource')) {
			await vscode.workspace.fs.copy(
				Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'images', type, `${sourceID}.png`),
				Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'images', type, `${destinationID}.png`),
				{ overwrite: true }
			);
			return;
		}
		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(reject, 10000, "timed out");
			https.get(imageURL, (response) => {
				const transform = new Transform();

				response.on('error', (e) => {
					reject(e);
				});

				response.on('data', (chunk) => {
					transform.push(chunk);
				});

				response.on('end', async () => {
					try {
						clearTimeout(timeout);
						const data = transform.read();
						await vscode.workspace.fs.writeFile(Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'images', type, `${destinationID}.png`), data);
						resolve();
					} catch (e) {
						console.error(e);
						reject(e);
					}
				});
			}).end();
		});
	}

	private async requestImage(webview: vscode.Webview, type: string, id?: string): Promise<string> {
		try {
			if (!id) throw new Error("No ID");
			if (!type) throw new Error("No Type provided");
			switch (type) {
				case 'elements': {
					const filesElements = await vscode.workspace.findFiles(`images/elements/${id}.png`);
					if (filesElements.length > 0) {
						return webview.asWebviewUri(filesElements[0]).toString();
					}
					const filesAspects = await vscode.workspace.findFiles(`images/aspects/${id}.png`);
					if (filesAspects.length > 0) {
						return webview.asWebviewUri(filesAspects[0]).toString();
					}
					const element = this._coreContent?.elements.find(element => element.id == id);
					if (element) {
						if (element.isAspect) {
							return `https://www.frangiclave.net/static/images/icons40/aspects/${element.id}.png`;
						}
						return `https://www.frangiclave.net/static/images/elementArt/${element.id}.png`;
					}
					return `https://www.frangiclave.net/static/images/elementArt/${id}.png`;
				}
				case 'legacies': {
					const files = await vscode.workspace.findFiles(`images/legacies/${id}.png`);
					if (files.length > 0) {
						return webview.asWebviewUri(files[0]).toString();
					}
					const legacy = this._coreContent?.legacies.find(legacy => legacy.id == id);
					if (legacy) {
						return `https://www.frangiclave.net/static/images/icons100/legacies/${legacy?.image || legacy?.id}.png`;
					}
					return `https://www.frangiclave.net/static/images/icons100/legacies/${id}.png`;
				}
				case 'endings': {
					const files = await vscode.workspace.findFiles(`images/endings/${id}.png`);
					if (files.length > 0) {
						return webview.asWebviewUri(files[0]).toString();
					}
					const ending = this._coreContent?.endings.find(ending => ending.id == id);
					if (ending) {
						return `https://www.frangiclave.net/static/images/endingArt/${ending?.image || ending?.id}.png`;
					}
					return `https://www.frangiclave.net/static/images/endingArt/${id}.png`;
				}
				case 'verbs': {
					const files = await vscode.workspace.findFiles(`images/verbs/${id}.png`);
					if (files.length > 0) {
						return webview.asWebviewUri(files[0]).toString();
					}
					const verb = this._coreContent?.verbs.find(verb => verb.id == id);
					if (verb) {
						return `https://www.frangiclave.net/static/images/icons100/verbs/${verb.id}.png`;
					}
					return `https://www.frangiclave.net/static/images/icons100/verbs/${id}.png`;
				}
			}
			throw new Error("unsupported type");
		} catch (e) {
			return 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
		}
	}

	private async requestIDs(webview: vscode.Webview, type: string): Promise<string[]> {
		try {
			if (!type) throw new Error("No Type provided");
			const content = await this.getWorkspaceContent();
			switch (type) {
				case 'elements':
					return content.elements.map(element => element.id);
				case 'recipes':
					return content.recipes.map(recipe => recipe.id);
				case 'decks':
					return content.decks.map(deck => deck.id);
				case 'legacies':
					return content.legacies.map(legacy => legacy.id);
				case 'endings':
					return content.endings.map(ending => ending.id);
				case 'verbs':
					return content.verbs.map(verb => verb.id);
			}
			throw new Error("unsupported type");
		} catch {
			return [];
		}
	}

	private async requestEntity(webview: vscode.Webview, type: string, id: string, includeWorkspace = false): Promise<Entity<any>> {
		try {
			if (!type) throw new Error("No Type provided");
			if (!id) throw new Error("No ID provided");
			let content = this._coreContent;
			if (includeWorkspace) content = await this.getWorkspaceContent();
			switch (type) {
				case 'elements':
					return content.elements.find(element => element.id == id);
				case 'recipes':
					return content.recipes.find(recipe => recipe.id == id);
				case 'decks':
					return content.decks.find(deck => deck.id == id);
				case 'legacies':
					return content.legacies.find(legacy => legacy.id == id);
				case 'endings':
					return content.endings.find(ending => ending.id == id);
				case 'verbs':
					return content.verbs.find(verb => verb.id == id);
			}
			throw new Error("unsupported type");
		} catch {
			return void 0;
		}
	}

	private async getWorkspaceContent(mergedWithCore = true): Promise<Content> {
		const files = await vscode.workspace.findFiles(`content/*.json`);
		let content = new Content();
		if (this._coreContent && mergedWithCore) content = this._coreContent.clone();
		content = content.merge(await Content.fromFiles(...files));
		return content;
	}

	protected save(document: vscode.TextDocument, text: string): Thenable<boolean> {
		const edit = new vscode.WorkspaceEdit();
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			text);
		return vscode.workspace.applyEdit(edit);
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
