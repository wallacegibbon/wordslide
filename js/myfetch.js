function makeFetchFn(timeout) {
  return function(...args) {
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(new Error(`fetch timeout(${timeout})`)), timeout)
      try {
        fetch(...args)
        .then(resp => {
          clearTimeout(timer)
          res(resp)
        })
        .catch(rej)
      } catch (e) {
        rej(e)
      }
    })
  }
}
