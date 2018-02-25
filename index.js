const dir = require('./libs/dir')
const actions = require('./libs/actions')
const vorpal = require('vorpal')()
const recorder = require('./libs/recorder')

dir.makeDirStructure()

vorpal
  .command('recorder', 'A TS live stream recorder')
  .option('-l --list', 'List All Channels')
  .option('-d --dvr <id>', 'Start recording on channel number')
  .option('-r --reload', 'Reload channel list')
  .action(actions.recorder)

vorpal
  .command('setaddr <addr>', 'change live m3u list location')
  .action(actions.setM3UAddr)

vorpal.command('updatem3u', 'update m3u file').action(actions.updateM3UFile)

vorpal
  .command('getconfig [key]', 'view all or specific config')
  .action(function(args, callback) {
    this.log(args.key ? dir.readConfig()[args.key] : dir.readConfig())
    callback()
  })

vorpal
  .command('state', 'view current tasks')
  .action(recorder.logScreen)

vorpal
  .command('stop [task]', 'stop specific task')
  .action(recorder.stopTask)

console.log('checking env...')
recorder.envCheck().then(env => {
  if (env.ffmpeg) {
    console.log(`Found FFMPEG ${env.version}`)
    if (!env.ssl)
      console.warn(
        'Current FFMPEG has not ssl support, if the stream is https based will failed to record',
      )
    vorpal.delimiter('IPTVRecorder > ').show()
  } else {
    console.log('NO FFMPEG FOUND!')
  }
})
