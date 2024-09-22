import { useState } from "react";
import { useCompletion } from "ai/react";

export default function HomePage() {
  const [prompt, setPrompt] = useState<string>("");
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [showIframe, setShowIframe] = useState<boolean>(false);

  // Destructure completion and complete from useCompletion
  const { completion, complete } = useCompletion({
    api: "/api/completion",
  });

  const handleSubmit = async () => {
    if (prompt.trim()) {
      setShowEditor(true);
      setShowIframe(false); // Hide iframe initially
      await complete(prompt); // Trigger the API call
      setShowIframe(true); // Show iframe after the completion is received
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
        className="w-4/5 p-3 text-lg border border-gray-300 rounded-md mb-5"
      />
      <button
        onClick={handleSubmit}
        className="px-5 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Generate
      </button>

      {showEditor && (
        <div className="w-full max-w-3xl h-72 mt-5 border border-gray-300 rounded-md p-3 bg-gray-50 overflow-y-auto text-left font-mono">
          {completion.split("\n").map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      {showIframe && completion && (
        <iframe
          className="w-full max-w-3xl h-72 mt-5 border border-gray-300 rounded-md"
          srcDoc={completion}
          title="Preview"
        />
      )}
    </div>
  );
}
