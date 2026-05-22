'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/api/client';
import { User, Mail, ShieldAlert, Phone, Briefcase, FileText, ArrowLeft, Edit3, Trash2 } from 'lucide-react';

interface CaseShort {
  id: string;
  radicado: string;
  title: string;
  status: string;
}

interface ClientDetails {
  id: string;
  name: string;
  dni: string;
  email: string;
  phone?: string;
  cases?: CaseShort[];
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientDetails = async () => {
    try {
      const response = await apiClient.get(`/clients/${id}`);
      setClient(response.data.data || response.data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar la ficha del cliente.');
      router.push('/dashboard/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchClientDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!client || !confirm(`¿Deseas eliminar a ${client.name}? Se romperán sus vínculos.`)) return;
    try {
      await apiClient.delete(`/clients/${client.id}`);
      router.push('/dashboard/clients');
    } catch (error) {
      alert('Error al eliminar. Comprueba que no tenga procesos vigentes.');
    }
  };

  if (loading) return <div className="p-6 text-sm text-slate-500 flex items-center gap-2"><Briefcase className="animate-pulse" /> Cargando poderdante...</div>;
  if (!client) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Barra de Navegación superior */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Volver al listado
        </button>
        <div className="flex gap-2">
          <Link href={`/dashboard/clients/edit/${client.id}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Edit3 size={14} /> Editar Perfil
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
            <Trash2 size={14} /> Eliminar Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FICHA PERSONAL */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">{client.name}</h2>
              <p className="text-xs text-slate-400 font-mono">CC: {client.dni}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2.5"><Mail size={16} className="text-slate-400" /> <span>{client.email}</span></div>
            <div className="flex items-center gap-2.5"><Phone size={16} className="text-slate-400" /> <span>{client.phone || 'No registrado'}</span></div>
          </div>
        </div>

        {/* HISTORIAL PROCESAL */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Litigios y Procesos Asociados
            </h3>
            <Link href={`/dashboard/cases/new?clientId=${client.id}`} className="text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
              + Vincular Caso
            </Link>
          </div>

          {!client.cases || client.cases.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
              <ShieldAlert size={24} className="text-slate-300" /> Este cliente no registra expedientes judiciales abiertos.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {client.cases.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div>
                    <Link href={`/dashboard/cases/${c.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600 block">{c.title}</Link>
                    <span className="text-xs font-mono text-slate-400">Rad: {c.radicado}</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}