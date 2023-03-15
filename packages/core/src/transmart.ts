import { translate } from './translate'
import * as fs from 'fs-extra'
import * as path from 'path'
import { TransmartOptions, TranslateResult, RunOptions, RunWork } from './types'
import { Task } from './task'
import { limit } from './limit'
import { glob } from 'glob'

const DEFAULT_PARAMS: Partial<TransmartOptions> = {
  openAIApiUrl: 'https://api.openai.com',
  openAIApiUrlPath: '/v1/chat/completions',
}

export class Transmart {
  options!: Required<TransmartOptions>
  constructor(options: TransmartOptions) {
    this.options = options as Required<TransmartOptions>
  }

  public async run(options: RunOptions): Promise<any> {
    this.validateParams()
    const { baseLocale, locales, localePath, namespaceGlob = '**/*.json' } = this.options
    const targetLocales = locales.filter((item) => item !== baseLocale)
    const runworks: RunWork[] = []
    const baseLocaleFullPath = path.resolve(localePath, baseLocale)
    const namespaces = await glob(namespaceGlob, {
      cwd: baseLocaleFullPath,
    })
    targetLocales.forEach((targetLocale) => {
      namespaces.forEach((ns) => {
        const inputNSFilePath = path.resolve(baseLocaleFullPath, ns)
        const outputNSFilePath = path.resolve(localePath, targetLocale, ns)
        runworks.push({
          locale: targetLocale,
          inputNSFilePath,
          outputNSFilePath,
        })
      })
    })
    return Promise.all(runworks.map((work) => this.processSingleNamespace(work, options)))
  }

  private async processSingleNamespace(work: RunWork, options: RunOptions): Promise<void> {
    const { onResult, onStart, onProgress } = options
    onStart?.(work)
    try {
      const task = new Task(this, work)
      const data = await task.start((current, total) => {
        onProgress?.(current, total, work)
      })
      onResult?.({ work, content: data, failed: false })
    } catch (error) {
      onResult?.({ work, failed: true, content: '', reason: error as Error })
    }
  }

  private validateParams() {
    const { baseLocale, localePath, openAIApiKey, locales } = this.options
    if (typeof baseLocale !== 'string') throw new Error('valid `baseLocale` must be provided')
    if (typeof openAIApiKey !== 'string') throw new Error('valid `openAIApiKey` must be provided')
    if (!Array.isArray(locales) || locales.some((i) => typeof i !== 'string'))
      throw new Error('`locales` must be Array of string')
    const baseLocaleFullPath = path.resolve(localePath, baseLocale)
    if (!fs.existsSync(baseLocaleFullPath)) throw new Error('`localePath` not existed')
    // TODO: structure
    this.options = Object.assign({}, DEFAULT_PARAMS, this.options) as Required<TransmartOptions>
  }
}
