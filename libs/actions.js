const dir = require('./dir')
const dvr = require('./recorder')
let cacheList = []

async function recorder(args, callback) {
  let list = []

  if (cacheList.length > 0 && !args.options.reload) {
    this.log('Using cached list, use -r option to force reload')
    list = cacheList
  }

  if (cacheList.length === 0 || args.options.reload) {
    this.log('Reading channel list...')
    list = await dir.getChannelList()
  }

  if (!list) {
    this.log(
      'no m3u list found, please update m3u list first by using updatem3u command',
    )
    callback()
  }

  cacheList = list

  this.log(`list read finish, found ${list.length} channel(s)`)

  if (args.options.list) {
    cacheList.forEach((channel, index) => {
      this.log(`ID: ${index + 1}, ${channel.title}`)
    })
  }

  if (args.options.dvr) {
    if (!args.options.dvr) this.log('Please provide DVR ID!')
    const channel = cacheList[parseInt(args.options.dvr) - 1] || null
    if (!channel) this.log(`Channel ${args.options.dvr} not found!`)
    else {
      this.log(`DVR started for channel ${channel.title}, use state command to see details`)
      dvr.addTask(channel)
    }
  } else {
    this.log('No DVR action at this time')
  }

  callback()
}

function setM3UAddr(args, callback) {
  if (!args.addr.match(/^https?:\/\//)) {
    this.log('not a valid url')
    return callback()
  }

  dir.setConfig('addr', args.addr)
  this.log(`M3U Update Url is set to ${args.addr}`)

  return this.prompt(
    {
      type: 'confirm',
      name: 'update',
      default: false,
      message: 'do you want to update now ?',
    },
    result => {
      if (result.update) {
        this.log('updating')
      } else {
        this.log('no')
      }
    },
  )

  callback()
}

function updateM3UFile(args, callback) {
  const file = dir.readConfig()['addr'] || null
  if (!file) {
    this.log('please set m3u address first by using setaddr command')
    return callback()
  }

  this.log('updating m3u list')

  dir
    .downloadM3U()
    .then(result => {
      this.log('M3U file updated')
      callback()
    })
    .catch(ex => {
      this.log('M3U update failed')
      callback()
    })
}

module.exports = {
  recorder,
  setM3UAddr,
  updateM3UFile,
}
