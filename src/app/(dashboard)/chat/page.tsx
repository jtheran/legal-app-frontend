'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Scale, ShieldAlert } from 'lucide-react';
import apiClient from '@/api/client';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatRagPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hace scroll automático al último mensaje recibido o enviado
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Petición directa a tu endpoint en el backend local
      const response = await apiClient.post('/ai/query-rag', {
        question: userText,
        caseId: 'general' // Aquí inyectarás dinámicamente el ID del caso de Prisma
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: response.data.answer, // La respuesta armada con RAG y NVIDIA
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al consultar el RAG:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: '❌ Ocurrió un error al intentar procesar la consulta con el motor judicial de IA.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Encabezado del Contexto Legal */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-900 p-2 rounded-lg text-white">
            <Scale size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Consultor Jurídico Inteligente</h1>
            <p className="text-xs text-gray-500">Análisis documental basado en expedientes activos (Qdrant + Phi-4)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Conectado a API Local</span>
        </div>
      </div>

      {/* Historial de Mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-3">
            <Bot size={48} className="text-blue-900 animate-bounce" />
            <h3 className="text-gray-900 font-semibold text-base">¿En qué puedo asistirte hoy, Abogado?</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Puedes preguntarme sobre plazos procesales, buscar contradicciones en las minutas cargadas o solicitar resúmenes de jurisprudencia de tus casos.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex space-x-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`p-2 rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-blue-900 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`p-4 rounded-xl shadow-sm text-sm whitespace-pre-line leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex space-x-3 mr-auto max-w-xl">
            <div className="bg-blue-900 text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <span className="text-xs text-gray-400 pl-1 font-medium">Revisando vectores en Qdrant...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Entrada de Texto */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-md">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta legal aquí (ej: ¿Cuáles son las pretensiones de la demanda?)..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 text-gray-800"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>Enviar</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}