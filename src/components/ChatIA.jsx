import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const ChatIA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis l\'IA d\'ArtisanPro. Comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { messages: history }
      });

      if (error) throw error;

      if (data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else if (data?.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Erreur : ${data.error}` }]);
      }
    } catch (err) {
      console.error("Erreur Chat:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connexion impossible avec l'IA." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ia-floating-bubble no-print">
      <button className="ia-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div className="chat-container shadow-2xl">
          <div className="chat-header">
            <span>Assistant IA</span>
          </div>
          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="message ai">...</div>}
          </div>
          <div className="chat-input-area">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
            />
            <button onClick={handleSend} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatIA;