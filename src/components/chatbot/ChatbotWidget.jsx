import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  ChevronDown,
  LoaderCircle,
  Send,
  X,
} from 'lucide-react';

import { sendChatbotMessageApi } from '../../api/chatbot.api';
import './chatbot-widget.css';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào! Tôi có thể hỗ trợ bạn tìm kiếm và lựa chọn tour du lịch phù hợp.',
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isSending, error]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const closeChat = () => setIsOpen(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const customerMessage = {
      id: `customer-${Date.now()}`,
      sender: 'customer',
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      customerMessage,
    ]);

    setMessage('');
    setError('');
    setIsSending(true);

    try {
      const response = await sendChatbotMessageApi(
        trimmedMessage,
        sessionId,
      );

      if (response.sessionId !== undefined) {
        setSessionId(response.sessionId);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: response.message,
        },
      ]);
    } catch (requestError) {
      const errorMessage =
        requestError?.response?.data?.message ||
        'Không thể kết nối với trợ lý du lịch. Vui lòng thử lại.';

      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleWidgetKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeChat();
    }
  };

  return (
    <>
      {isOpen && (
        <section
          id="chatbot-widget"
          className="chatbot-widget"
          role="dialog"
          aria-labelledby="chatbot-widget-title"
          aria-modal="false"
          onKeyDown={handleWidgetKeyDown}
        >
          <header className="chatbot-widget__header">
            <div className="chatbot-widget__title">
              <div className="chatbot-widget__icon">
                <Bot size={20} />
              </div>

              <div>
                <strong id="chatbot-widget-title">
                  Trợ lý du lịch
                </strong>
                <span>Smart Travel System</span>
              </div>
            </div>

            <button
              type="button"
              className="chatbot-widget__close"
              onClick={closeChat}
              aria-label="Đóng chatbot"
            >
              <X size={18} />
            </button>
          </header>

          <div
            className="chatbot-widget__messages"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label="Hội thoại với trợ lý du lịch"
          >
            {messages.map((item) => (
              <div
                key={item.id}
                className={`chatbot-message chatbot-message--${item.sender}`}
              >
                {item.text}
              </div>
            ))}

            {isSending && (
              <div
                className="chatbot-message chatbot-message--assistant chatbot-message--typing"
                role="status"
              >
                <LoaderCircle size={16} className="chatbot-widget__spinner" />
                Đang tìm thông tin phù hợp...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="chatbot-widget__error" role="alert">
              {error}
            </div>
          )}

          <form
            className="chatbot-widget__form"
            onSubmit={handleSubmit}
          >
            <label className="chatbot-widget__input-label">
              <span className="sr-only">Tin nhắn</span>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Bạn muốn tìm tour như thế nào?"
                maxLength={2000}
                rows={2}
                disabled={isSending}
              />
            </label>

            <button
              type="submit"
              disabled={!message.trim() || isSending}
              aria-label="Gửi tin nhắn"
              title="Gửi tin nhắn"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="chatbot-widget__hint">
            Enter để gửi · Shift+Enter để xuống dòng
          </div>
        </section>
      )}

      <button
        type="button"
        className={`chatbot-widget__launcher ${
          isOpen ? 'chatbot-widget__launcher--open' : ''
        }`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Đóng trợ lý du lịch' : 'Mở trợ lý du lịch'}
        aria-expanded={isOpen}
        aria-controls="chatbot-widget"
      >
        {isOpen ? <ChevronDown size={24} /> : <Bot size={24} />}
      </button>
    </>
  );
}
