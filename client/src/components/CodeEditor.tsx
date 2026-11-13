import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';

export function CodeEditor({ value, onChange, placeholder, label, readOnly = false, minRows = 10 }: { value: string; onChange?: (value: string) => void; placeholder?: string; label: string; readOnly?: boolean; minRows?: number }) {
  return <div className={`code-editor ${readOnly ? 'code-editor-readonly' : ''}`}>
    <CodeMirror
      value={value}
      height={`${Math.max(140, minRows * 17)}px`}
      minHeight={`${Math.max(140, minRows * 17)}px`}
      maxHeight="380px"
      theme="dark"
      extensions={[javascript({ typescript: true }), EditorView.contentAttributes.of({ 'aria-label': label })]}
      onChange={onChange}
      editable={!readOnly}
      readOnly={readOnly}
      placeholder={placeholder}
      basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, highlightActiveLineGutter: true, tabSize: 2 }}
    />
  </div>;
}
