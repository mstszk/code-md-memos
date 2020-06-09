import MarkdownIt = require("markdown-it");
import Token = require("markdown-it/lib/token");

module.exports = (md: MarkdownIt)  => md.use(require('markdown-it-container'), 'container', {
  validate: () => true,
  render: (tokens: Token[], idx: number) => {
    if (tokens[idx].nesting === 1) {
      let headerClass = "container-header ";
      const attrs = tokens[idx].attrs || [];
      headerClass += attrs.filter(el => el[0] === 'class').map(el => el[1]).join(' ');
      // return `<div class="container"><div class="${headerClass}">${tokens[idx].info.trim()}</div><div class="container-content">`;
      return `<div class="container"><div class="${headerClass}">${md.render(tokens[idx].info.trim())}</div><div class="container-content">`;
    } else {
      return '</div></div>\n';
    }
  }
});
