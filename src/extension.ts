// import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');
import Token = require("markdown-it/lib/token");

export function activate() {
  return {
    extendMarkdownIt(md: MarkdownIt) {
      md.use(require('markdown-it-emoji'));
      md.renderer.rules.emoji = (tokens: Token[], idx: number) => {
        return `<span class="emoji emoji_${tokens[idx].markup}">${tokens[idx].content}</span>`;
      };
      md.use(require('markdown-it-sub'));
      md.use(require('markdown-it-sup'));
      md.use(require('markdown-it-mark'));
      md.use(require('markdown-it-underline'));
      md.use(require('markdown-it-imsize'));
      md.use(require('markdown-it-bracketed-spans'));
      md.use(require('markdown-it-attrs'), {
        leftDelimiter: '{{',
        rightDelimiter: '}}',
      });
      md.use(require('./plugins/container'));
			md.use(require('./plugins/bib'));
			return md;
    }
  };
}
