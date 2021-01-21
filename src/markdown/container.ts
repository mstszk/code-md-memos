import MarkdownIt = require("markdown-it");
import Token = require("markdown-it/lib/token");

module.exports = (md: MarkdownIt)  => md.use(require('markdown-it-container'), 'container', {
  validate: () => true,
  render: (tokens: Token[], idx: number) => {
    if (tokens[idx].nesting === 1) {
      const header = tokens[idx].info.split(" ").filter(t => !t.startsWith(".")).join(" ");
      const classes = tokens[idx].info.split(" ").filter(t => t.startsWith(".")).map(t => t.slice(1, )).join(" ");
      return `<div class="container ${classes}"><div class="container-header">${md.render(header)}</div><div class="container-content">`;
    } else {
      return '</div></div>\n';
    }
  }
});
