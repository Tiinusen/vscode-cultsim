// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ExplorerView } from './view/explorer/explorer_view';
import { BoardEditor } from './view/board_editor';
import { NewProjectCommand } from './command/new_project_command';
import { ShowDocumentationCommand } from './command/show_documentation_command';
import { ShowReferenceCommand } from './command/show_reference_command';
import { ToggleEditorCommand } from './command/toggle_editor_command';
import { Content } from './model/content';
import { StartCultistCommand } from './command/start_cultist_command';
import { CultsimSession } from './debug/session';
import { workspace } from 'vscode';
import { OpenLogCommand } from './command/open_log_command';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let coreContent: Content = null;
	try {
		coreContent = await Content.fromCore();
		if (!workspace.getConfiguration('cultsim').get('streamingAssetsPath') && !workspace.getConfiguration('cultsim').get('disableCoreContent')) {
			vscode.window.showWarningMessage("Cultist Simulator streaming assets path not configurated");
		}
	} catch (e) {
		vscode.window.showErrorMessage("Failed to load Cultist Simulator streaming assets");
	}

	// Commands
	new NewProjectCommand(context);
	new ShowDocumentationCommand(context);
	new ShowReferenceCommand(context);
	new ToggleEditorCommand(context);
	new StartCultistCommand(context);
	new OpenLogCommand(context);

	// Views
	new ExplorerView(context, coreContent);
	await BoardEditor.register(context, coreContent);

	// Debuggers
	CultsimSession.register(context);
}



// this method is called when your extension is deactivated
export function deactivate() {
	return;
}
