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
   * where the cache files are stored, there will be some cache files generated during the translation process
   */
  cachePath?: string
  /**
   * whether to enable cache, default to true
   */
  cacheEnabled?: boolean
  /**
   * the OpenAI API Key. For instructions on how to obtain a key, please refer to: https://gptforwork.com/setup/how-to-create-openai-api-key
   */
  openAIApiKey: string
  /**
   * Glob for namespace(s) to process
   */
  namespaceGlob?: string | string[]
  /**
   * Provide some context for a more accurate translation.
   */
  context?: string
  /**
   * Retry times when the translation fails, default to 3
   */
  retryTimes?: number
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
  /**
   * The max context window that the model supports. For example for gpt-4-32k, the context is 32768 tokens. Default to 4096 (gpt-3.5-turbo)
   */
  modelContextLimit?: number
  /**
   * The ratio to split between number of input / output tokens. For example, if the input language is English and output is Spanish, you may expect 1 input token to produce 2 output tokens. In this case, the variable is set to 1/2. By default, modelContextSplit is set to 1/1
   */
  modelContextSplit?: number
  /**
   * (For advanced usage) Custom prompt template. See "translate.ts" for the default prompt.
   */
  systemPromptTemplate?: (data: { languageName: string | undefined; context: string | undefined }) => string
  /**
   * (For advanced usage) Custom parameters to be passed into request body. Useful if you use a self-hosted model and you want to customize model parameters. For example llama.cpp:
   * {
   *   mirostat_eta: 0.8,
   *   mirostat_tau: 0.9,
   *   mirostat: 1,
   *   grammar: [JSON grammar]
   * }
   */
  additionalReqBodyParams?: any
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
  baseLang: string
  targetLang: string
  context?: string
  retryTimes?: number
  openAIApiModel: string
  openAIApiKey: string
  openAIApiUrl: string
  openAIApiUrlPath: string
  systemPromptTemplate: TransmartOptions['systemPromptTemplate']
  additionalReqBodyParams: any
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
  baseLocale: string
  locale: string
  inputNSFilePath: string
  outputNSFilePath: string
  cachePath: string
}
