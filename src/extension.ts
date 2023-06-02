import * as vscode from 'vscode';
import { MagentoCommandTreeItem, MagentoCommandsProvider } from './MagentoCommandsProvider';

export function activate(context: vscode.ExtensionContext) {	
	let rootPath;
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	} else {
		vscode.window.showInformationMessage('Required workspace!');
		return;
	}
	
	let magentoCommandsObj = new MagentoCommandsProvider(rootPath);
	vscode.window.registerTreeDataProvider("magentoCommands", magentoCommandsObj);
	vscode.commands.registerCommand('shell.runCommand', (item: MagentoCommandTreeItem) => {
		execCommand(item.cmdStr);
	});
}

function execCommand(command: string) {
	let terminal = vscode.window.terminals.find(terminal => terminal.name === 'Magento Terminal')
		?? vscode.window.createTerminal('Magento Terminal');
	terminal.show();
	terminal.sendText(command);
}

export function deactivate() {}
