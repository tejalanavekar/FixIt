import Editor from '@monaco-editor/react'
import { useThemeStore } from '../store/themeStore'
interface CodeEditorProps {
  value: string
  language: string
  onChange: (value: string | undefined) => void
}

export default function CodeEditor({ value, language, onChange }: CodeEditorProps) {
    const { isDark } = useThemeStore()
    return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme={isDark ? 'vs-dark' : 'vs-light'}
      options={{
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        padding: { top: 16 },
        wordWrap: 'on'
      }}
    />
  )
}