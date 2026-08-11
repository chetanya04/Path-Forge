import React, { useState, useEffect } from 'react';
import api from '../api';
import { useLocation } from 'react-router-dom';
import "../css/Chat.css";

export default function Chat() {
  const { state } = useLocation();
  const { careerPath } = state || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startConversation = async () => {
      const userId = 'test-user-id';
      setLoading(true);

      const res = await api.post('api/chat', { 
        userId, 
        careerPath, 
        message: `Tell me about ${careerPath} career` 
      });

      setMessages([{ role: 'assistant', content: res.data.reply }]);
      setLoading(false);
    };

    if (careerPath) {
      startConversation();
    }
  }, [careerPath]); // ✅ FIXED

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;

    const userId = 'test-user-id';
    
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    const res = await api.post('api/chat', { userId, careerPath, message: msg });
    setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Career Chat - {careerPath}</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="message-content">{m.content}</div>
          </div>
        ))}
        {loading && <div className="message assistant">Typing...</div>}
      </div>

      <div className="chat-input">
        <input 
          type="text"
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask about your career..."
        />
        <button onClick={() => sendMessage(input)}>Send</button>
      </div>
    </div>
  );
}