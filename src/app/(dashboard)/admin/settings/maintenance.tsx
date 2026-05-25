'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { ShieldAlert, Server, ToggleLeft, ToggleRight, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface MaintenanceStatus {
  isActive: boolean;
  message?: string;
  updatedAt?: string;
}

export default function MaintenanceSettings() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Consultar el estado actual de la plataforma (GET /maintenance/status)
  const fetchMaintenanceStatus = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/maintenance/status');
      // Adaptado por si el backend retorna la propiedad directa o envuelta en .data
      setStatus(response.data.data || response.data);
    } catch (error) {
      console.error('Error al consultar estado de infraestructura:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  // 2. Activar Modo Mantenimiento (POST /maintenance/enable)
  const handleEnableMaintenance = async () => {
    const confirmAction = confirm(
      '⚠️ ATENCIÓN: Al activar el modo mantenimiento, se bloqueará temporalmente el acceso general a la plataforma para los abogados y clientes externos. ¿Deseas proceder?'
    );
    if (!confirmAction) return;

    setActionLoading(true);
    try {
      await apiClient.post('/maintenance/enable', {
        reason: 'Actualización programada del sistema de folios digitales'
      });
      alert('Modo mantenimiento ACTIVADO globalmente.');
      fetchMaintenanceStatus(); // Recargar estado limpio
    } catch (error) {
      alert('Error al intentar suspender el acceso a la plataforma.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Desactivar Modo Mantenimiento (POST /maintenance/disable)
  const handleDisableMaintenance = async () => {
    setActionLoading(true);
    try {
      await apiClient.post('/maintenance/disable');
      alert('Modo mantenimiento DESACTIVADO. Plataforma en línea de nuevo.');
      fetchMaintenanceStatus();
    } catch (error) {
      alert('Error al intentar restablecer el servicio.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-xs text-slate-400 flex items-center gap-2 animate-pulse">
        <RefreshCw className="animate-spin" size={14} /> 
        Inspeccionando sockets de producción y API Gateway...
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 max-w-2xl">
      {/* Encabezado Técnico */}
      <div className="flex items-start justify-between border-b pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Server size={16} className="text-slate-500" /> Operaciones del Servidor e Infraestructura
          </h2>
          <p className="text-[11px] text-slate-400">
            Control de pasarela, ventanas de despliegue de software y aislamiento de bases de datos.
          </p>
        </div>

        {/* Badge indicador de estado en tiempo real */}
        {status?.isActive ? (
          <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
            <AlertTriangle size={10} className="animate-pulse" /> Modo Mantenimiento Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle size={10} /> Servidores en Línea
          </span>
        )}
      </div>

      {/* Bloque contextual según estado de producción */}
      {status?.isActive ? (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <ShieldAlert size={14} /> El entorno operativo web y mobile se encuentra restringido.
          </p>
          <p className="text-[11px] text-amber-700/90">
            Cualquier solicitud HTTP entrante ajena al rol de administrador recibirá una respuesta controlada con código de estado <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">503 Service Unavailable</code>.
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-500 leading-relaxed">
          Activar el modo mantenimiento desconecta de manera segura a los usuarios concurrentes de las APIs operativas. Utilízalo exclusivamente durante ejecuciones críticas en la base de datos de Prisma, copias de seguridad de folios o mantenimiento en el servidor express.
        </p>
      )}

      {/* Acciones de Mutación Inmediata */}
      <div className="pt-2 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <span className="block text-xs font-bold text-slate-700">Alternar disponibilidad de la API</span>
          <span className="block text-[10px] text-slate-400">Gatilla las directivas globales del middleware express.</span>
        </div>

        <button
          onClick={status?.isActive ? handleDisableMaintenance : handleEnableMaintenance}
          disabled={actionLoading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
            status?.isActive
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-red-50 border border-red-200 hover:bg-red-100 text-red-600'
          } disabled:opacity-50`}
        >
          {actionLoading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : status?.isActive ? (
            <ToggleRight size={16} />
          ) : (
            <ToggleLeft size={16} />
          )}
          {actionLoading
            ? 'Comunicando con API Gateway...'
            : status?.isActive
            ? 'Restablecer Servicios Públicos'
            : 'Suspender Servicio / Desconectar'}
        </button>
      </div>
    </div>
  );
}