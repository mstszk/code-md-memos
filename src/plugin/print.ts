import * as vscode from "vscode";
const path = require("path");
const fs = require('fs');
const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
});
require('../markdown')(md);
md.use(require('@neilsustc/markdown-it-katex'));
const mustache = require('mustache');
const templatePath = path.resolve(__dirname, '../../template/template.mustache');
const template = fs.readFileSync(templatePath, 'utf-8');
const mdstylePath = path.resolve(__dirname, '../../styles/mdstyle.css');
const printstylePath = path.resolve(__dirname, '../../styles/printstyle.css');
const mdstyle = fs.readFileSync(mdstylePath, 'utf-8');
const printstyle = fs.readFileSync(printstylePath, 'utf-8');
const style = mdstyle + printstyle;
const puppeteer = require('puppeteer');

import { window, ProgressLocation } from "vscode";

module.exports = () => {
  window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "I am long running!",
      cancellable: true,
    },
    (progress, token) => {
      token.onCancellationRequested(() => {
        console.log("User canceled the long running operation");
      });
      let distDir: string = vscode.workspace.getConfiguration("code-md-memos").get("distDir") || '.';
      if (distDir[0] === '.') {
        distDir = path.resolve(vscode.workspace.rootPath, distDir);
      }
      if (!fs.existsSync(distDir)) {fs.mkdirSync(distDir);};

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      let text = editor.document.getText();
      const title = path.basename(editor.document.fileName).slice(0, -3);

      let body = md.render(text);
      // copy from https://github.com/yzhang-gh/vscode-markdown/blob/a8f43db77036ae3868355430be37ebc2f0fc5e2a/src/print.ts
      const imgTagRegex = /(<img[^>]+src=")([^"]+)("[^>]*>)/g;
      body = body.replace(imgTagRegex, (_: string, p1: string, p2: string, p3: string) => {
        if (p2.startsWith('http') || p2.startsWith('data:')) {
            return _;
        }
        const imgSrc = path.resolve(vscode.workspace.rootPath, p2.replace(/%20/g, ' '));
        try {
            let imgExt = path.extname(imgSrc).slice(1);
            if (imgExt === "jpg") {
                imgExt = "jpeg";
            } else if (imgExt === "svg") {
                imgExt += "+xml";
            }
            const file = fs.readFileSync(imgSrc).toString('base64');
            return `${p1}data:image/${imgExt};base64,${file}${p3}`;
        } catch (e) {
          console.error(e);
        }
        return _;
      });
      const view = { body, style };
      const html = mustache.render(template, view);

      return puppeteer
      .launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      .then(async (browser: any) => {
        const page = await browser.newPage();
        await page.setContent(html);
        await page.waitFor(3000);
        await page.pdf({
          path: path.resolve(distDir, title + '.pdf'),
          format: 'A4',
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
          }
        });
        await browser.close();
      })
      .then(() => {
        return console.log('finished');
      });
    }
  );
};
