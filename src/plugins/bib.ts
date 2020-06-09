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
    const entry = bib.getEntry(tokens[idx].content);
    const title = entry.getFieldAsString('title');
    const author = entry.getField('author');
    let authors: string[] = [];
    author.authors$.map((author: any) => {
      authors.push(author.initials.join(". ") + ". " + author.lastNames.join(" "));
    });
    const year = entry.getFieldAsString('year');
    const doi = entry.getFieldAsString('doi');
    const arxivid = entry.getFieldAsString('arxivid');
    let url: string = '';
    if (doi) {
      url = `http://dx.doi.org/${doi}`;
    } else if (arxivid) {
      url = `http://arxiv.org/abs/${arxivid}`;
    }
    const titleEl = url ? `<a class="title" href="${url}" target="_blank" rel="noopener">"${title}"</a>` : `<span class="title">${title}</span>`;
    return `<span class="bib"><span class="authors">${authors.join(', ')}</span>, ${titleEl}, <span class="year">${year}</span></span>`;
  };
};
