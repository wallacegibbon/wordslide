const intervalInput = document.querySelector("#intervalInput")
const updateButton = document.querySelector("#updateButton")
const resetButton = document.querySelector("#resetButton")
const clearButton = document.querySelector("#clearButton")
const remember = document.querySelector("#remember")
const loopCount = document.querySelector("#loopCount")
const displaySelect = document.querySelector("#displaySelect")
const lessonSelect = document.querySelector("#lessonSelect")
const typeSelect = document.querySelector("#typeSelect")
const dataSrc = document.querySelector("#dataSrc")
const localFile = document.querySelector('#localFile')

const bgPage = chrome.extension.getBackgroundPage()
const bgState = bgPage.state


function genOptions(itemList) {
  const l = itemList.map(x => `<option value="${x}">${decodeURI(x)}</option>`)
  l.unshift(`<option value="all">${currentLocale.all}</option>`)
  return l.join('\n')
}

function updateButtonHandler() {
  console.log("updateButton clicked")
  const interval = parseInt(intervalInput.value)
  bgState.adjustSpeed(interval * 1000)
}

function resetButtonHandler() {
  console.log("resetButton clicked")
  bgState.resetLoop()
}

function clearButtonHandler() {
  console.log("clearButton clicked")
  bgState.resetRemembered()
  bgState.resetLoop()
  updateRememberInfo()
}

function lessonSelectHandler() {
  console.log('lessonSelectHandler is called, current value:', lessonSelect.value)
  bgState.setCurrentLesson(lessonSelect.value)
  bgState.resetLoop()
  updateLoopCountInfo()
}

function typeSelectHandler() {
  console.log('typeSelectHandler is called, current value:', typeSelect.value)
  bgState.setCurrentType(typeSelect.value)
  bgState.resetLoop()
  updateLoopCountInfo()
}

function displaySelectHandler() {
  console.log('displaySelectHandler is called, current value:', displaySelect.value)
  bgState.setDisplayState(displaySelect.value)
  moveWordsBar(displaySelect.value)
}

function readFileContent(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.readAsText(file, 'utf-8')
    reader.onload = function(e) {
      res(e.target.result)
    }
    reader.onerror = function(e) {
      console.error('readFileContent failed:', e)
      rej(e.target.error)
    }
  })
}

async function fileHandler(e) {
  const f = e.target.files[0]
  if (!f) {
    console.error('fileHandler error: file not selected')
    return
  }
  const t = await readFileContent(f)
  const words = JSON.parse(t)

  bgState.originalWords = words
  bgState.initDataFromOriginalWords()
  bgState.resetWordsAndIndex()
  bgState.setupLoop()

  bgState.dataSrc = f.name
  refreshPage()
}

function updateRememberInfo() {
  const s = `(${bgState.rememberedWords.length}/${bgState.originalWords.length})`
  remember.innerHTML = s
}

function updateLoopCountInfo() {
  loopCount.innerHTML = bgState.words.length
}

function updateDataSrc() {
  dataSrc.innerHTML = bgState.dataSrc
}


function chromeGetTabs() {
  return new Promise((res, rej) => {
    chrome.tabs.query({ active: true, currentWindow: true }, res)
  })
}

function chromeTabSendMsg(tabId, msg) {
  return new Promise((res, rej) => {
    chrome.tabs.sendMessage(tabId, msg, res)
  })
}

async function sendMsgToContent(msg) {
  const tabs = await chromeGetTabs()
  const ps = tabs.map(x => chromeTabSendMsg(x.id, msg))
  return await Promise.all(ps)
}

async function moveWordsBar(position) {
  console.log('moving word bar to position:', position)
  switch (position) {
  case 'bottom':
  case 'top':
  case 'hide':
    await sendMsgToContent({ state: position })
    break
  default:
    console.error('moveWordsBar invalid position:', position)
  }
}

function refreshPage() {
  intervalInput.value = bgState.currentInterval / 1000
  lessonSelect.innerHTML = genOptions(bgState.lessons)
  typeSelect.innerHTML = genOptions(bgState.wordTypes)
  lessonSelect.value = bgState.currentLesson
  typeSelect.value = bgState.currentType
  displaySelect.value = bgState.displayState
  updateRememberInfo()
  updateLoopCountInfo()
  updateDataSrc()
}

updateButton.addEventListener("click", updateButtonHandler)
resetButton.addEventListener("click", resetButtonHandler)
clearButton.addEventListener('click', clearButtonHandler)
displaySelect.addEventListener('change', displaySelectHandler)
lessonSelect.addEventListener('change', lessonSelectHandler)
typeSelect.addEventListener('change', typeSelectHandler)
localFile.addEventListener('change', fileHandler)

refreshPage()