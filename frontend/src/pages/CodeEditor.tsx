import Editor from '@monaco-editor/react'
import { useThemeStore } from '../store/themeStore'
import { useEditorSettingsStore } from '../store/editorSettingsStore'

interface CodeEditorProps {
  value: string
  language: string
  onChange: (value: string | undefined) => void
}

export default function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const { isDark } = useThemeStore()
  const { fontFamily, fontSize, tabSize, lineNumbers, wordWrap, minimap } = useEditorSettingsStore()
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme={isDark ? 'vs-dark' : 'vs-light'}
      options={{
        fontSize,
        fontFamily: `${fontFamily}, monospace`,
        tabSize,
        minimap: { enabled: minimap },
        scrollBeyondLastLine: false,
        lineNumbers: lineNumbers ? 'on' : 'off',
        renderLineHighlight: 'line',
        padding: { top: 16 },
        wordWrap: wordWrap ? 'on' : 'off',
      }}
    />
  )
}