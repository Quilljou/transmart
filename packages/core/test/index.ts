import { Transmart } from '@transmart/core'

const transmart = new Transmart({
  baseLocale: 'en',
  locales: ['zh-CN', 'en', 'jp', 'de'],
  localePath: 'test/locales',
  openAIApiKey: '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',
  openAIApiUrl: 'https://service-buf0fcow-1256970539.hk.apigw.tencentcs.com',
})

transmart.run()
