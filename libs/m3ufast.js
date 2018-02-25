/**
 * this m3u parser is not design to parse EXTINFO
 * only to read out only title and url
 *
 * by NimitzDEV
 */

const fs = require('fs')
const readline = require('readline')

module.exports = {
  read: function(path) {
    return new Promise((resolve, reject) => {
      const itf = readline.createInterface({
        input: fs.createReadStream(path, { encoding: 'utf-8' }),
      })

      const result = []
      let counter = 0

      itf.on('line', line => {
        if (line.startsWith('#EXTINF')) {
          const d = { title: '', url: '' }
          d.title = line.slice(line.lastIndexOf(',') + 1, line.length)
          result.push(d)
          return
        }
        if (!line.startsWith('#EXTM3U')) {
          result[counter].url = line
          counter++
        }
      })

      itf.on('close', () => {
        resolve(result)
      })
    })
  },
}
