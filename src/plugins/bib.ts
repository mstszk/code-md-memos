import MarkdownIt = require("markdown-it");
import Token = require("markdown-it/lib/token");
import StateInline = require("markdown-it/lib/rules_inline/state_inline");

const fs = require('fs');
const { parseBibFile } = require("bibtex");

const bibPath = process.env.BIB;
let bibFile = '';
if (fs.existsSync(bibPath)) {
  bibFile = fs.readFileSync(bibPath).toString();
}
const bib = parseBibFile(bibFile);

function bib_rule(state: StateInline) {
  if (state.src[state.pos] !== "[" || state.src[state.pos+1] !== "@") {
    return false;
  }
  const start = state.pos;
  state.pos = start + 2;

  let key;
  while (state.pos < state.posMax) {
    if (state.src[state.pos] === "]") {
      key = state.src.slice(start + 2, state.pos);
      break;
    }
    state.pos += 1;
  }
  if (!key || key.length < 1) {
    state.pos = start;
    return false;
  }
  let token = state.push("bib", "bib", 0);
  token.content = key;

  state.pos += 1;
  return true;
}

module.exports = (md: MarkdownIt) => {
  md.inline.ruler.after('text', 'bib', bib_rule);
  md.renderer.rules.bib = (tokens: Token[], idx: number) => {
    const key = tokens[idx].content;
    const title = bib.getEntry(key).getFieldAsString('title');
    const author = bib.getEntry(key).getField('author');
    const doi = bib.getEntry(key).getFieldAsString('doi');
    const year = bib.getEntry(key).getFieldAsString('year');
    let authors: string[] = [];
    author.authors$.map((author: any) => {
      authors.push(author.initials.join(". ") + ". " + author.lastNames.join(" "));
    });
    return `<span class="bib"><span class="authors">${authors.join(', ')}</span>, <a class="title" href="http://dx.doi.org/${doi}" target="_blank" rel="noopener">"${title}"</a>, <span class="year">${year}</span></span>`;
  };
};
