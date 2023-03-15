import { Transmart } from './transmart'
import { RunWork, TranslateResult } from './types'
import { readFile } from 'node:fs/promises'
import { translate } from './translate'
import { splitJSONtoSmallChunks } from './split'
import { limit } from './limit'

interface TaskResult {
  content: string
  index: number
}

export class Task {
  constructor(private transmart: Transmart, private work: RunWork) {}

  async start(onProgress: (current: number, total: number) => any) {
    const { inputNSFilePath, outputNSFilePath, locale } = this.work
    const content = await readFile(inputNSFilePath, { encoding: 'utf-8' })
    const chunks = splitJSONtoSmallChunks(JSON.parse(content))
    let count = 0
    const p = chunks.map((chunk, index) => {
      return limit(async () => {
        const result = await this.run(JSON.stringify(chunk, null, 2), index)
        count++
        onProgress(count, chunks.length)
        return result
      })
    })
    try {
      const results = await Promise.all(p)
      return this.pack(results)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  private async run(content: string, index: number): Promise<TaskResult> {
    const { openAIApiKey, openAIApiUrl, openAIApiUrlPath, localePath } = this.transmart.options
    const { locale } = this.work

    const data = await translate({
      content,
      targetLang: locale,
      openAIApiKey,
      openAIApiUrl,
      openAIApiUrlPath,
    })
    return {
      content: data,
      index,
    }
  }

  pack(result: TaskResult[]): string {
    // TODO: validate valid JSON or merge it into one
    const onePiece = result
      .sort((a, b) => a.index - b.index)
      .reduce((prev, next) => {
        return {
          ...prev,
          ...JSON.parse(next.content),
        }
      }, {})
    return JSON.stringify(onePiece, null, 2)
  }
}
