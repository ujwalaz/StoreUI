import { useLanguageStore } from '../store/languageStore'
import { translations } from './translations'

export function useT() {
  const lang = useLanguageStore(s => s.lang)
  return (key, vars) => {
    let str = translations[lang]?.[key] ?? translations.en[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
    }
    return str
  }
}
