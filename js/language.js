const localeSnippetsEn = {
  period: 'Show next in every',
  period1: 'seconds',
  period2: 'update',
  dp: 'Set position',
  dp1: 'bottom',
  dp2: 'top',
  dp3: 'hide',
  lesson: 'Select lesson',
  clearRem: 'Clear remembered',
  clearRem1: 'clear',
  restart: 'Back to first word',
  restart1: 'back',
  wordType: 'Word type',
  all: 'all',
}

const localeSnippetsCn = {
  period: '单词播放时间间隔为',
  period1: '秒',
  period2: '更新',
  dp: '单词条显示控制',
  dp1: '底部显示',
  dp2: '顶部显示',
  dp3: '隐藏',
  lesson: '选择课文',
  clearRem: '清空已记忆单词',
  clearRem1: '清空',
  restart: '回到第一个单词',
  restart1: '复位',
  wordType: '选择单词类型',
  all: '全部',
}

var currentLocale = localeSnippetsEn


function renderPopup(lang) {
  return `
<div class="menu-group">
  <div class="menu-name">
    <div class="interval-group">
      <span>${lang.period}</span><!--
      --><input class="txt" type="text" id="intervalInput" /><!--
      --><span class="unit">${lang.period1}</span>
    </div>
  </div>
  <div class="btn" id="updateButton">${lang.period2}</div>
</div>
<div class="menu-group">
  <div class="menu-name">${lang.clearRem}<span id="remember"></span></div>
  <div class="btn" id="clearButton">${lang.clearRem1}</div>
</div>
<div class="menu-group">
  <div class="menu-name">${lang.restart}</div>
  <div class="btn" id="resetButton">${lang.restart1}</div>
</div>
<div class="menu-group">
  <div class="menu-name">${lang.dp}</div>
  <select id="displaySelect">
    <option value="bottom">${lang.dp1}</option>
    <option value="top">${lang.dp2}</option>
    <option value="hide">${lang.dp3}</option>
  </select>
</div>
<div class="menu-group">
  <div class="menu-name">${lang.lesson}</div>
  <select id="lessonSelect"></select>
</div>
<div class="menu-group">
  <div class="menu-name">${lang.wordType}</div>
  <select id="typeSelect"></select>
</div>
`
}

function setLocale(language) {
  switch (language) {
  case 'zh-CN':
    currentLocale = localeSnippetsCn
    break
  default:
    currentLocale = localeSnippetsEn
  }
}

setLocale(navigator.language)
// setLocale('en-US')
// setLocale('zh-CN')

const mountDom = document.querySelector('#content')
mountDom.innerHTML = renderPopup(currentLocale)