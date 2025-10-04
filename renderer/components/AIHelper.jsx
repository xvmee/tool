function AIHelper() {
  const [messages, setMessages] = React.useState([
    {
      role: 'assistant',
      content: 'Witaj. Jestem asystentem technicznym Tool. Mogę pomóc w kwestiach związanych z systemem Windows, optymalizacją wydajności i rozwiązywaniem problemów. W czym mogę pomóc?'
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getApiKey = () => {
    const encoded = 'Z3NrXzFrb3ZidW1YMVRpVEx6TXV6RDRBV0dkeWIzRll2MkhQaFVPZndiM3p6ZTdBMTY2SEljTjI=';
    return atob(encoded);
  };

  const SYSTEM_PROMPT = `Nazywasz sie ToolAI i jesteś AI Asystentem - profesjonalnym asystentem technicznym specjalizującym się w pomocy użytkownikom komputerów.

TWOJE KOMPETENCJE:
- Diagnozowanie i rozwiązywanie problemów z systemem Windows
- Optymalizacja wydajności komputera
- Pomoc w konfiguracji systemu i oprogramowania
- Rozwiązywanie błędów i konfliktów systemowych
- Porady dotyczące bezpieczeństwa i ochrony danych
- Pomoc w zarządzaniu procesami i pamięcią RAM
- Wsparcie w kwestiach związanych z grami i wydajnością gaming
- Czyszczenie systemu i konserwacja
- Aktualizacje sterowników i oprogramowania

ZASADY ODPOWIEDZI:
✅ ODPOWIADAJ TYLKO na pytania związane z:
   - Komputerami i systemem Windows
   - Problemami technicznymi
   - Optymalizacją i wydajnością
   - Oprogramowaniem i konfiguracją
   - Grami i gamingiem
   - Sprzętem komputerowym

❌ NIE ODPOWIADAJ na pytania:
   - Niezwiązane z komputerami
   - O polityce, religii, kontrowersyjnych tematach
   - Wymagające porad medycznych, prawnych, finansowych
   - Ogólnej wiedzy niezwiązanej z IT

STYL ODPOWIEDZI:
- Mów po polsku, w przyjazny i pomocny sposób
- Bądź konkretny i techniczny, ale zrozumiały
- Używaj emotikonów dla lepszej komunikacji
- Podawaj rozwiązania krok po kroku
- Jeśli pytanie jest poza Twoimi kompetencjami, grzecznie odmów i zasugeruj zadanie pytania związanego z komputerem

WAŻNE: Jeśli pytanie NIE dotyczy komputerów/IT, odpowiedz: "Przepraszam, ale mogę pomagać tylko w kwestiach związanych z komputerami i technologią. Czy masz jakieś pytanie dotyczące systemu Windows, wydajności komputera lub problemów technicznych? 💻"`;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => m.role !== 'system'),
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Helper Error:', err);
      setError('Nie udało się uzyskać odpowiedzi. Sprawdź połączenie internetowe.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Przepraszam, wystąpił błąd podczas łączenia z AI. Spróbuj ponownie za chwilę.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Cześć! Jestem ToolAI. Mogę pomóc Ci z problemami związanymi z komputerem, systemem Windows, optymalizacją wydajności i rozwiązywaniem błędów. Jak mogę Ci dzisiaj pomóc? 🤖'
      }
    ]);
    setError(null);
  };

  const quickQuestions = [
    "Jak zoptymalizować wydajność systemu?",
    "Dlaczego komputer działa wolno?",
    "Jak zwiększyć FPS w grach?",
    "Co zużywa najwięcej pamięci RAM?",
    "Jak wyczyścić dysk systemowy?"
  ];

  // Format markdown text
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Bold: **text** -> <strong>text</strong>
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code: `code` -> <code>code</code>
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
  };

  return (
    <div className="ai-helper">
      <header className="ai-helper-header">
        <div className="ai-header-content">
          <h1>AI Assistant</h1>
          <p className="subtitle">Techniczny asystent do spraw komputerowych i systemowych</p>
        </div>
        <button className="btn-clear-chat" onClick={clearChat} title="Wyczyść czat">
          Wyczyść historię
        </button>
      </header>

      <div className="ai-chat-container">
        <div className="ai-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? (
                  <img src="../assets/ONLY T.png" alt="Tool AI" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="message-content">
                <div 
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
                <div className="message-time">
                  {new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="ai-message assistant">
              <div className="message-avatar">
                <img src="../assets/ONLY T.png" alt="Tool AI" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="quick-questions">
            <p className="quick-title">Przykładowe pytania</p>
            <div className="quick-buttons">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="quick-question-btn"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ai-input-container">
        {error && (
          <div className="ai-error">
            {error}
          </div>
        )}
        
        <div className="ai-input-wrapper">
          <textarea
            className="ai-input"
            placeholder="Zadaj pytanie..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={1}
          />
          <button
            className="btn-send"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            ↑
          </button>
        </div>
        
        <div className="ai-footer-info">
          <span className="ai-status">
            {isLoading ? 'Przetwarzanie...' : 'Gotowy'}
          </span>
          <span className="ai-powered">Groq Llama 3.3 70B</span>
        </div>
      </div>
    </div>
  );
}
