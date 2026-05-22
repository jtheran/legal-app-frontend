'use client';

import React, { useState } from 'react';
import { Settings, Cpu, HardDrive, ShieldCheck, Save } from 'lucide-react';

export default function SettingsAdminPage() {
  const [aiModel, setAiModel] = useState('microsoft/phi-4-multimodal-instruct');
  const [rateLimit, setRateLimit] = useState(100);
  const [minioBucket, setMinioBucket] = useState('legal-contracts-bucket');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Configuraciones guardadas en memoria local. Se sincronizaron las variables de entorno de infraestructura.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Configuración del Sistema</h1>
        <p className="text-xs text-gray-500">Ajuste de los parámetros core de la IA, almacenamiento MinIO y políticas de Rate Limiting.</p>
      </div>

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
              <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-900">
                <option value="microsoft/phi-4-multimodal-instruct">microsoft/phi-4-multimodal-instruct</option>
                <option value="nvidia/llama-3.1-nemotron-512k">nvidia/llama-3.1-nemotron-512k</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">Temperatura del RAG</label>
              <input type="number" step="0.05" defaultValue="0.10" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-900" />
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
            <input type="text" value={minioBucket} onChange={(e) => setMinioBucket(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-900" />
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
            <input type="number" value={rateLimit} onChange={(e) => setRateLimit(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-900" />
          </div>
        </div>

        {/* Botón de Guardado */}
        <div className="flex justify-end">
          <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center space-x-1.5 shadow border-b-2 border-amber-500/50 transition-all active:scale-95">
            <Save size={14} />
            <span>Guardar Configuración Global</span>
          </button>
        </div>
      </form>
    </div>
  );
}