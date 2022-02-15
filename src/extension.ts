// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ExplorerVerbsView } from './view/explorer/explorer_verbs_view';
import { BoardEditor } from './view/board_editor';
import { NewProjectCommand } from './command/new_project_command';
import { ShowDocumentationCommand } from './command/show_documentation_command';
import { ShowReferenceCommand } from './command/show_reference_command';
import { ToggleEditorCommand } from './command/toggle_editor_command';
import { Content } from './model/content';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Commands
	new NewProjectCommand(context);
	new ShowDocumentationCommand(context);
	new ShowReferenceCommand(context);
	new ToggleEditorCommand(context);

	// Views
	new ExplorerVerbsView(context);

	await BoardEditor.register(context);
}



// this method is called when your extension is deactivated
export function deactivate() {
	return;
}
