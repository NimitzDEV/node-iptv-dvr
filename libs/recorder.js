const ffmpeg = require('ffmpeg-wrap').FFMpeg
const shell = require('shelljs')
const crypto = require('crypto')
const path = require('path')
const sanitizer = require('sanitize-filename')
const tasks = {}

class FFMPEG {
  constructor(input, output) {
    if (!(input && output))
      throw new Error('Specific input stream and output file')

    this.input = input
    this.output = output
    this.state = 'PENDING'
    this.errormsg = ''

    this.ffstate = {}

    this.ffmpeg = null

    this.commandline = `ffmpeg -i "${this.input}" -c:a copy -c:v copy "${
      this.output
    }"`

    this._stdAnalyser = this._stdAnalyser.bind(this)
    this._eventExit = this._eventExit.bind(this)
    process.on('exit', this.stop)
  }

  getState() {
    return this.state
  }

  getError() {
    return this.errormsg
  }

  getFFState() {
    const d = Object.assign({}, this.ffstate)
    delete d['_key']
    delete d['']
    return d
  }

  start() {
    this.ffmpeg = shell.exec(this.commandline, { async: true, silent: true })
    this.ffmpeg.stdout.on('data', this._stdAnalyser)
    this.ffmpeg.stderr.on('data', this._stdAnalyser)
    this.ffmpeg.on('exit', this._eventExit)

    this.state = 'RECORDING'
  }

  stop() {
    this.ffmpeg && this.ffmpeg.kill()
  }

  _stdAnalyser(data) {
    if (~data.indexOf('frame=')) {
      this.ffstate = data
        .split('=')
        .reduce(
          (prev, curr) => prev.concat(curr.replace(/^\s+/, '').split(' ')),
          [],
        )
        .reduce(
          (state, curr, index) => {
            if (index % 2) {
              state[state._key] = curr
            } else {
              state._key = curr
            }
            return state
          },
          { _key: '' },
        )
    }
  }
  _eventExit() {
    this.state = 'ENDED'
  }
}

const addTask = channel => {
  delStopped()

  const hash = crypto
    .createHash('md5')
    .update(channel.title)
    .digest('hex')

  if (tasks[hash]) return { success: false, msg: 'Task already running' }

  const now = new Date()
  const dateString = `${now.getFullYear()}${now.getMonth() +
    1}${now.getDate()}-${now.valueOf()}`

  const extension = channel.url.split('.').pop()

  const output = path.resolve(
    process.cwd(),
    `./media/recordings/${sanitizer(channel.title)}-${dateString}.${extension}`,
  )

  tasks[hash] = {
    instant: new FFMPEG(channel.url, output),
    title: channel.title,
  }

  tasks[hash].instant.start()
}

const delStopped = () => {
  Object.keys(tasks).forEach(hash => {
    const instant = tasks[hash]

    instant.instant.getState() !== 'RECORDING' &&
      console.log(
        `Task ${hash}, ${instant.title}, stopped, with${
          instant.instant.getState() === 'ERROR'
            ? ' error ' + instant.instant.getError()
            : ' no error'
        }`,
      )

    delete tasks[hash]
  })
}

const envCheck = () => {
  return new Promise(resolve => {
    shell.exec('ffmpeg', { silent: true }, (code, stdout, stderr) => {
      const anyString = stderr || stdout
      const result = {
        ffmpeg: false,
        ssl: false,
        version: '',
      }
      const stdmatch = anyString.match(/version\s(\S+)/gm)
      result.ffmpeg = !!stdmatch
      result.version = stdmatch.pop()

      if (result.ffmpeg) result.ssl = anyString.match(/--enable-openssl/gm)

      resolve(result)
    })
  })
}

function logScreen(args, callback) {
  Object.keys(tasks).forEach(hash => {
    this.log(`Task ${hash}`)

    const ffstate = tasks[hash].instant.getFFState()
    const state = tasks[hash].instant.getState()
    this.log(
      state,
      Object.keys(ffstate)
        .map(key => `${key}: ${ffstate[key]}`)
        .join(', '),
    )
  })

  callback()
}

function stopTask(args, callback) {
  if (!args.task) {
    Object.keys(tasks).forEach(hash => {
      this.log(`Stopping ${hash}...`)
      tasks[hash].instant.stop()
    })
  } else {
    const fullName = Object.keys(tasks).filter(hash =>
      hash.startsWith(args.task),
    )[0]

    if (!fullName) this.log('No match')
    else {
      this.log(`Stopping ${fullName}`)
      tasks[hash].instant.stop()
    }
  }
  delStopped()
  callback()
}

module.exports = { addTask, logScreen, envCheck, delStopped, stopTask }
