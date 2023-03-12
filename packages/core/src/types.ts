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
   * OpenAI API base url, useful when using proxy
   */
  openAIApiUrl?: string
  /**
   * OpenAI API url endpoint, which is useful when using proxy
   */
  openAIApiUrlPath?: string
}

export interface TranslateParams {
  content: string
  targetLang: string
  openAIApiKey: string
  openAIApiUrl: string
  openAIApiUrlPath: string
}

export interface TranslateResult {
  /**
   * locale content after translated
   */
  content?: string
  work: RunWork
  failed: boolean
  reason?: Error
}

export interface RunOptions {
  onStart?: (work: RunWork) => any
  onResult: (result: TranslateResult) => any
}

export interface RunWork {
  locale: string
  inputNSFilePath: string
  outputNSFilePath: string
}
