// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require('./next-i18next.config.js')

module.exports = {
  baseLocale: 'en',
  locales: i18n.locales, // avoid duplicated
  localePath: 'public/locales',
  openAIApiKey: process.env.OPENAI_API_KEY,
  openAIApiUrl: process.env.OPENAI_API_URL,
}
