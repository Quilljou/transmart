import fetch from 'node-fetch'
import { getLanguageDisplayName } from './language'
import { TranslateParams } from './types'

export async function translate(params: TranslateParams) {
  const { targetLang, openAIApiKey, openAIApiUrl, openAIApiUrlPath, content } = params
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${openAIApiKey}`,
  }
  const languageName = getLanguageDisplayName(targetLang)
  const systemPrompt = `I have a i18n JSON file that needs to be translated to ${languageName} follow BCP 47, keep the keys the same`
  const body = {
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
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
  const json = await res.json()
  // TOOD: handle Cannot read properties of undefined (reading '0'
  return json.choices[0].message.content
}
