import * as fs from 'fs-extra'
import * as path from 'path'
import { TransmartOptions, RunOptions, RunWork, TransmartStats, Stats } from './types'
import { Task } from './task'
import { glob } from 'glob'
import { getPairHash } from './util'
import { existsSync } from 'node:fs'

const DEFAULT_PARAMS: Partial<TransmartOptions> = {
  openAIApiUrl: 'https://api.openai.com',
  openAIApiUrlPath: '/v1/chat/completions',
  openAIApiModel: 'gpt-3.5-turbo',
  modelContextLimit: 4096,
  modelContextSplit: 1 / 1,
}

export class Transmart {
  options!: Required<TransmartOptions>
  constructor(options: TransmartOptions) {
    this.options = options as Required<TransmartOptions>
  }

  public async run(options: RunOptions): Promise<TransmartStats> {
    this.validateParams()
    const {
      baseLocale,
      locales,
      localePath,
      cacheEnabled = true,
      namespaceGlob = '**/*.json',
      singleFileMode = false,
    } = this.options
    const targetLocales = locales.filter((item) => item !== baseLocale)
    const runworks: RunWork[] = []
    const baseLocaleFullPath = singleFileMode ? localePath : path.resolve(localePath, baseLocale)
    const namespaces = await glob(namespaceGlob, {
      cwd: baseLocaleFullPath,
    })
    // if cachePath is not provided, use the localePath/.cache as default
    const cachePath = this.options.cachePath || path.resolve(localePath, '.cache')
    const realNamespaces = singleFileMode ? ['app'] : namespaces
    targetLocales.forEach((targetLocale) => {
      realNamespaces.forEach((ns) => {
        const inputNSFilePath = singleFileMode
          ? path.resolve(baseLocaleFullPath, `${baseLocale}.json`)
          : path.resolve(baseLocaleFullPath, ns)
        const outputNSFilePath = singleFileMode
          ? path.resolve(baseLocaleFullPath, `${targetLocale}.json`)
          : path.resolve(localePath, targetLocale, ns)

        if (cacheEnabled) {
          const pairHash = getPairHash(inputNSFilePath, outputNSFilePath)
          const targetCachePath = path.join(cachePath, pairHash)
          // check if the cache file exists
          if (existsSync(targetCachePath) && existsSync(outputNSFilePath)) {
            console.log(`cache file and output file exists, skip for namespace ${ns} - locale ${targetLocale}`)
            return
          }
        }

        const namespace = path.parse(ns).name

        runworks.push({
          namespace: namespace,
          baseLocale,
          locale: targetLocale,
          inputNSFilePath,
          outputNSFilePath,
          cachePath,
        })
      })
    })
    const namespacesStats: Stats = {
      total: runworks.length,
      success: 0,
      failed: 0,
    }

    await Promise.all(
      runworks.map(async (work) => {
        const { onResult, onStart, onProgress } = options
        onStart?.(work)
        try {
          const task = new Task(this, work)
          const data = await task.start((current, total) => {
            onProgress?.(current, total, work)
          })
          namespacesStats.success++
          onResult?.({ work, content: data, failed: false })

          // after success, write the cache file
          if (cacheEnabled) {
            const pairHash = getPairHash(work.inputNSFilePath, work.outputNSFilePath)
            const targetCachePath = path.join(cachePath, pairHash)
            // just save an empty file as the cache file
            await fs.ensureFile(targetCachePath)
          }
        } catch (error) {
          namespacesStats.failed++
          onResult?.({ work, failed: true, content: '', reason: error as Error })
        }
      }),
    )

    if (cacheEnabled) {
      // 1. build the list of valid hash filenames from the work you actually ran
      const validHashes = runworks.map((w) => getPairHash(w.inputNSFilePath, w.outputNSFilePath))

      // 2. if the cache directory exists, read all files in it
      if (await fs.pathExists(cachePath)) {
        const entries = await fs.readdir(cachePath)
        for (const entry of entries) {
          // 3. delete anything not in our current list
          if (!validHashes.includes(entry)) {
            const stale = path.join(cachePath, entry)
            await fs.remove(stale)
            console.log(`removed stale cache file ${entry}`)
          }
        }
        console.log(`cleaned up cache files in ${cachePath}`)
      }
    }

    // Clean up stale cache files based on existing translation outputs
    if (cacheEnabled) {
      const validHashes: string[] = []

      // For each target locale, scan its output directory for translated files
      for (const targetLocale of targetLocales) {
        const outputLocaleDir = singleFileMode ? baseLocaleFullPath : path.resolve(localePath, targetLocale)

        // Find all JSON namespaces in this locale
        const outputFiles = await glob(namespaceGlob, { cwd: outputLocaleDir })

        for (const ns of outputFiles) {
          const inputPath = singleFileMode
            ? path.resolve(baseLocaleFullPath, `${baseLocale}.json`)
            : path.resolve(baseLocaleFullPath, ns)

          const outputPath = singleFileMode
            ? path.resolve(baseLocaleFullPath, `${targetLocale}.json`)
            : path.resolve(outputLocaleDir, ns)

          // Only generate a hash if the output file actually exists
          if (await fs.pathExists(outputPath)) {
            validHashes.push(getPairHash(inputPath, outputPath))
          }
        }
      }

      // If the cache directory exists, remove any file whose name isn't in validHashes
      if (await fs.pathExists(cachePath)) {
        const entries = await fs.readdir(cachePath)
        for (const entry of entries) {
          if (!validHashes.includes(entry)) {
            await fs.remove(path.join(cachePath, entry))
            console.log(`Removed stale cache file: ${entry}`)
          }
        }
      }
    }

    return {
      namespaces: namespacesStats,
    }
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
    const { baseLocale, localePath, openAIApiKey, locales, singleFileMode = false } = this.options
    if (typeof baseLocale !== 'string') throw new Error('valid `baseLocale` must be provided')
    if (typeof openAIApiKey !== 'string') throw new Error('valid `openAIApiKey` must be provided')
    if (!Array.isArray(locales) || locales.some((i) => typeof i !== 'string'))
      throw new Error('`locales` must be Array of string')
    const baseLocaleFullPath = singleFileMode ? localePath : path.resolve(localePath, baseLocale)
    if (!fs.existsSync(baseLocaleFullPath)) throw new Error('`localePath` not existed')
    // TODO: structure
    this.options = Object.assign({}, DEFAULT_PARAMS, this.options) as Required<TransmartOptions>
  }
}
