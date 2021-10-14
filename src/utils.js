
export function fetchSource (url) {
  return fetch(url).then((res) => {
    return res.text()
  })
}

 let currentMicroAppName = null
 export function setCurrentAppName (appName) {
   currentMicroAppName = appName
 }

 export function getCurrentAppName () {
   return currentMicroAppName
 }