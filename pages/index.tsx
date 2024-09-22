import { useState, useEffect, useRef } from "react";
import { useCompletion } from "ai/react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // Import a CSS theme for highlighting

export default function HomePage() {
  const [prompt, setPrompt] = useState<string>("");
  const [showIframe, setShowIframe] = useState<boolean>(false);
  const [inputPinned, setInputPinned] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(true); // Show the editor during code generation
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>(""); // Manage iframe srcDoc
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/completion",
  });

  const codeRef = useRef<HTMLElement>(null); // Reference for the code block

  // Apply syntax highlighting to the streamed code
  useEffect(() => {
    if (completion && showEditor && codeRef.current) {
      hljs.highlightElement(codeRef.current); // Apply highlighting to the code block
    }
  }, [completion, showEditor]);

  // Automatically switch to the preview after code generation is done
  useEffect(() => {
    if (!isLoading && completion) {
      setShowEditor(false); // Hide editor once code generation is complete
      setIframeSrcDoc(completion); // Set the iframe srcDoc with the generated code
      setShowIframe(true); // Show iframe preview after completion
    }
  }, [isLoading, completion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    if (prompt.trim()) {
      setInputPinned(true); // Pin input to the top
      setShowEditor(true); // Show the editor as code is generated
      setShowIframe(false); // Hide iframe initially

      // Start generating the code
      await complete(prompt); // Trigger the API call
    }
  };

  const handleToggleView = () => {
    if (showEditor) {
      setIframeSrcDoc(completion); // Reload the iframe when switching back to "Show Preview"
    }
    setShowEditor(!showEditor);
    setShowIframe(!showIframe);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Form for Input and Generate Button */}
      <form
        onSubmit={handleSubmit}
        className={`w-full p-3 bg-white ${
          inputPinned
            ? "fixed top-0 z-50 shadow-md"
            : "flex-grow flex items-center justify-center"
        }`}
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
          className="w-3/4 p-3 text-lg border border-gray-300 rounded-md mr-4"
        />
        <button
          type="submit"
          className="px-5 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Generate
        </button>
      </form>

      {/* Show Code Editor during code generation */}
      {showEditor && (
        <div className="w-full flex-grow bg-gray-50 border-t border-gray-300 p-3 overflow-y-auto text-left">
          <pre>
            <code className="html" ref={codeRef}>
              {completion}
            </code>
          </pre>
        </div>
      )}

      {/* Show iframe after the code generation is completed */}
      {showIframe && (
        <div className="flex-grow w-full h-full fixed top-0 bg-white">
          <iframe
            className="w-full h-full"
            srcDoc={iframeSrcDoc}
            title="Preview"
          />
        </div>
      )}

      {/* Toggle button to show/hide the code editor or iframe */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-white flex justify-between items-center shadow-md">
        <button
          onClick={handleToggleView}
          className="px-5 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
        >
          {showEditor ? "Show Preview" : "Show Code"}
        </button>
      </div>
    </div>
  );
}
