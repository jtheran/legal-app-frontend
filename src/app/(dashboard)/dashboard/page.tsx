'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Scale, Users, FileText, Activity, ShieldAlert, UserCheck } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth(); // <--- Leemos el usuario real logueado

  if (!user) return null;


  return (
    <div className="space-y-6">
      {/* Titular */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Centro de Operaciones Jurídicas</h1>
        <p className="text-sm text-gray-500">Métricas analíticas en tiempo real sobre los expedientes en custodia.</p>
      </div>

      {/* 🏛️ VISTA DASHBOARD: ABOGADO (LAWYER) */}
      {user.role === 'LAWYER' && (
        <>
          {/* Tarjetas de Métricas Core */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mis Casos Activos</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">14</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Scale size={24} /></div>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Clientes Asignados</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">8</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={24} /></div>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Documentos Indexados en RAG</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">42</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FileText size={24} /></div>
            </div>
          </div>
        </>
      )}

      {/* 👑 VISTA DASHBOARD: ADMINISTRADOR (ADMIN) */}
      {user.role === 'ADMIN' && (
        <>
          {/* Tarjetas de Métricas de Control del Buffet */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Abogados Registrados</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">6</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg"><UserCheck size={20} /></div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Casos Totales (Firma)</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">118</h3>
              </div>
              <div className="p-2.5 bg-slate-900 text-amber-400 rounded-lg"><Scale size={20} /></div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Clientes Globales</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">64</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Alertas de Auditoría (Hoy)</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">2</h3>
              </div>
              <div className="p-2.5 bg-red-50 text-red-600 rounded-lg"><ShieldAlert size={20} /></div>
            </div>
          </div>

          {/* Paneles de Control Detallados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimos Abogados Logueados / Actividad (Vinculado a AuditLog) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity size={16} className="text-blue-600" />
                <span>Últimos Accesos de Abogados (AuditLog)</span>
              </h3>
              <div className="divide-y divide-gray-100 text-sm">
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Dra. María Claudia Restrepo</p>
                    <p className="text-xs text-gray-400">IP: 192.168.1.45 · Navegador Chrome</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">LOGIN EXITOSO</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Dr. Jairo Therán</p>
                    <p className="text-xs text-gray-400">IP: 186.29.34.112 · App Móvil</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">LOGIN EXITOSO</span>
                </div>
              </div>
            </div>

            {/* Acciones Críticas Recientes sobre Documentos */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <ShieldAlert size={16} className="text-amber-500" />
                <span>Modificaciones del Sistema</span>
              </h3>
              <div className="divide-y divide-gray-100 text-sm">
                <div className="py-3">
                  <p className="text-gray-700"><span className="font-semibold text-gray-900">Dr. Jairo Therán</span> eliminó un registro del modelo <span className="font-mono bg-slate-100 px-1 text-xs">Document</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Hace 14 minutos · Recurso ID: doc-981a-42cd</p>
                </div>
                <div className="py-3">
                  <p className="text-gray-700"><span className="font-semibold text-gray-900">Sistema (Worker)</span> indexó con éxito 12 vectores en <span className="font-semibold text-blue-900">Qdrant</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Hace 1 hora · Expediente contractual N° 404</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}