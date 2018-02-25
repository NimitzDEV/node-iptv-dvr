const fs = require('fs')
const path = require('path')
const axios = require('axios')
const m3ufast = require('./m3ufast')

let readConfigSuccess = false
let config = {}

const structure = ['./media', './media/channel', './media/recordings']
const PATH_CONFIG = path.resolve(process.cwd(), './media/config.json')
const PATH_M3U = path.resolve(process.cwd(), './media/channel/list.m3u')

const getChannelList = async () => {
  if (!fs.existsSync(PATH_M3U)) return false
  return await m3ufast.read(PATH_M3U)
}

const makeDirStructure = () => {
  structure.forEach(fd => {
    const p = path.resolve(process.cwd(), fd)
    fs.existsSync(p) || fs.mkdirSync(p)
  })
}

const readConfig = () => {
  if (readConfigSuccess) return config

  config =
    (fs.existsSync(PATH_CONFIG) &&
      JSON.parse(fs.readFileSync(PATH_CONFIG, { encoding: 'utf-8' }))) ||
    {}

  readConfigSuccess = true
  return config
}

const writeConfig = cfg => {
  fs.writeFileSync(PATH_CONFIG, JSON.stringify(cfg || config), {
    encoding: 'utf-8',
  })
}

const setConfig = (key, value) => (config[key] = value) && writeConfig()

const download = (from, to) => {}

const downloadM3U = () => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: config.addr,
      responseType: 'stream',
    }).then(res => {
      const write = fs.createWriteStream(PATH_M3U)
      write.on('close', resolve)
      res.data.pipe(write)
    })
  })
}

module.exports = {
  getChannelList,
  makeDirStructure,
  readConfig,
  writeConfig,
  setConfig,
  download,
  downloadM3U,
}
