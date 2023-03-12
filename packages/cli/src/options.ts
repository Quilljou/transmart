import { CmdOptions } from './types'
import { program } from 'commander'
import { cosmiconfig } from 'cosmiconfig'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json')

program
  .description(
    `🚀 Automate your i18n localization with AI.
  \n Example: \n\n npx transmart (transmart.config.js must be present)
  \n Or more verbose way: \n\n npx transmart -b en-US -p public/locales -l zh-CN,jp,de -k <your-own-openai-api-key>`,
  )
  .option(
    '-c, --config <configurationFile>',
    'transmart.config.js or transmartrc.json whatever config file format which cosmiconfig supports',
  )
  .option(
    '-b, --base-locale <baseLocale>',
    'the language that Transmart will use as a reference to translate other target languages',
  )
  .option(
    '-l, --locales <locales...>',
    'all the languages that need to be translated (including baseLocale which is also acceptable)',
  )
  .option('-p, --locale-path <localePath>', 'where you store your locale files')
  .option(
    '-k, --openai-api-key <openAIApiKey>',
    'the OpenAI API Key. For instructions on how to obtain a key, please refer to: https://gptforwork.com/setup/how-to-create-openai-api-key',
  )
  .option('--openai-api-url <openAIApiUrl>', 'OpenAI API base url, useful when using proxy')
  .option('--openai-api-urlpath <openAIApiUrlPath>', 'OpenAI API url endpoint, which is useful when using proxy')
  .version(pkg.version)
  .parse()

const explorer = cosmiconfig('transmart')

export async function parseArgv(args: Array<string>): Promise<CmdOptions | null> {
  const stdInOptions = program.opts<CmdOptions>()
  let consmiconResult
  try {
    consmiconResult = stdInOptions.config ? await explorer.load(stdInOptions.config) : await explorer.search()
  } catch (error) {
    // do nothing
    if (!stdInOptions.config) {
      throw new Error('please provide a valid config file')
    }
  }
  if (consmiconResult) {
    return Object.assign(consmiconResult.isEmpty ? {} : consmiconResult.config, stdInOptions)
  }
  return stdInOptions
}
