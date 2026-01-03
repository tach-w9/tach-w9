import { createClient } from 'tach-ai';

const client = createClient();

export async function* streamChatResponse(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void
): AsyncGenerator<string> {
  const stream = await client.chat.completions.create({
    model: 'MiniMaxAI/MiniMax-M2',
    messages: [
      {
        role: 'system',
        content: `You are an expert full-stack web developer and AI coding assistant. You help users build web applications.

Your workflow:
1. Understand the user's requirements
2. Plan the web application architecture
3. Create/modify files as needed
4. Write clean, modern code

When providing code, ALWAYS use this format:
--- filename:src/App.tsx ---
CODE_BLOCK_START
// Your code here
CODE_BLOCK_END

Important:
- Write complete, working code
- Use TypeScript for .tsx/.ts files
- Use proper imports
- Follow best practices for React and modern web development`
      },
      ...messages
    ],
    stream: true
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      fullResponse += text;
      onChunk(text);
      yield text;
    }
  }
}

export function parseCodeBlocks(text: string): { filename: string; content: string; language: string }[] {
  const blocks: { filename: string; content: string; language: string }[] = [];
  
  const regex = /--- filename:(\S+) ---\s*CODE_BLOCK_START\n([\s\S]*?)CODE_BLOCK_END/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      filename: match[1],
      content: match[2].trim(),
      language: 'typescript'
    });
  }
  
  return blocks;
}

export function extractTextWithoutCode(text: string): string {
  return text.replace(/--- filename:\S+ ---[\s\S]*?CODE_BLOCK_START[\s\S]*?CODE_BLOCK_END/g, '').trim();
}
