import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SettingsHelper } from './helpers/settings-helper';

export class MagentoCommandsProvider implements vscode.TreeDataProvider<MagentoCommandTreeItem> {
  constructor(private workspaceRoot: string) {
  }

  getTreeItem(element: MagentoCommandTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: MagentoCommandTreeItem): Thenable<MagentoCommandTreeItem[]> {
    var items: MagentoCommandTreeItem[] = [];
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }
    const commands = this.getCommands(); 
    if(!element) {
      const groups: string[] = commands.map((command: { command: string; }) => command.command.split(':')[0]);
      return Promise
        .resolve([...new Set(groups)]
          .map(group => new MagentoCommandTreeItem(
            group,
            '',
            '',
            vscode.TreeItemCollapsibleState.Collapsed
          )
        ));      
    }
    const phpExecutablePath = SettingsHelper.getConfigData('magentoCommand.php', 'executablePath');
    const magentoRoot = SettingsHelper.getConfigData('magentoCommand.magento', 'root');
    if (typeof(magentoRoot) === 'string') {
      const magentoCLI = path.resolve(magentoRoot, 'bin/magento');
      return Promise.resolve(
        commands
        .filter((command: { command: string; }) => command.command.split(':')[0] === element.label)        
        .map((command: { command: string; description: string; }) => new MagentoCommandTreeItem(
          command.command, 
          command.description, 
          [phpExecutablePath, magentoCLI, command.command].join(' '), 
          vscode.TreeItemCollapsibleState.None
        ))
      );
    }
    return Promise.resolve([]);
  }

  private getCommands() {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, 'commands.json'), 'utf-8')); 
  }
}

const RESOURCE_FOLDER = path.join(__filename, "..", "..", "resources");
const RESOURCE_DARK = path.join(RESOURCE_FOLDER, "dark");
const RESOURCE_LIGHT = path.join(RESOURCE_FOLDER, "light");

export class MagentoCommandTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public description: string,
    public cmdStr: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = this.description;
    this.description = description;
  }

  iconPath = {
    light: path.join(RESOURCE_LIGHT, 'console.svg'),
    dark: path.join(RESOURCE_DARK, 'console.svg'),
  };

  contextValue = this.cmdStr === '' ? 'group' : 'command';
}
