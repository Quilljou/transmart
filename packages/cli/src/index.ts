import { parseArgv } from './options'
import { run } from './cli'

parseArgv(process.argv).then((opts) => {
  if (opts) {
    run(opts).catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
  } else {
    process.exitCode = 2
  }
})
