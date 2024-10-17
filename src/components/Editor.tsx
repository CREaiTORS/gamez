import { useRef, useState } from "react";

interface Props {
  code: Object;
  onChange: (text: string) => void;
}

export function Editor({ code, onChange }: Props) {
  const editorRef = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const text = JSON.stringify(code, null, 2);

  return (
    <details>
      <summary>Levels</summary>

      <div className="space-y-2">
        <code
          ref={editorRef}
          contentEditable={editing}
          suppressContentEditableWarning
          className="block p-1 overflow-scroll text-xs whitespace-pre border"
        >
          {text}
        </code>

        <div className="flex gap-2">
          <button className="w-full p-1 text-white bg-red-500" onClick={() => (editorRef.current!.innerText = text)}>
            Discard
          </button>

          <button
            className="w-full p-1 text-white bg-blue-500"
            onClick={() => {
              if (editing) {
                setEditing(false);
                onChange(editorRef.current!.innerText);
              } else {
                setEditing(true);
              }
            }}
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>
    </details>
  );
}
