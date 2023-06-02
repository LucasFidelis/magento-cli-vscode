import * as vscode from 'vscode';
import { MagentoCommandTreeItem, MagentoCommandsProvider } from './MagentoCommandsProvider';
import { MagentoFavoritesProvider } from './MagentoFavoritesProvider';

export function activate(context: vscode.ExtensionContext) {	
	let rootPath;
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	} else {
		vscode.window.showInformationMessage('Required workspace!');
		return;
	}

	let magentoCommandsObj = new MagentoCommandsProvider(rootPath);
	let magentoFavoritesObj = new MagentoFavoritesProvider(
		rootPath, magentoCommandsObj, 
		context.globalStorageUri.path
	);
	vscode.window.registerTreeDataProvider("magentoCommands", magentoCommandsObj);
	vscode.window.registerTreeDataProvider("magentoCommandFavorites", magentoFavoritesObj);
	vscode.commands.registerCommand('shell.runCommand', (item: MagentoCommandTreeItem) => {
		execCommand(item.cmdStr);
	});
	vscode.commands.registerCommand('add.favorite', (item: MagentoCommandTreeItem) => {
		magentoFavoritesObj.addCommandAsFavorite(item);
	});
	vscode.commands.registerCommand('delete.favorite', (item: MagentoCommandTreeItem) => {
		magentoFavoritesObj.deleteCommandFromFavorites(item);
	});
}

function execCommand(command: string) {
	let terminal = vscode.window.terminals.find(terminal => terminal.name === 'Magento Terminal')
		?? vscode.window.createTerminal('Magento Terminal');
	terminal.show();
	terminal.sendText(command);
}

export function deactivate() {}