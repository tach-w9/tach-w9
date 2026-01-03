declare module 'tach-ai' {
  export function createClient(config?: { apiKey?: string }): TachClient;
  
  interface TachClient {
    chat: {
      completions: {
        create(params: {
          model: string;
          messages: Array<{ role: string; content: string }>;
          stream?: boolean;
          temperature?: number;
          max_tokens?: number;
          presence_penalty?: number;
          frequency_penalty?: number;
        }): AsyncIterable<{
          choices: Array<{
            delta?: {
              content: string;
            };
          }>;
        }>;
      };
    };
  }
}
