export interface TransmartOptions {
  /**
   * the language that Transmart will use as a reference to translate other target languages
   */
  baseLocale: string
  /**
   * all the languages that need to be translated (including baseLocale which is also acceptable)
   */
  locales: string[]
  /**
   * where you store your locale files
   * @example
   * - en
   *  common.json
   * - de
   *  common.json
   */
  localePath: string
  /**
   * the OpenAI API Key. For instructions on how to obtain a key, please refer to: https://gptforwork.com/setup/how-to-create-openai-api-key
   */
  openAIApiKey: string
  /**
   * Glob for namespace(s) to process
   */
  namespaceGlob?: string | string[]
  /**
   * OpenAI API model, default to `gpt-3.5-turbo`
   */
  openAIApiModel?: string
  /**
   * OpenAI API base url, useful when using proxy
   */
  openAIApiUrl?: string
  /**
   * OpenAI API url endpoint, which is useful when using proxy
   */
  openAIApiUrlPath?: string
  /**
   * It can be used to overwrite the generated JSON if you are not satisfied with the result of AI translation.
   * @example
   * ```js
   * {
   *  [locale]: {
   *      [namespace]: { title: "translated by hand" }
   *      chat: { title: "translated by hand" },
   *   }
   * }
   * ```
   */
  overrides?: Record<string, Record<string, Record<string, any>>>
}

export interface Stats {
  total: number
  success: number
  failed: number
}

export interface TransmartStats {
  locales?: Stats
  // TODO:
  namespaces: Stats
}

export interface TranslateParams {
  content: string
  targetLang: string
  openAIApiModel: string
  openAIApiKey: string
  openAIApiUrl: string
  openAIApiUrlPath: string
}

export interface TranslateResult {
  content?: string
  work: RunWork
  failed: boolean
  progress?: number
  total?: number
  reason?: Error
}

export interface RunOptions {
  onStart?: (work: RunWork) => any
  onProgress?: (current: number, total: number, work: RunWork) => any
  onResult: (result: TranslateResult) => any
}

export interface RunWork {
  namespace: string
  locale: string
  inputNSFilePath: string
  outputNSFilePath: string
}
