import React from "react";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { Button } from "./Button";
import { everything } from "../utils/save-console";

export default function TestPage() {
  const render = useForceUpdate();

  return (
    <div className="w-full h-full">
      {everything.map((x, idx) => (
        <code
          key={idx}
          className="block p-1 overflow-scroll text-xs whitespace-pre-line border"
          style={{ backgroundColor: x.color }}
        >
          {JSON.stringify(x.value, null, 4)}
        </code>
      ))}
      <div className="flex gap-2 mx-auto w-90">
        <Button btn="danger" onClick={() => ((everything.length = 0), render())}>
          Clear
        </Button>
        <Button onClick={render}>Update</Button>
      </div>
    </div>
  );
}
