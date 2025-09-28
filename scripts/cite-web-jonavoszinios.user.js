// ==UserScript==
// @name        JONAVOSZINIOS.LT Citation Generator for Wikipedia
// @namespace   https://github.com/zygimantus/vikipedijos-irankiai
// @description Generates Wikipedia {{cite web}} references automatically from jonavoszinios.lt articles
// @match       https://jonavoszinios.lt/*
// @match       https://www.jonavoszinios.lt/*
// @version     1.0.0
// @author      Zygimantus
// @icon        https://zygimantus.github.io/vikipedijos-irankiai/favicon/favicon.ico
// @run-at      document-end
// @noframes    
// @downloadURL https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-web-jonavoszinios.user.js
// @updateURL   https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-web-jonavoszinios.user.js
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
    website: data.website,
    publisher: data.publisher,
    'orig-date': data.origDate && data.origDate !== data.date ? data.origDate : undefined,
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
    if (config.author) {
      const authorRaw = resolveSelectorOrValue(config.author);
      if (authorRaw.length < 40) {
        const parts = authorRaw.split(/\s+/);
        if (parts.length > 1) {
          first = parts.slice(0, -1).join(' ');
          if (first.length < 3) first = '';else last = parts.slice(-1)[0];
        }
      }
    }
    let agency = '';
    if (config.agency) {
      agency = normalizeAgency(resolveSelectorOrValue(config.agency));
    }
    const data = {
      title,
      url,
      last,
      first,
      author: '',
      agency,
      date,
      origDate,
      publisher: config.publisher ? getValue(config.publisher) : '',
      website: getValue(config.website),
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
  title: '.entry-title h1',
  date: () => {
    const metaWrapper = document.querySelector('.float-left.w-90.hidden-md-down li');
    // Get all text content inside (including text nodes)
    const textNodes = Array.from(metaWrapper.childNodes).filter(node => node.nodeType === Node.TEXT_NODE) // only text nodes
    .map(node => node.textContent.trim()) // trim whitespace
    .filter(Boolean); // remove empty strings

    // The date is usually the second text node (after author)
    return textNodes[0];
  },
  website: 'jonavoszinios.lt',
  refName: 'jonavoszinios'
});

})();
