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

async function fetchUrls(urls, timeout) {
  const fn = makeFetchFn(timeout)
  for (var url of urls) {
    try {
      console.log(`fetching data from ${url}...`)
      return await fn(url)
    } catch (e) {
      console.error(`failed fetching ${url}:`, e)
    }
  }
  throw new Error('Failed on urls: ${urls}')
}