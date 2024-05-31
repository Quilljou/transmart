import fetch from 'node-fetch'
import { getLanguageDisplayName } from './language'
import { TranslateParams } from './types'

export async function translate(params: TranslateParams, retryTime = 0): Promise<string> {
  const {
    baseLang,
    targetLang,
    openAIApiKey,
    retryTimes,
    openAIApiUrl,
    openAIApiUrlPath,
    content,
    openAIApiModel,
    context,
    systemPromptTemplate,
    additionalReqBodyParams,
  } = params
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${openAIApiKey}`,
  }
  const languageName = getLanguageDisplayName(targetLang)
  const systemPrompt = systemPromptTemplate
    ? systemPromptTemplate({ languageName, context })
    : `Translate the contents of the i18n JSON file to ${languageName} according to the BCP 47 standard, ensuring the integrity and structure of the file are preserved. Please adhere to the following guidelines:

- **Keep the keys identical to the original file** to ensure structural integrity. The translation should occur in the values only.
- **Maintain valid i18n JSON file format** throughout the translation process.
${
  context
    ? `\n**Additional contexts** are provided below to assist with a more accurate translation:---${context}---`
    : ''
}
- **Address plural forms** specifically by applying the appropriate suffixes "${getPluralSuffixes(
        baseLang,
      )}" from the base language to the corresponding "${getPluralSuffixes(
        targetLang,
      )}" suffixes in the target language ${languageName}. Accurate plural translations must be provided based on these suffixes.

Upon completion of the translation:

1. **Verify Key-Value Pairing**: Please conduct a final review to ensure that all keys remain unchanged from the original file and that each key's associated content is accurately translated and correctly placed.

2. **Validate Structure and Syntax**: Confirm that the resulting JSON structure is valid and matches the original schema, paying close attention to brackets, braces, commas, and quotes.

3. **Cross-verify Translations**: If possible, cross-reference your translations with another source or a native speaker to ensure accuracy and naturalness of the language.

The aim is to achieve a fluent and structurally sound translation of the JSON content from the base language to the target language ${languageName}, without altering the document's schema or disrupting the key-value relationship.`
  const body = {
    model: openAIApiModel,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      { role: 'user', content: `${content}` },
    ],
    ...(additionalReqBodyParams || {}),
  }
  const finalUrlPath = openAIApiUrl + openAIApiUrlPath
  const res = await fetch(finalUrlPath, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (res.status !== 200) {
    if (retryTime < (retryTimes || 3)) {
      return translate(params, retryTime + 1)
    }
    const { error } = await res.json()
    throw new Error(error.message)
  }
  const { choices } = await res.json()
  if (!choices || choices.length === 0) {
    throw new Error('No result')
  }
  const targetTxt = choices[0].message.content.trim()
  return findValidJSONInsideBody(targetTxt)
}

// TODO @ngxson : Sometimes, even "smart" models like GPT-4 does not understand and add a text before / after JSON
const findValidJSONInsideBody = (input: string): string => {
  const firstBracket = input.indexOf('{')
  const lastBracket = input.lastIndexOf('}') + 1
  return input.substring(firstBracket, lastBracket)
}

const getPluralSuffixes = (input: string): string =>
  new Intl.PluralRules(input)
    .resolvedOptions()
    .pluralCategories.map((cat) => `_${cat}`)
    .join(', ')
