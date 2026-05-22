'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Scale, Send, Bot } from 'lucide-react';
import { useAuth } from '@/context/authContext';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}


export default function LegalChatBubble() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '¡Hola! Soy tu asistente legal de IA. ¿En qué expediente o término te puedo ayudar hoy?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { token} = useAuth();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al recibir o enviar mensajes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmedMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      // Petición directa a tu backend de Node.js
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4586/api/v1'}/chat/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'bot', text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { sender: 'bot', text: 'Hubo un problema al consultar en la base de datos.' }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { sender: 'bot', text: 'Error de red. No se pudo conectar con el servidor legal.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Ventana de Chat Desplegable */}
      {isExpanded && (
        <div className="mb-4 w-80 md:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right">
          
          {/* Encabezado con Lucide Icons */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-200" />
              <div>
                <h3 className="font-bold text-sm">Asistente Legal IA</h3>
                <p className="text-[11px] text-indigo-200">Consultas en tiempo real</p>
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm flex items-start gap-2 ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}>
                  {msg.sender === 'bot' && <Bot className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {/* Animación de carga (Dots bouncing) */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]">s</div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  </div>
                  <p className="text-[11px] text-gray-400 animate-pulse">Consultando expedientes en base de datos...</p>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Formulario de Entrada */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isLoading ? "El asistente está analizando..." : "Pregúntame sobre un caso..."}
              disabled={isLoading} // <-- Bloquea la escritura externa
              className="flex-1 px-4 py-2 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()} // <-- Evita envíos duplicados
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center w-9 h-9 shadow-md shrink-0 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Botón Circular Flotante */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isExpanded 
            ? 'bg-gray-800 text-white rotate-90' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isExpanded ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}