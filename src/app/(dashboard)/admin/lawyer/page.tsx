'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, UserX, UserPlus, Mail, CreditCard, Search, Pencil, Trash } from 'lucide-react';
import apiClient from '@/api/client';

interface LawyerUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LAWYER';
  dni: string;
  createdAt: string;
}

export default function LawyersAdminPage() {
  const [lawyers, setLawyers] = useState<LawyerUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Carga inicial (Simulada/Conectada a tu backend GET /users o similar)
  useEffect(() => {
    // Aquí mapeas el llamado real a tu API local
    setLawyers([
      { id: '1', name: 'Dr. Juan Pérez', email: 'juan@legal.com', role: 'LAWYER', dni: '12345678', createdAt: '2026-05-10' },
      { id: '2', name: 'Dra. María Restrepo', email: 'maria@legal.com', role: 'ADMIN', dni: '87654321', createdAt: '2026-04-15' },
    ]);
  }, []);

  const filteredLawyers = lawyers.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.dni.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Control de Abogados</h1>
          <p className="text-xs text-gray-500">Alta, baja y gestión de permisos del personal de la firma.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 border border-amber-500/30 transition-all shadow-sm">
          <UserPlus size={14} />
          <span>Registrar Nuevo Apoderado</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center max-w-md">
        <Search size={16} className="text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o cédula/DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs w-full focus:outline-none text-gray-700 bg-transparent"
        />
      </div>

      {/* Tabla Corportativa */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3.5">Abogado / Información</th>
              <th className="px-6 py-3.5">Identificación</th>
              <th className="px-6 py-3.5">Rol de Sistema</th>
              <th className="px-6 py-3.5">Fecha de Alta</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs text-gray-700">
            {filteredLawyers.map((lawyer) => (
              <tr key={lawyer.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{lawyer.name}</div>
                  <div className="text-[11px] text-gray-400 flex items-center mt-0.5">
                    <Mail size={12} className="mr-1" /> {lawyer.email}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-gray-600">
                  <span className="flex items-center"><CreditCard size={12} className="mr-1 text-gray-400" /> {lawyer.dni}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    lawyer.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Shield size={10} />
                    {lawyer.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{lawyer.createdAt}</td>
                <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                  <button 
                    title="Editar"
                    className="p-1.5 text-blue-600 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    title="Revocar"
                    className="p-1.5 text-red-500 rounded-md hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                  >
                    <Trash size={16} /> 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}