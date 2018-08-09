const svgPlay = `
<svg viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="200" fill="#000" />
  <path d="M150 130 L250 200 L150 270 M 0 0 Z" stroke-width="40" stroke="#fff" fill="#000" />
</svg>`

const svgPause = `
<svg viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="200" fill="#000" />
  <path d="M150 130 L150 270 M250 130 L250 270 Z" stroke-width="40" stroke="#fff" fill="#fff" />
</svg>`

const svgYes = `
<svg viewBox="0 0 400 400">
  <path d="M200 20 A180 180 0 1 0 380 200 M110 180 L190 270 L340 90 M0 0 Z"
    stroke-width="40" stroke="#000" fill="white" />
</svg>`

const svgYesGreen = `
<svg viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="200" fill="green" />
  <path d="M110 180 L190 270 L340 90 M0 0 Z" stroke-width="40" stroke="white" fill="green" />
</svg>`

const svgPrev = `
<svg viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="200" fill="#999" />
  <path d="M100 250 L200 150 L300 250 M0 0 Z"
    stroke-width="40" stroke="#fff" fill="#999" />
</svg>`

const svgNext = `
<svg viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="200" fill="#999" />
  <path d="M100 150 L200 250 L300 150 M0 0 Z"
    stroke-width="40" stroke="#fff" fill="#999" />
</svg>`

const svgDelete = `
<svg viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="20" />
  <path d="M12 12 L28 28 M12 28 L28 12 M0 0 Z" stroke="#fff" stroke-width="5" />
</svg>
`

class SlideBar {
  constructor() {
    const wordslideDom = document.createElement('div')
    wordslideDom.className = 'chrome-extension-wordslide'

    const wordslideOp = document.createElement('div')
    wordslideOp.className = 'wordslide-operate'

    const wordslidePause = document.createElement('div')
    wordslidePause.className = 'wordslide-pause'
    wordslidePause.style.display = 'block'
    wordslidePause.innerHTML = svgPause

    const wordslideContinue = document.createElement('div')
    wordslideContinue.className = 'wordslide-continue'
    wordslideContinue.style.display = 'none'
    wordslideContinue.innerHTML = svgPlay

    const wordslideRemember = document.createElement('div')
    wordslideRemember.className = 'wordslide-remember'
    wordslideRemember.innerHTML = svgYes

    const wordslidePrev = document.createElement('div')
    wordslidePrev.className = 'wordslide-prev'
    wordslidePrev.innerHTML = svgPrev

    const wordslideNext = document.createElement('div')
    wordslideNext.className = 'wordslide-next'
    wordslideNext.innerHTML = svgNext

    const wordslideHide = document.createElement('div')
    wordslideHide.className = 'wordslide-hide'
    wordslideHide.innerHTML = svgDelete

    const wordslideData = document.createElement('div')
    wordslideData.className = 'wordslide-data'

    wordslideOp.appendChild(wordslidePause)
    wordslideOp.appendChild(wordslideContinue)
    wordslideOp.appendChild(wordslideRemember)
    wordslideOp.appendChild(wordslidePrev)
    wordslideOp.appendChild(wordslideNext)

    wordslideDom.appendChild(wordslideOp)
    wordslideDom.appendChild(wordslideData)
    wordslideDom.appendChild(wordslideHide)

    wordslidePause.addEventListener('click', () => {
      console.log('pause button is clicked')
      bgPauseSlide().then(() => this.switchToPauseMode())
    })

    wordslideContinue.addEventListener('click', () => {
      console.log('continue button is clicked')
      bgStartSlide().then(() => this.switchToPlayingMode())
    })

    wordslideRemember.addEventListener('click', () => {
      console.log('remember button is clicked')
      console.log(this.currentWord)
      bgAddRemembered(this.currentWord.idx)
    })

    wordslidePrev.addEventListener('click', () => {
      console.log('prev button is clicked')
      bgPauseSlide()
      .then(() => this.switchToPauseMode())
      .then(() => this.updateShowPrev())
    })

    wordslideNext.addEventListener('click', () => {
      console.log('next button is clicked')
      bgPauseSlide()
      .then(() => this.switchToPauseMode())
      .then(() => this.updateShowNext())
    })

    wordslideHide.addEventListener('click', () => {
      console.log('hide button is clicked')
      bgSetDisplay('hide').then(() => this.setDisplay('hide'))
    })

    this.wordslideDom = wordslideDom
    this.wordslideOp = wordslideOp
    this.wordslidePause = wordslidePause
    this.wordslideContinue = wordslideContinue
    this.wordslideRemember = wordslideRemember
    this.wordslideData = wordslideData
    this.wordslideHide = wordslideHide
    this.currentWord = null
    this.intervalHandler = null
  }

  switchToPlayingMode() {
    this.wordslidePause.style.display = 'block'
    this.wordslideContinue.style.display = 'none'
    this.startUpdate()
  }

  switchToPauseMode() {
    this.wordslidePause.style.display = 'none'
    this.wordslideContinue.style.display = 'block'
    this.stopUpdate()
  }

  startUpdate() {
    if (!this.intervalHandler) {
      this.updateShowNormal()
      this.intervalHandler = setInterval(this.updateShowNormal.bind(this), 1000)
    }
  }

  stopUpdate() {
    clearInterval(this.intervalHandler)
    this.intervalHandler = null
  }

  updateWordslideData(curr, prev, direction) {
    const dom1 = genSlideData(prev)
    const dom2 = genSlideData(curr)
    if (direction == 'down') {
      this.currentWord = prev
      this.wordslideData.innerHTML =
        `<div class="wordslide-data-lines-down">${dom1}${dom2}</div>`
    } else {
      this.currentWord = curr
      this.wordslideData.innerHTML =
        `<div class="wordslide-data-lines-up">${dom1}${dom2}</div>`
    }
  }

  isNewWord(newWord) {
    return !this.currentWord || (this.currentWord.idx !== newWord.idx)
  }

  async updateShowNormal() {
    try {
      const { curr, prev } = await bgUpdateWord()
      if (!this.isNewWord(curr)) {
        return
      }
      this.updateWordslideData(curr, prev, 'up')
    } catch (e) {
      console.error('updateShowNormal error:', e)
    }
  }

  async updateShowNext() {
    try {
      const { curr, prev } = await bgNextWord()
      this.updateWordslideData(curr, prev, 'up')
    } catch (e) {
      console.error('updateShowNext error:', e)
    }
  }

  async updateShowPrev() {
    try {
      const { curr, prev } = await bgPrevWord()
      this.updateWordslideData(curr, prev, 'down')
    } catch (e) {
      console.error('updateShowPrev error:', e)
    }
  }

  setDisplay(displayState) {
    console.log('Will set wordslide display to:', displayState)
    switch (displayState) {
    case 'bottom':
      this.wordslideDom.style.display = 'flex'
      this.wordslideDom.style.top = window.innerHeight - 30 + 'px'
      break
    case 'top':
      this.wordslideDom.style.display = 'flex'
      this.wordslideDom.style.top = '0'
      break
    case 'hide':
      this.switchToPauseMode()
      this.wordslideDom.style.display = 'none'
      break
    default:
      console.error('unknown displayState:', displayState)
    }
  }

  async checkAndStart() {
    const stat = await bgCheckState()
    this.setDisplay(stat.displayState)
    if (stat.error) {
      this.wordslideData.innerHTML = stat.error
    }
    if (stat.isPlaying) {
      this.switchToPlayingMode()
    } else {
      this.switchToPauseMode()
    }
  }
}


function genSlideData(w) {
  if (!w) {
    return '<div class="wordslide-data-line"></div>'
  }
  decodeObj(w)
  return `
<div class="wordslide-data-line">
  <div class="wordslide-remember-mark" ${w.remembered ? '' : 'style="display:none"'}>
    ${svgYesGreen}
  </div>
  <div class="wordslide-basic">
    <div class="wordslide-kana">${w.kana}</div>
    <div class="wordslide-tone">${ensureNotUndefined(w.tone)}</div>
    <div class="wordslide-type">${w.type || '-'}</div>
  </div>
  <div class="wordslide-kanzi">${w.kanzi || '-'}</div>
  <div class="wordslide-meaning">${w.meaning}</div>
  <div class="wordslide-lesson">${w.lesson.toString().padStart(2, '0')}</div>
</div>`
}

function ensureNotUndefined(obj) {
  return (typeof obj == 'undefined' ? '-' : obj)
}

function decodeObj(obj) {
  for (var k in obj) {
    if (obj.hasOwnProperty(k) && (typeof obj[k] != 'number')) {
      obj[k] = decodeURI(obj[k])
    }
  }
}

function bgUpdateWord() {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'getWord' }, res)
  })
}

function bgPrevWord() {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'getPrevWord' }, res)
  })
}

function bgNextWord() {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'getNextWord' }, res)
  })
}

function bgStartSlide() {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'startSlide' }, res)
  })
}

function bgPauseSlide() {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'pauseSlide' }, res)
  })
}

function bgCheckState() {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'checkState' }, res)
  })
}

function bgAddRemembered(idx) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'addRemembered', idx }, res)
  })
}

function bgSetDisplay(state) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ action: 'setDisplayState', state }, res)
  })
}


const bar = new SlideBar()

chrome.runtime.onMessage.addListener((req, sender, respFn) => {
  console.log(req)
  bar.setDisplay(req.state)
  return respFn({ status: 'ok' })
})

document.addEventListener('DOMContentLoaded', () => {
  document.body.insertBefore(bar.wordslideDom, document.body.firstChild)
  // document.body.appendChild(wordslideDom)
  bar.setDisplay('bottom')
  setTimeout(() => bar.checkAndStart(), 500)
})

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    bar.checkAndStart()
  }
})

window.addEventListener('resize', () => {
  bar.checkAndStart()
})
