// ==UserScript==
// @name        VEIDAS.LT Citation Generator for Wikipedia
// @namespace   https://github.com/zygimantus/vikipedijos-irankiai
// @description Generates Wikipedia {{cite web}} references automatically from veidas.lt articles
// @match       http://veidas.lt/*
// @match       http://www.veidas.lt/*
// @version     1.0.0
// @author      Zygimantus
// @icon        https://favicon.pub/veidas.lt
// @run-at      document-end
// @noframes    
// @downloadURL https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-web-veidas.user.js
// @updateURL   https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-web-veidas.user.js
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
    'access-date': data.archiveDate != undefined ? undefined : accessDate,
    'archive-url': data.archiveUrl,
    'archive-date': data.archiveDate,
    language: data.language
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value) cite += ` |${key}=${value}`;
  }
  return cite + '}}</ref>';
}
function copyToClipboard(text) {
  GM.setClipboard(text);
  console.log(text);
}
function capitalizeName(name) {
  return name.split(/\s+/).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

const getValue = v => typeof v === 'function' ? v() : v;
const resolveSelectorOrValue = input => {
  if (typeof input === 'string') {
    var _el$textContent;
    const el = document.querySelector(input);
    return (el == null || (_el$textContent = el.textContent) == null ? void 0 : _el$textContent.trim()) || '';
  }
  return getValue(input);
};

function normalizeAgency(agency) {
  const lower = agency.trim().toLowerCase();
  if (lower === 'bns') return '[[BNS]]';
  if (lower === 'elta') return '[[ELTA]]';
  return '';
}

async function prepareCitation(config) {
  let url;
  if (!config.archive) {
    url = window.location.href;
  } else {
    url = resolveSelectorOrValue(config.url);
  }
  const title = resolveSelectorOrValue(config.title);
  let date = '';
  if (config.date) {
    date = resolveSelectorOrValue(config.date);
    if (config.dateFormat) date = config.dateFormat(date);
  }
  const origDate = config.origDate ? resolveSelectorOrValue(config.origDate) : '';
  let first = '',
    last = '',
    author = '';
  if (config.author) {
    const authorRaw = resolveSelectorOrValue(config.author);
    if (typeof authorRaw !== 'string') ; else {
      const a = authorRaw.trim();
      if (!a) ; else if (config.forceAuthor) {
        author = a;
      } else if (a.length < 40) {
        const parts = a.split(/\s+/);
        if (parts.length > 1) {
          first = parts.slice(0, -1).join(' ');
          if (first.length < 3) first = '';else last = parts.slice(-1)[0];
        }
      }
    }
  }
  const data = {
    title,
    url,
    last,
    first,
    author,
    editor: config.editor ? resolveSelectorOrValue(config.editor) : '',
    agency: config.agency ? normalizeAgency(resolveSelectorOrValue(config.agency)) : '',
    date,
    origDate,
    publisher: config.publisher ? getValue(config.publisher) : '',
    website: config.website ? getValue(config.website) : '',
    archiveDate: config.archive ? getValue(config.archiveDate) : undefined,
    archiveUrl: config.archive ? getValue(config.archiveUrl) : '',
    refName: getValue(config.refName),
    language: config.language ? getValue(config.language) : ''
  };
  return generateCiteWeb(data);
}

async function generate(config) {
  const run = async () => {
    const cite = await prepareCitation(config);
    copyToClipboard(cite);
  };
  if (config.delay && config.delay > 0) {
    setTimeout(run, config.delay);
  } else {
    run();
  }
}

const months = {
  sausio: '01',
  vasario: '02',
  kovo: '03',
  balandžio: '04',
  gegužės: '05',
  birželio: '06',
  liepos: '07',
  rugpjūčio: '08',
  rugsėjo: '09',
  spalio: '10',
  lapkričio: '11',
  gruodžio: '12'
};

generate({
  title: '#post-52169 h2 a',
  date: '.singletags.singletags_margins',
  dateFormat: raw => {
    const clean = raw.toLowerCase();
    const parts = clean.split(/\s+/);
    if (parts.length >= 3) {
      const [year, monthLt, day] = parts;
      const month = months[monthLt.toLowerCase()] || '??';
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
    return raw;
  },
  publisher: '[[Veidas (žurnalas)|Veidas]]',
  website: 'veidas.lt',
  refName: 'veidas'
});

})();
