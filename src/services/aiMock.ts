export async function* mockStreamChatResponse(
  prompt: string,
  onChunk: (text: string) => void
): AsyncGenerator<string> {
  const responses: Record<string, string> = {
    'counter': `I'll create a counter component for you!

--- filename:src/Counter.tsx ---
\`\`\`tsx
import { useState } from 'react';

interface CounterProps {
  initialCount?: number;
}

export default function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="counter">
      <h3>Counter: {count}</h3>
      <div className="buttons">
        <button onClick={() => setCount(count - 1)}>-</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
    </div>
  );
}
\`\`\`

Now let me update the App.tsx to include the Counter component:

--- filename:src/App.tsx ---
\`\`\`tsx
import { useState } from 'react'
import Counter from './Counter'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header>
        <h1>Welcome to TachBuilder</h1>
        <p>AI-Powered Web Development Environment</p>
      </header>
      
      <main>
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <p>Click the button to increment the counter</p>
        </div>

        <Counter initialCount={10} />
        
        <div className="info">
          <h2>Features:</h2>
          <ul>
            <li>AI-powered code generation</li>
            <li>Real-time preview</li>
            <li>Full code editor</li>
            <li>Terminal simulation</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
\`\`\`

Done! I've created a Counter component and integrated it into your app.`,
    
    'todo': `I'll create a Todo application for you!

--- filename:src/TodoApp.tsx ---
\`\`\`tsx
import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h2>Todo List</h2>
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)} className="delete-btn">×</button>
          </li>
        ))}
      </ul>
      <p className="todo-count">{todos.filter(t => !t.completed).length} tasks remaining</p>
    </div>
  );
}
\`\`\`

--- filename:src/App.tsx ---
\`\`\`tsx
import { useState } from 'react'
import TodoApp from './TodoApp'
import './index.css'

function App() {
  return (
    <div className="app">
      <header>
        <h1>Welcome to TachBuilder</h1>
        <p>AI-Powered Web Development Environment</p>
      </header>
      
      <main>
        <TodoApp />
        
        <div className="info">
          <h2>Features:</h2>
          <ul>
            <li>AI-powered code generation</li>
            <li>Real-time preview</li>
            <li>Full code editor</li>
            <li>Terminal simulation</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
\`\`\`

I've created a fully functional Todo app!`,
    
    'default': `I'll help you build that! Let me create the necessary files.

Based on your request, I'll create a modern React application with best practices.

--- filename:src/App.tsx ---
\`\`\`tsx
import { useState } from 'react'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header>
        <h1>Welcome to TachBuilder</h1>
        <p>AI-Powered Web Development Environment</p>
      </header>
      
      <main>
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <p>Click the button to increment the counter</p>
        </div>
        
        <div className="info">
          <h2>Features:</h2>
          <ul>
            <li>AI-powered code generation</li>
            <li>Real-time preview</li>
            <li>Full code editor</li>
            <li>Terminal simulation</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
\`\`\`

Let me also add some styles:

--- filename:src/index.css ---
\`\`\`css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e5e5e5;
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

header p {
  color: #a3a3a3;
  font-size: 1.1rem;
}

main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.card button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.card p {
  margin-top: 1rem;
  color: #a3a3a3;
}

.info {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
}

.info h2 {
  margin-bottom: 1rem;
  color: #3b82f6;
}

.info ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.info li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.info li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #3b82f6;
}
\`\`\`

Done! Your application is ready. Try asking for specific features like "add a counter" or "create a todo app"!`
  };

  const lowerPrompt = prompt.toLowerCase();
  let response = responses.default;

  if (lowerPrompt.includes('counter')) {
    response = responses.counter;
  } else if (lowerPrompt.includes('todo')) {
    response = responses.todo;
  }

  const chunks = response.match(/.{1,50}/g) || [];
  for (const chunk of chunks) {
    await new Promise(resolve => setTimeout(resolve, 30));
    onChunk(chunk);
    yield chunk;
  }
}

export function parseCodeBlocks(text: string): { filename: string; content: string; language: string }[] {
  const blocks: { filename: string; content: string; language: string }[] = [];
  
  const regex = /--- filename:(\S+) ---\s*```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      filename: match[1],
      content: match[3].trim(),
      language: match[2] || 'typescript'
    });
  }
  
  return blocks;
}

export function extractTextWithoutCode(text: string): string {
  return text.replace(/--- filename:\S+ ---[\s\S]*?```(\w+)?[\s\S]*?```/g, '').trim();
}
