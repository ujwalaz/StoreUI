import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLanguageStore = create(persist(
  (set) => ({
    lang: 'en',
    setLang: (lang) => set({ lang }),
  }),
  { name: 'gf-language' }
))
