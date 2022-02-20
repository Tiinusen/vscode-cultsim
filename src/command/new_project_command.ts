/* eslint-disable no-useless-escape */
import { window, workspace, ExtensionContext, commands, Uri, WorkspaceFolder } from 'vscode';

export class NewProjectCommand {

	private static readonly dotPath = 'cultsim.new.project';

	constructor(context: ExtensionContext) {
		context.subscriptions.push(commands.registerCommand(NewProjectCommand.dotPath, () => this.execute()));
	}

	async execute() {
		if (!workspace.workspaceFolders) {
			return window.showErrorMessage('You need to open an workspace first!');
		}
		this.deployStructure(workspace.workspaceFolders[0]);
	}

	async deployStructure(workspaceFolder: WorkspaceFolder) {
		try {
			await workspace.fs.stat(Uri.joinPath(workspaceFolder.uri, "synopsis.json"));
			return window.showWarningMessage('Workspace is already a mod!');
		} catch { /* Prevent error on file not found */ }

		const modName = await window.showInputBox({
			value: workspaceFolder.name,
			placeHolder: 'For example: My Epic Mod',
			title: "Name",
			prompt: "What should your mod be named?"
		});
		if (!modName) return;

		const authorName = await window.showInputBox({
			placeHolder: 'For example: John Doe',
			title: "Author",
			prompt: "Name of author?"
		});
		if (!authorName) return;

		const startingVersion = await window.showInputBox({
			value: '0.0.1',
			placeHolder: 'For example: 1.0.0',
			title: "Version",
			prompt: "Starting version of mod?",
			validateInput: text => {
				const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;
				if (text.match(regex)) {
					return null;
				}
				return "not a semantic version";
			}
		});
		if (!startingVersion) return;
		const synopsisContent = {
			"name": modName,
			"author": authorName,
			"version": startingVersion,
			"description": "Mod Description, shown in-game.",
			"description_long": "Long Mod Description."
		};
		const synopsisURI = Uri.joinPath(workspaceFolder.uri, "synopsis.json");
		workspace.fs.writeFile(synopsisURI, Buffer.from(JSON.stringify(synopsisContent, null, 4), 'utf8'));

		// Project Structure
		const structure = [
			".vscode",
			"content",
			"loc",
			"images",
			"images/aspects",
			"images/burns",
			"images/cardbacks",
			"images/elements",
			"images/elements/anim",
			"images/endings",
			"images/legacies",
			"images/statusbaricons",
			"images/verbs",
			"images/verbs/anim",
			"images/ui",
		];
		for (const structurePath of structure) {
			const uri = Uri.joinPath(workspaceFolder.uri, ...structurePath.split("/"));
			try {
				await workspace.fs.stat(uri);
				continue;
			} catch { /* Prevent error on file not found */ }
			await workspace.fs.createDirectory(uri);
		}
		const launchContent = {
			"configurations": [
				{
					"type": "cultsim",
					"request": "launch",
					"name": "Start Cultist Simulator (Steam)"
				}
			]
		};
		const uri = Uri.joinPath(workspaceFolder.uri, ".vscode", "launch.json");
		try {
			await workspace.fs.stat(uri);
		} catch {
			workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(launchContent, null, 4), 'utf8'));
		}
		commands.executeCommand(
			"vscode.open",
			synopsisURI
		);
	}

}