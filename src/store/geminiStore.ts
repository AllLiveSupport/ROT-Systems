import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// GeminiModel is a string so users can type custom models freely
export type GeminiModel = string

export const PRESET_MODELS: string[] = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-pro-preview',
]

interface GeminiStore {
  apiKey: string
  model: GeminiModel
  setApiKey: (key: string) => void
  setModel: (model: GeminiModel) => void
  clearApiKey: () => void
}

export const useGeminiStore = create<GeminiStore>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'gemini-2.0-flash',
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),
      clearApiKey: () => set({ apiKey: '' }),
    }),
    {
      name: 'devtoolbox-gemini',
    }
  )
)
