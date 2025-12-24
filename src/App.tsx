import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim()) {
      setMessages((prev) => [...prev, prompt]);
      setPrompt("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter - allow default behavior (new line)
        return;
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter or Cmd+Enter - manually insert newline
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = prompt.substring(0, start) + '\n' + prompt.substring(end);
        setPrompt(newValue);
        
        // Set cursor position after the newline
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      } else {
        // Enter alone - send message
        e.preventDefault();
        handleSubmit(e as any);
      }
    }
  }

  return (
    <main className="container">
      <h1>Devvy</h1>

      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="placeholder">Send a message to get started...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="message">
              <span className="message-content">{msg}</span>
            </div>
          ))
        )}
      </div>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}

export default App;
