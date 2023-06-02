import * as vscode from "vscode";

export class SettingsHelper {
  static getConfigData(section: string, key: string) {
    return vscode.workspace.getConfiguration(section).get(key);
  }

  static hasConfig(section: string, key: string) {
    return this.getConfigData(section, key) !== undefined ? true : false;
  }
}