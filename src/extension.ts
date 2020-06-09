import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');

export function activate() {
  vscode.commands.registerCommand(
    "extension.code-md-memos.print",
    require("./plugin/print")
  );

  return {
    extendMarkdownIt(md: MarkdownIt) {
      require('./markdown')(md);
			return md;
    }
  };
}
