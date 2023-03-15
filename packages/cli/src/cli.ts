import { CmdOptions } from './types'
import { Transmart } from '@transmart/core'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as Spinnies from 'spinnies'

export async function run(options: CmdOptions) {
  const transmart = new Transmart(options)
  const spinnerManager = new Spinnies()
  const result = await transmart.run({
    onStart(work) {
      const key = work.locale + '-' + path.basename(work.inputNSFilePath)
      spinnerManager.add(key, { text: key + ' translating...' })
    },
    onProgress(current, total, work) {
      const key = work.locale + '-' + path.basename(work.inputNSFilePath)
      spinnerManager.update(key, { text: key + ' translating...' + `(${current}/${total})` })
    },
    onResult(result) {
      const { work, failed, content, reason } = result
      const key = work.locale + '-' + path.basename(work.inputNSFilePath)
      if (failed) {
        spinnerManager.fail(key, { text: key + ' failed: ' + reason?.message })
      } else if (content) {
        const dirname = path.dirname(work.outputNSFilePath)
        fs.mkdirpSync(dirname)
        fs.writeFileSync(work.outputNSFilePath, content, {
          encoding: 'utf-8',
        })
        spinnerManager.succeed(key, { text: key + ' translated' })
      }
    },
  })

  console.log(
    `\n Transmart complete!\n Total: ${result.namespaces.total}\n Success: ${result.namespaces.success} \n Failed: ${result.namespaces.failed}`,
  )
  return result
}
