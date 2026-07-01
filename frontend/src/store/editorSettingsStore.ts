import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EditorSettings {
  fontFamily: string
  fontSize: number
  tabSize: number
  lineNumbers: boolean
  wordWrap: boolean
  minimap: boolean
  setFontFamily: (v: string) => void
  setFontSize: (v: number) => void
  setTabSize: (v: number) => void
  setLineNumbers: (v: boolean) => void
  setWordWrap: (v: boolean) => void
  setMinimap: (v: boolean) => void
}

export const useEditorSettingsStore = create<EditorSettings>()(
  persist(
    (set) => ({
      fontFamily: 'JetBrains Mono',
      fontSize: 14,
      tabSize: 2,
      lineNumbers: true,
      wordWrap: false,
      minimap: false,
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setTabSize: (tabSize) => set({ tabSize }),
      setLineNumbers: (lineNumbers) => set({ lineNumbers }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setMinimap: (minimap) => set({ minimap }),
    }),
    { name: 'fixit-editor-settings' }
  )
)
