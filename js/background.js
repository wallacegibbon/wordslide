const dataUrls = [
  'https://gitee.com/wallacegibbon/staticfiles/raw/master/japanese/words.json',
  'https://raw.githubusercontent.com/wallacegibbon/staticfiles/master/japanese/words.json',
]

class State {
  constructor() {
    this.rememberedWords = JSON.parse(localStorage.rememberedWords || '[]')
    this.currentLesson = localStorage.currentLesson || 'all'
    this.currentType = localStorage.currentType || 'all'
    this.displayState = localStorage.displayState || 'bottom'
    this.currentInterval = Number(localStorage.currentInterval || 3000)
    this.intervalHandler = null
    this.isPlaying = true
    this.originalWords = []
    this.words = []
    this.lessons = []
    this.wordTypes = []
    this.currentIndex = 0
    this.currentWord = null
    this.error = null
  }

  updateWords() {
    this.words = this.originalWords.filter(x => {
      if (this.rememberedWords.indexOf(x.idx) != -1) {
        return false
      }
      if (this.currentLesson != 'all' && this.currentLesson != x.lesson) {
        return false
      }
      if (this.currentType != 'all' && this.currentType != x.type) {
        return false
      }
      return true
    })
  }

  resetWordsAndIndex() {
    this.updateWords()
    this.currentIndex = 0
  }

  resetRemembered() {
    log('all remembered words cleared')
    this.rememberedWords = []
    localStorage.rememberedWords = '[]'
  }

  addRemembered(idx) {
    log(`trying to add idx ${idx} to remembered`)
    if (this.rememberedWords.indexOf(idx) == -1) {
      this.rememberedWords.push(idx)
      localStorage.rememberedWords = JSON.stringify(this.rememberedWords)
    }
  }

  setCurrentInterval(interval) {
    this.currentInterval = interval
    localStorage.currentInterval = interval
  }

  setCurrentLesson(lesson) {
    this.currentLesson = lesson
    localStorage.currentLesson = lesson
  }

  setCurrentType(wordType) {
    this.currentType = wordType
    localStorage.currentType = wordType
  }

  setDisplayState(displayState) {
    this.displayState = displayState
    localStorage.displayState = displayState
    if (this.displayState == 'hide') {
      this.pause()
    }
  }

  updateCurrentWord() {
    this.currentWord = this.words[this.currentIndex]
    this.currentIndex++
    if (this.currentIndex >= this.words.length) {
      this.resetWordsAndIndex()
    }
  }

  setupLoop(interval) {
    log('setupLoop is called with argument:', interval)
    // If the argument is invalid, use the currentInterval instead.
    if (!(interval >= 1000)) {
      interval = this.currentInterval
    } else {
      this.setCurrentInterval(interval)
    }
    if (this.intervalHandler) {
      log('**Err, intervalHandler not null')
      return
    }
    if (!this.isPlaying) {
      log('isPlaying flag is false')
      return
    }
    this.updateCurrentWord()
    const fn = this.updateCurrentWord.bind(this)
    this.intervalHandler = setInterval(fn, interval)
  }

  stopLoop() {
    clearInterval(this.intervalHandler)
    this.intervalHandler = null
  }

  /**
   * will be called from popup page
   */
  resetLoop() {
    log('resetLoop is called')
    this.resetWordsAndIndex()
    this.stopLoop()
    this.setupLoop()
  }

  /**
   * will be called from popup page
   */
  adjustSpeed(interval) {
    log(`adjustSpeed(interval)`)
    if (interval === this.currentInterval) {
      return
    }
    this.stopLoop()
    this.setupLoop(interval)
  }

  pause() {
    log('pause() called')
    if (this.isPlaying) {
      this.isPlaying = false
      this.stopLoop()
    }
  }

  continue() {
    log('continue() called')
    if (!this.isPlaying) {
      this.isPlaying = true
      this.setupLoop()
    }
  }

  messageHandler(req, sender, respFn) {
    switch (req.action) {
    case 'checkState':
      return respFn(selectFields(this, [ 'isPlaying', 'displayState', 'error' ]))
    case 'startSlide':
      this.continue()
      return respFn({ status: 'ok' })
    case 'pauseSlide':
      this.pause()
      return respFn({ status: 'ok' })
    case 'setDisplayState':
      this.setDisplayState(req.state)
      return respFn({ status: 'ok' })
    case 'addRemembered':
      this.addRemembered(req.idx)
      return respFn({ status: 'ok' })
    case 'getWord':
      return respFn(this.currentWord)
    default:
      log('**Err, action unknown', req)
    }
  }

  async start() {
    try {
      const resp = await fetchUrls(dataUrls, 3000)
      this.originalWords = await resp.json()
    } catch (e) {
      this.error = 'Failed fetching remote words'
      log('*Err,', e)
      return
    }
    log('Fetching remote words finished.')
  
    this.wordTypes = uniqAndSortByLen(this.originalWords.map(x => x.type))
    this.lessons = uniqArray(this.originalWords.map(x => x.lesson))
  
    this.resetWordsAndIndex()
    this.setupLoop()
  }
}


function selectFields(obj, fields) {
  const r = {}
  fields.forEach(e => r[e] = obj[e])
  return r
}

function uniqArray(originalArray) {
  return Array.from(new Set(originalArray))
}

function uniqAndSortByLen(originalArray) {
  return uniqArray(originalArray).filter(x => x).sort((a, b) => {
    if (b.length === a.length) {
      if (a > b) {
        return 1
      } else {
        return -1
      }
    } else {
      return b.length - a.length
    }
  })
}

function log(...args) {
  console.log((new Date()).toISOString(), ...args)
}

/** Have to use "var", so that popup.js can get access to this variable */
var state = new State()

chrome.runtime.onMessage.addListener(state.messageHandler.bind(state))

state.start().catch(log)
