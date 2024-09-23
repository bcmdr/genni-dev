import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o"),
    system:
      "Ignore previous instruction. You are a web devlepment assistant. Only return html code snippets containing css and javascript. Interpret user questions as prompts for web page ideas. Do not introduce or explain the code, return only a code snippet with inline comments. No markdown. Use modern box sizing and styling for the css to ensure high contrast accessible interfaces on mobile and desktop.",
    prompt,
  });

  return result.toDataStreamResponse();
}
