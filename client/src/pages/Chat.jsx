import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../css/Chat.css';

export default function Chat() {
  const { state } = useLocation();
  const { careerPath = 'Career Advisor' } = state || {};

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedPrompts = [
    `Roadmap for ${careerPath}`,
    `Top skills & tools required`,
    `Salary expectations in India`,
    `Common interview questions`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const startConversation = async () => {
      const userId = 'test-user-id';
      setLoading(true);

      try {
        const res = await api.post('api/chat', {
          userId,
          careerPath,
          message: `Tell me about ${careerPath} career`,
        });

        setMessages([
          {
            role: 'assistant',
            content:
              res.data?.reply ||
              `Hello! I am your career advisor for **${careerPath}**. Ask me anything about learning roadmaps, skills, or job market expectations!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } catch (err) {
        setMessages([
          {
            role: 'assistant',
            content: `👋 Welcome! I am ready to guide you on your journey as a **${careerPath}**.\n\nAsk me anything about learning paths, skills, or job preparation!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (careerPath) {
      startConversation();
    }
  }, [careerPath]);

  const sendMessage = async (msgToSend) => {
    const text = msgToSend || input;
    if (!text.trim() || loading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: text, time: currentTime };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('api/chat', {
        userId: 'test-user-id',
        careerPath,
        message: text,
      });

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data?.reply || "I couldn't retrieve a response. Please try again.",
          time: replyTime,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ *Could not reach the server. Please try asking again in a moment.*',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">

        {/* Header */}
        <header className="chat-header">
          <div className="header-left">
            <h2 className="chat-title">{careerPath}</h2>
            <span className="chat-subtitle">Career Guidance Assistant</span>
          </div>

          <button
            type="button"
            className="btn-skill-gap"
            onClick={() => navigate('/skill-gap', { state: { careerPath } })}
          >
            View Skill Gap →
          </button>
        </header>

        {/* Message Thread */}
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              <div className="message-bubble">
                <div className="message-content">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.time && <span className="message-time">{m.time}</span>}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Section */}
        <div className="chat-footer">
          {/* Quick Prompts */}
          <div className="prompt-chips">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={`Ask about ${careerPath}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button type="submit" className="btn-send" disabled={!input.trim() || loading}>
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}