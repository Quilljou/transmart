import { Transmart } from './transmart'
import { RunWork, TranslateResult } from './types'
import { readFile } from 'node:fs/promises'
import { translate } from './translate'
import { isPlainObject, splitJSONtoSmallChunks } from './split'
import { limit } from './limit'

interface TaskResult {
  content: string
  index: number
}

export class Task {
  constructor(private transmart: Transmart, private work: RunWork) {}

  async start(onProgress: (current: number, total: number) => any) {
    const { inputNSFilePath, namespace, locale } = this.work
    const { modelContextLimit, modelContextSplit } = this.transmart.options
    const content = await readFile(inputNSFilePath, { encoding: 'utf-8' })
    const chunks = splitJSONtoSmallChunks(JSON.parse(content), { modelContextLimit, modelContextSplit })
    let count = 0

    const p = chunks.map((chunk, index) => {
      return limit(() =>
        (async () => {
          const result = await this.run(JSON.stringify(chunk, null, 2), index)
          count++
          onProgress(count, chunks.length)
          return result
        })(),
      )
    })
    const results = await Promise.all(p)
    const namespaceResult = this.pack(results)
    const { overrides } = this.transmart.options

    // override with user provided
    if (overrides && isPlainObject(overrides)) {
      Object.entries(overrides).forEach(([overrideKey, value]) => {
        if (overrideKey === locale && isPlainObject(value)) {
          Object.entries(value).forEach(([overrideNs, overrideValues]) => {
            if (overrideNs === namespace) {
              Object.assign(namespaceResult, overrideValues)
            }
          })
        }
      })
    }
    return JSON.stringify(namespaceResult, null, 2)
  }

  private async run(content: string, index: number): Promise<TaskResult> {
    const { openAIApiKey, openAIApiUrl, openAIApiUrlPath, openAIApiModel, baseLocale, context, systemPromptTemplate, additionalReqBodyParams } = this.transmart.options
    const { locale } = this.work

    const data = await translate({
      content,
      baseLang: baseLocale,
      targetLang: locale,
      context,
      openAIApiModel,
      openAIApiKey,
      openAIApiUrl,
      openAIApiUrlPath,
      systemPromptTemplate,
      additionalReqBodyParams,
    })
    return {
      content: data,
      index,
    }
  }

  pack(result: TaskResult[]): Record<string, any> {
    // TODO: validate valid JSON or merge it into one
    const onePiece = result
      .sort((a, b) => a.index - b.index)
      .reduce((prev, next) => {
        return {
          ...prev,
          ...JSON.parse(next.content),
        }
      }, {})

    return onePiece
  }
}
