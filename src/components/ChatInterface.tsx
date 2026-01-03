import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { streamChatResponse, parseCodeBlocks, extractTextWithoutCode } from '../services/tachAi';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    addMessage,
    setAiThinking,
    isAiThinking,
    createFile
  } = useProjectStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isAiThinking) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setAiThinking(true);

    try {
      const codeBlocks: { filename: string; content: string; language: string }[] = [];
      let fullResponse = '';
      
      // Get previous messages for context
      const messageHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Use real Tach-AI streaming
      for await (const _ of streamChatResponse(
        [...messageHistory, { role: 'user', content: userMessage }],
        (chunk) => {
          fullResponse += chunk;
          // Parse code blocks in real-time
          const blocks = parseCodeBlocks(fullResponse);
          blocks.forEach(block => {
            if (!codeBlocks.find(b => b.filename === block.filename)) {
              codeBlocks.push(block);
            }
          });
        }
      )) {
        // Streaming is handled in the callback
      }

      // Extract text without code blocks
      const textOnly = extractTextWithoutCode(fullResponse);
      
      addMessage('assistant', textOnly);

      // Apply code changes
      const blocks = parseCodeBlocks(fullResponse);
      blocks.forEach(block => {
        createFile(block.filename, block.filename.split('/').pop() || block.filename, block.content, block.language);
      });

    } catch (error) {
      console.error('AI Error:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again. Make sure you have internet connection for the Tach-AI API.');
    } finally {
      setAiThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    'Add a counter component',
    'Create a todo app',
    'Add a dark mode toggle',
    'Create a login form'
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Sparkles size={18} className="text-primary" />
        <span className="font-medium">AI Assistant</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-text-secondary py-8">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-4">Describe what you want to build</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 text-sm bg-surface border border-border rounded-full hover:border-primary transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-primary" />
              </div>
            )}
          </div>
        ))}

        {isAiThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-surface border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-sm text-text-secondary">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-primary"
            rows={2}
            disabled={isAiThinking}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAiThinking}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
