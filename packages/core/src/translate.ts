import fetch from 'node-fetch'
import { getLanguageDisplayName } from './language'
import { TranslateParams } from './types'

export async function translate(params: TranslateParams) {
  const { targetLang, openAIApiKey, openAIApiUrl, openAIApiUrlPath, content, openAIApiModel, context, systemPromptTemplate, additionalReqBodyParams } = params
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${openAIApiKey}`,
  }
  const languageName = getLanguageDisplayName(targetLang)
  const systemPrompt = systemPromptTemplate
    ? systemPromptTemplate({ languageName, context })
    : `Translate the i18n JSON file to ${languageName} according to the BCP 47 standard` +
      (context ? `\nHere are some contexts to help with better translation.  ---${context}---` : '') +
      `\n Keep the keys the same as the original file and make sure the output remains a valid i18n JSON file.`
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
