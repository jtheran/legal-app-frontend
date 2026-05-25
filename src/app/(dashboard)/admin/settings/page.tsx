'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, ShieldCheck, Save, Loader2 } from 'lucide-react';
import MaintenanceSettings from './maintenance';

// Estructura de tipado según nuestro esquema Swagger/YAML
interface SystemSettingItem {
  key: string;
  value: string;
}

export default function SettingsAdminPage() {
  // Estados vinculados a las llaves exactas definidas en el backend
  const [aiModel, setAiModel] = useState('microsoft/phi-4-multimodal-instruct');
  const [rateLimit, setRateLimit] = useState(100);
  const [minioBucket, setMinioBucket] = useState('legal-contracts-bucket');
  
  // Estados de control de flujo e interfaz
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Cargar las configuraciones reales al montar el componente
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // Ajusta la URL base según tus variables de entorno en Next.js
        const response = await fetch('/api/v1/settings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Asegúrate de enviar tu token si no manejas cookies de sesión
            'Authorization': `Bearer ${localStorage.getItem('token')}`, 
          },
        });

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Mapeamos las llaves de la BD a nuestros estados locales
          result.data.forEach((setting: SystemSettingItem) => {
            switch (setting.key) {
              case 'AI_MODEL':
                setAiModel(setting.value);
                break;
              case 'RATE_LIMIT_MAX':
                setRateLimit(Number(setting.value));
                break;
              case 'MINIO_BUCKET_NAME':
                setMinioBucket(setting.value);
                break;
              default:
                break;
            }
          });
        }
      } catch (error) {
        console.error('Error cargando configuraciones desde el servidor:', error);
        setMessage({ type: 'error', text: 'No se pudo conectar con el servidor de infraestructura.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 2. Guardar las configuraciones en bloque (Lote atómico)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Mapeamos los estados locales al formato [{ key, value }] requerido
    const payload = {
      settings: [
        { key: 'AI_MODEL', value: aiModel },
        { key: 'RATE_LIMIT_MAX', value: String(rateLimit) },
        { key: 'MINIO_BUCKET_NAME', value: minioBucket }
      ]
    };

    try {
      const response = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Configuraciones persistidas en DB e invalidadas en Redis con éxito.' });
        // Limpiar el mensaje de éxito automáticamente después de 4 segundos
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al intentar actualizar las variables.' });
      }
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      setMessage({ type: 'error', text: 'Error crítico de comunicación de red.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="animate-spin text-blue-900" size={24} />
        <p className="text-xs text-gray-500">Sincronizando con los servicios de infraestructura central...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Configuración del Sistema</h1>
          <p className="text-xs text-gray-500">Ajuste de los parámetros core de la IA, almacenamiento MinIO y políticas de Rate Limiting.</p>
        </div>
      </div>
      
      <MaintenanceSettings/>

      {/* Banner de Feedback Operativo */}
      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Sección del Motor de IA */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
            <Cpu size={16} className="text-blue-900" />
            <span>Configuración del LLM (NVIDIA API)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">Modelo de Lenguaje Activo</label>
              <select 
                value={aiModel} 
                onChange={(e) => setAiModel(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
              >
                <option value="microsoft/phi-4-multimodal-instruct">microsoft/phi-4-multimodal-instruct</option>
                <option value="nvidia/llama-3.1-nemotron-512k">nvidia/llama-3.1-nemotron-512k</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">Temperatura del RAG</label>
              <input type="number" step="0.05" defaultValue="0.10" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-900" disabled />
            </div>
          </div>
        </div>

        {/* Sección de Infraestructura y Almacenamiento */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
            <HardDrive size={16} className="text-amber-500" />
            <span>Almacenamiento de Expedientes (MinIO/S3)</span>
          </h3>
          <div className="space-y-1 max-w-md">
            <label className="text-[11px] font-semibold text-gray-600 block">Nombre del Bucket Activo</label>
            <input 
              type="text" 
              value={minioBucket} 
              onChange={(e) => setMinioBucket(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-900" 
            />
          </div>
        </div>

        {/* Sección de Seguridad Operativa */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Políticas de Rate Limiting (Redis Client)</span>
          </h3>
          <div className="space-y-1 max-w-xs">
            <label className="text-[11px] font-semibold text-gray-600 block">Máximo de Peticiones / Minuto</label>
            <input 
              type="number" 
              value={rateLimit} 
              onChange={(e) => setRateLimit(Number(e.target.value))} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-900" 
            />
          </div>
        </div>

        {/* Botón de Guardado con Estado de Carga */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center space-x-1.5 shadow border-b-2 border-amber-500/50 transition-all active:scale-95 disabled:pointer-events-none"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Guardar Configuración Global</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}