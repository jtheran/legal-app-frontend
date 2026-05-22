'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Scale, User, FileText, ArrowLeft, Edit3, Trash2, Calendar, ClipboardList } from 'lucide-react';

interface CaseDetails {
  id: string;
  title: string;
  radicado: string;
  description?: string;
  status: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    dni: string;
    email: string;
  };
}

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCaseDetails = async () => {
    try {
      const response = await apiClient.get(`/cases/${id}`);
      setCaseData(response.data.data || response.data);
    } catch (error) {
      console.error(error);
      alert('Error al acceder al expediente judicial solicitado.');
      router.push('/dashboard/cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCaseDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!caseData || !confirm(`¿Deseas eliminar permanentemente el expediente Rad. ${caseData.radicado}?`)) return;
    try {
      await apiClient.delete(`/cases/${caseData.id}`);
      router.push('/dashboard/cases');
    } catch (error) {
      alert('No se pudo suprimir el caso.');
    }
  };

  if (loading) return <div className="p-6 text-sm text-slate-400 flex items-center gap-2"><Scale className="animate-spin" /> Estructurando árbol de radicaciones...</div>;
  if (!caseData) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Barra de Herramientas Superior */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.push('/dashboard/cases')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Volver al control de procesos
        </button>
        <div className="flex gap-2">
          <Link href={`/dashboard/cases/edit/${caseData.id}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Edit3 size={14} /> Editar Expediente
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
            <Trash2 size={14} /> Eliminar Proceso
          </button>
        </div>
      </div>

      {/* Cabecera Principal */}
      <div className="bg-slate-950 text-white p-6 rounded-xl space-y-2 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 pointer-events-none">
          <Scale size={180} />
        </div>
        <span className="text-[10px] bg-blue-500 font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase">Ficha Procesal</span>
        <h2 className="text-xl font-bold tracking-tight">{caseData.title}</h2>
        <p className="text-xs font-mono text-slate-300">Código de Radicación Nacional: {caseData.radicado}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO: DETALLES GENERALES */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-slate-200 rounded-xl space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <ClipboardList size={16} className="text-blue-600" /> Resumen y Cuadernos
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {caseData.description || 'El abogado de la oficina no ha ingresado notas adicionales o resúmenes sobre los cuadernos procesales de este litigio.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-50">
              <span className="flex items-center gap-1"><Calendar size={14} /> Apertura en Sistema: {new Date(caseData.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><FileText size={14} /> Estado Actual: <strong className="text-slate-700">{caseData.status}</strong></span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: PODERDANTE VINCULADO */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <User size={16} className="text-blue-600" /> Poderdante Relacionado
          </h3>
          {caseData.client ? (
            <div className="space-y-3">
              <div>
                <Link href={`/dashboard/clients/${caseData.client.id}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 block transition-colors">
                  {caseData.client.name}
                </Link>
                <span className="text-xs text-slate-400 font-mono">DNI/NIT: {caseData.client.dni}</span>
              </div>
              <div className="text-xs text-slate-500 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="block font-medium text-slate-600 mb-0.5">Correo para Notificaciones:</span>
                {caseData.client.email}
              </div>
              <Link href={`/dashboard/clients/${caseData.client.id}`} className="text-center block text-xs border border-slate-200 text-slate-600 font-medium py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                Ir al expediente del Cliente
              </Link>
            </div>
          ) : (
            <p className="text-xs text-amber-600">Este proceso se encuentra huérfano sin cliente asignado.</p>
          )}
        </div>
      </div>
    </div>
  );
}