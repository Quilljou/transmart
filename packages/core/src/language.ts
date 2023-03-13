export function getLanguageDisplayName(code: string) {
  try {
    code = code.replace('_', '-') // support chrome.i18n. and Intl don't support _
    const ret = new Intl.DisplayNames(['en'], { type: 'language' }).of(code)
    if (ret === code) {
      console.warn(`the language code '${code}' can't be parsed`)
    }
    return ret
  } catch (error) {
    console.log(error)
    console.warn(`the language code '${code}' seems broken`)
    return code
  }
}
