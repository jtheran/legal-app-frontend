'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Search, Plus, Eye, Trash2, Shield, Phone, Mail } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  dni: string;
  email: string;
  phone?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClients = async (query = '') => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/clients`, { params: { search: query } });
      setClients(response.data.data || response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${name}?`)) return;
    try {
      await apiClient.delete(`/clients/${id}`);
      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      alert('Error al eliminar poderdante.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" size={22} /> Base de Clientes Vinculados
          </h1>
          <p className="text-xs text-slate-400">Administración de expedientes maestros y datos de contacto.</p>
        </div>
        <Link href="/dashboard/clients/new" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Registrar Cliente
        </Link>
      </div>

      {/* Buscador */}
      <div className="flex gap-2 max-w-sm border p-1 rounded-lg bg-white shadow-xs">
        <input type="text" placeholder="Buscar por DNI o apellido..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchClients(search)} className="w-full pl-2 text-xs outline-none" />
        <button onClick={() => fetchClients(search)} className="bg-slate-800 text-white p-2 rounded-md"><Search size={14} /></button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 animate-pulse">Consultando base de datos...</div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Poderdante</th>
                <th className="p-3.5">Identificación</th>
                <th className="p-3.5">Contacto</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-900">{client.name}</td>
                  <td className="p-3.5 font-mono text-slate-500">{client.dni}</td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-500"><Mail size={12} /> {client.email}</div>
                    {client.phone && <div className="flex items-center gap-1 text-slate-400"><Phone size={12} /> {client.phone}</div>}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <Link href={`/dashboard/clients/${client.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                      <Eye size={12} /> Ficha
                    </Link>
                    <button onClick={() => handleDelete(client.id, client.name)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}