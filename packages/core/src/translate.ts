import fetch from 'node-fetch'
import { getLanguageDisplayName } from './language'
import { TranslateParams } from './types'

export async function translate(params: TranslateParams) {
  const { targetLang, openAIApiKey, openAIApiUrl, openAIApiUrlPath, content, openAIApiModel } = params
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${openAIApiKey}`,
  }
  const languageName = getLanguageDisplayName(targetLang)
  const spell = `Translate the i18n JSON file to ${languageName} according to the BCP 47 standard. Keep the keys the same as the original file and make sure the output remains a valid i18n JSON file.`
  const body = {
    model: openAIApiModel,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: spell,
      },
      { role: 'user', content: `${content}` },
    ],
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
  return targetTxt
}
