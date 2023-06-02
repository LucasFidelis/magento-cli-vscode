import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SettingsHelper } from './helpers/settings-helper';
import { MagentoCommandTreeItem, MagentoCommandsProvider } from './MagentoCommandsProvider';

export class MagentoFavoritesProvider implements vscode.TreeDataProvider<MagentoCommandTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<MagentoCommandTreeItem | undefined | null | void>;
  readonly onDidChangeTreeData: vscode.Event<MagentoCommandTreeItem | undefined | null | void>;
  private favoriteCommands: MagentoCommandTreeItem[] = [];
  
  constructor (
    private workspaceRoot: string, 
    private magentoCommandsProvider: MagentoCommandsProvider,
    private storageUi: string
  ) {
    this._onDidChangeTreeData = new vscode.EventEmitter<MagentoCommandTreeItem | undefined | null | void>();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(element: MagentoCommandTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: MagentoCommandTreeItem): Thenable<MagentoCommandTreeItem[]> {
    const favorites = this.getFavorites();
    this.favoriteCommands = [];
    const commandsCollection = this.magentoCommandsProvider.getCommands();
    const phpExecutablePath = SettingsHelper.getConfigData('magentoCommand.php', 'executablePath');
    const magentoRoot = SettingsHelper.getConfigData('magentoCommand.magento', 'root');
    if(typeof(magentoRoot) === 'string') {
      const magentoCLI = path.resolve(magentoRoot, 'bin/magento');
      favorites.forEach(favorite => {
        const command = commandsCollection.find((command: { command: string; }) => command.command === favorite);
        this.favoriteCommands.push(new MagentoCommandTreeItem(
          command.command, 
          command.description,
          [phpExecutablePath, magentoCLI, command.command].join(' '), 
          vscode.TreeItemCollapsibleState.None
        ));
      });
    }    
    return Promise.resolve(this.favoriteCommands);
  }

  private getFavorites(): string[] {
    const filePath = path.resolve(this.storageUi, 'favorites.json');
    return fs.existsSync(filePath) ? 
      JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      : [];
  }

  addCommandAsFavorite(item: MagentoCommandTreeItem) {
    let favoriteCommands: string[] = [item.label];
    const file = path.resolve(this.storageUi, 'favorites.json');
    if (fs.existsSync(file)) {
      const currentCommands = JSON.parse(fs.readFileSync(file, 'utf-8'));
      favoriteCommands = favoriteCommands.concat(currentCommands);
    } else {
      fs.mkdirSync(this.storageUi, { recursive: true });
    }
    favoriteCommands = [...new Set(favoriteCommands)];
    this.saveFavorites(favoriteCommands);
    this._onDidChangeTreeData.fire();
  }

  deleteCommandFromFavorites(item: MagentoCommandTreeItem) {
    let favorites = this.getFavorites();
    favorites = favorites.filter(favorite => favorite !== item.label);
    this.saveFavorites(favorites);
    this._onDidChangeTreeData.fire();
  }

  private saveFavorites(favorites: string[]) {
    const file = path.resolve(this.storageUi, 'favorites.json');
    fs.writeFileSync(file, JSON.stringify(favorites));
  }
}