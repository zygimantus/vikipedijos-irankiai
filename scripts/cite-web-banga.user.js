// ==UserScript==
// @name        GARGZDAI.LT Citation Generator for Wikipedia
// @namespace   https://github.com/zygimantus/vikipedijos-irankiai
// @description Generates Wikipedia {{cite web}} references automatically from gargzdai.lt articles
// @match       https://gargzdai.lt/*
// @match       https://www.gargzdai.lt/*
// @version     1.0.0
// @author      Zygimantus
// @icon        https://www.gargzdai.lt/favicon.ico
// @run-at      document-end
// @noframes    
// @downloadURL https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-web-banga.user.js
// @updateURL   https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-web-banga.user.js
// @supportURL  https://github.com/zygimantus/vikipedijos-irankiai/issues
// @homepageURL https://github.com/zygimantus/vikipedijos-irankiai
// @license     MIT
// @grant       GM.getValue
// @grant       GM.setClipboard
// @grant       GM.setValue
// ==/UserScript==

(function () {
'use strict';

const USE_REF_NAME_KEY = 'USE_REF_NAME';
const CITE_WEB_REGEX = /^<ref(?:\s+name="[^"]*")?>\{\{cite web\s*((?:\|\s*[\w-]+\s*=\s*[^]+?)+)\s*\}\}<\/ref>$/iu;
async function getUseRefName() {
  const stored = await GM.getValue(USE_REF_NAME_KEY);
  if (stored === undefined) {
    await GM.setValue(USE_REF_NAME_KEY, false);
    return false;
  }
  return Boolean(stored);
}
async function generateCiteWeb(data) {
  var _data$publisher;
  const now = new Date();
  const accessDate = data.accessDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const useRefName = await getUseRefName();
  const refName = useRefName && (data.refName || ((_data$publisher = data.publisher) == null ? void 0 : _data$publisher.toLowerCase().replace(/\s+/g, '')));
  let cite = `<ref${refName ? ` name="${refName}"` : ''}>{{cite web`;
  cite += ` |title=${data.title} |url=${data.url}`;
  const fields = {
    last: data.last && capitalizeName(data.last),
    first: data.first && capitalizeName(data.first),
    author: data.author,
    agency: data.agency,
    editor: data.editor,
    date: data.date,
    'orig-date': data.origDate && data.origDate !== data.date ? data.origDate : undefined,
    website: data.website,
    publisher: data.publisher,
    'access-date': accessDate,
    language: data.language
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value) cite += ` |${key}=${value}`;
  }
  return cite + '}}</ref>';
}
function copyToClipboard(text) {
  if (CITE_WEB_REGEX.test(text)) {
    GM.setClipboard(text);
    console.log(text);
  } else {
    console.warn('Generated citation is invalid, please reach out developer');
  }
}
function capitalizeName(name) {
  return name.split(/\s+/).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

async function generate(config) {
  const run = async () => {
    const getValue = v => typeof v === 'function' ? v() : v;
    const resolveSelectorOrValue = input => {
      if (typeof input === 'string') {
        var _el$textContent;
        const el = document.querySelector(input);
        return (el == null || (_el$textContent = el.textContent) == null ? void 0 : _el$textContent.trim()) || '';
      }
      return getValue(input);
    };
    const url = window.location.href;
    const title = resolveSelectorOrValue(config.title);
    let date = '';
    if (config.date) {
      date = resolveSelectorOrValue(config.date);
      if (config.dateFormat) date = config.dateFormat(date);
    }
    let origDate = '';
    if (config.origDate) {
      origDate = resolveSelectorOrValue(config.origDate);
    }
    let first = '';
    let last = '';
    let author = '';
    if (config.author) {
      const authorRaw = resolveSelectorOrValue(config.author);
      if (config.forceAuthor === true) {
        author = authorRaw;
      } else if (authorRaw.length < 40) {
        const parts = authorRaw.split(/\s+/);
        if (parts.length > 1) {
          first = parts.slice(0, -1).join(' ');
          if (first.length < 3) first = '';else last = parts.slice(-1)[0];
        }
      }
    }
    let editor = '';
    if (config.editor) {
      editor = resolveSelectorOrValue(config.editor);
    }
    let agency = '';
    if (config.agency) {
      agency = normalizeAgency(resolveSelectorOrValue(config.agency));
    }
    let website = '';
    if (config.website) {
      website = getValue(config.website);
    }
    const data = {
      title,
      url,
      last,
      first,
      author,
      editor,
      agency,
      date,
      origDate,
      publisher: config.publisher ? getValue(config.publisher) : '',
      website,
      refName: getValue(config.refName),
      language: config.language ? getValue(config.language) : 'lt'
    };
    const cite = await generateCiteWeb(data);
    copyToClipboard(cite);
  };
  if (config.delay && config.delay > 0) {
    setTimeout(run, config.delay);
  } else {
    run();
  }
}
function normalizeAgency(agency) {
  const lower = agency.trim().toLowerCase();
  if (lower === 'bns') return '[[BNS]]';
  if (lower === 'elta') return '[[ELTA]]';
  return '';
}

generate({
  title: '.post-title.lg',
  date: () => {
    var _document$querySelect;
    return (_document$querySelect = document.querySelector('meta[property="article:published_time"]')) == null ? void 0 : _document$querySelect.getAttribute('content');
  },
  dateFormat: raw => raw.split('T')[0],
  publisher: '[[Banga (Klaipėda)|Banga]]',
  website: 'gargzdai.lt',
  refName: 'banga'
});

})();
