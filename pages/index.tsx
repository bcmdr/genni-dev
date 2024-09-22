import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCompletion } from "ai/react";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css"; // VSCode dark theme for syntax highlighting

export default function HomePage() {
  const [prompt, setPrompt] = useState<string>("");
  const [showIframe, setShowIframe] = useState<boolean>(false);
  const [inputPinned, setInputPinned] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false); // Show the editor during code generation
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
    <div
      className={`h-screen bg-gray-200 ${
        inputPinned
          ? "grid grid-rows-[auto,1fr,auto] "
          : "flex justify-center items-center"
      }`}
    >
      {/* Top menu or form */}
      <form
        onSubmit={handleSubmit}
        className={`w-full ${
          inputPinned
            ? "sticky top-0 z-50 shadow-md flex items-center justify-between p-3 bg-black" // Flex layout for input + button when pinned
            : "flex-grow flex flex-col items-center justify-center p-7"
        }`}
      >
        {!inputPinned && (
          <div className="mb-7 flex text-2xl items-center justify-center text-black">
            <h3 className="font-bold mr-5 pr-5 border border-r-black border-t-transparent border-l-transparent border-b-transparent">
              Genni
            </h3>
            <p>Idea to Prototype</p>
          </div>
        )}
        <div
          className={`flex w-full gap-2 items-center ${
            inputPinned ? "flex-row" : "flex-col item-center max-w-3xl rounded"
          }`}
        >
          {inputPinned && (
            <Link className="text-white px-2 font-bold" href="/">
              Genni
            </Link>
          )}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your idea..."
            className={`text-md ${
              inputPinned
                ? "flex-grow px-3 py-1 bg-black text-white border border-l-white border-t-transparent border-r-transparent border-b-transparent"
                : "w-full mb-4 px-5 py-2 shadow-lg bg-white text-black border border-gray-200 rounded-full"
            }`}
          />
          <div className="flex justify-center">
            <button
              type="submit"
              className={`px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800 ${
                inputPinned ? "border border-white" : "flex"
              }`}
            >
              Generate
            </button>
          </div>
        </div>
      </form>

      {/* Show Code Editor during code generation */}
      {completion && showEditor && (
        <div className="w-full flex-grow overflow-y-auto text-left">
          <pre className="whitespace-pre-wrap break-words">
            <code
              className="html p-3 text-sm bg-gray-800 text-gray-100"
              ref={codeRef}
            >
              {completion}
            </code>
          </pre>
        </div>
      )}

      {/* Show iframe after the code generation is completed */}
      {showIframe && (
        <div className="flex-grow w-full h-full">
          <iframe
            className="w-full h-full"
            srcDoc={iframeSrcDoc}
            title="Preview"
          />
        </div>
      )}

      {/* Bottom menu */}
      {completion && !isLoading && (
        <div className="sticky w-full p-2 bg-black flex justify-between items-center shadow-md bottom-0">
          <button
            onClick={handleToggleView}
            className="text-sm px-3 py-1 text-white bg-black border border-white rounded-md hover:bg-gray-800 cursor-pointer"
          >
            {showEditor ? "Show Preview" : "Show Code"}
          </button>
        </div>
      )}
    </div>
  );
}
