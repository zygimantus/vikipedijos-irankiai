// ==UserScript==
// @name        E-TAR.LT Citation Generator for Wikipedia
// @namespace   https://github.com/zygimantus/vikipedijos-irankiai
// @description Generates Wikipedia {{cite act}} references automatically from e-tar.lt articles
// @match       https://e-tar.lt/*
// @match       https://www.e-tar.lt/*
// @version     1.0.1
// @author      Zygimantus
// @icon        https://www.e-tar.lt/resources/img/favicon.ico
// @run-at      document-end
// @noframes    
// @downloadURL https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-act-etar.user.js
// @updateURL   https://zygimantus.github.io/vikipedijos-irankiai/scripts/cite-act-etar.user.js
// @supportURL  https://github.com/zygimantus/vikipedijos-irankiai/issues
// @homepageURL https://github.com/zygimantus/vikipedijos-irankiai
// @license     MIT
// @grant       GM.getValue
// @grant       GM.setClipboard
// @grant       GM.setValue
// ==/UserScript==

(function () {
'use strict';

const url = window.location;
const titleEl = document.getElementById('mainForm:laTitle');
const title = titleEl.textContent;
const type = document.getElementsByClassName('ui-panelgrid-cell')[1].textContent;
const date = document.getElementsByClassName('ui-panelgrid-cell')[4].textContent;
const index = document.getElementsByClassName('ui-panelgrid-cell')[11].textContent;
const legislature = document.getElementsByClassName('ui-panelgrid-cell')[17].textContent.trim();

// current date
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
const accessDate = now.toJSON().slice(0, 10);
GM.setClipboard(`<ref>{{cite act |type=${type} |index=${index} |date=${date} |legislature=[[${legislature}]] |title=${title} |url=${url} |access-date=${accessDate} |language=lt}}</ref>`);

})();
