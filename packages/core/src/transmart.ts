import { translate } from './translate'
import * as fs from 'fs-extra'
import * as path from 'path'
import { TransmartOptions, TranslateResult, RunOptions, RunWork } from './types'
import * as pLimit from 'p-limit'

const MAX_CONCURRENCY = 5

const limit = pLimit(MAX_CONCURRENCY)

const DEFAULT_PARAMS: Partial<TransmartOptions> = {
  openAIApiUrl: 'https://api.openai.com',
  openAIApiUrlPath: '/v1/chat/completions',
}

export class Transmart {
  options!: Required<TransmartOptions>
  constructor(options: TransmartOptions) {
    this.options = options as Required<TransmartOptions>
  }

  async run(options: RunOptions): Promise<any> {
    this.validateParams()
    const { baseLocale, locales, localePath } = this.options
    const targetLocales = locales.filter((item) => item !== baseLocale)
    const runworks: RunWork[] = []
    const baseLocaleFullPath = path.resolve(localePath, baseLocale)
    const namespaces = fs.readdirSync(baseLocaleFullPath)
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
    return Promise.all(runworks.map((work) => limit(() => this.runSingleNamespace(work, options))))
  }

  async runSingleNamespace(work: RunWork, options: RunOptions) {
    const { onResult, onStart } = options
    const { openAIApiKey, openAIApiUrl, openAIApiUrlPath, localePath } = this.options
    const { inputNSFilePath, outputNSFilePath, locale } = work
    let content
    onStart?.(work)
    try {
      // TODO: validate valid JSON or merge it into one
      content = fs.readFileSync(inputNSFilePath, { encoding: 'utf-8' })
      const data = await translate({
        content,
        targetLang: locale,
        openAIApiKey,
        openAIApiUrl,
        openAIApiUrlPath,
      })
      onResult?.({ work, content: data, failed: false })
    } catch (error) {
      onResult?.({ work, failed: true, content: '' })
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
