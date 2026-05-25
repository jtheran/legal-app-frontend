'use client';

import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Mail, CreditCard, Search, Pencil, Trash, Loader2, X } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  // Estados para controlar los Modales y Formularios
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<LawyerUser | null>(null);
  
  // Estado único del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    role: 'LAWYER' as 'ADMIN' | 'LAWYER',
    password: '' // Solo obligatorio en registros nuevos
  });

  // 1. Obtener listado de abogados (GET /users)
  const fetchLawyers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/users');
      // Ajusta la desestructuración según la envoltura de tu API (ej. response.data.data)
      if (response.data && Array.isArray(response.data)) {
        setLawyers(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setLawyers(response.data.data);
      }
    } catch (err: any) {
      console.error('Error cargando apoderados:', err);
      setError('No se pudo recuperar el listado de abogados del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  // 2. Controladores de Apertura/Cierre de Formularios
  const openCreateModal = () => {
    setEditingLawyer(null);
    setFormData({ name: '', email: '', dni: '', role: 'LAWYER', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (lawyer: LawyerUser) => {
    setEditingLawyer(lawyer);
    setFormData({
      name: lawyer.name,
      email: lawyer.email,
      dni: lawyer.dni,
      role: lawyer.role,
      password: '' // No se sobreescribe a menos que el backend lo maneje opcional
    });
    setIsModalOpen(true);
  };

  // 3. Procesar Envío de Datos (POST /users o PUT /users/{id})
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingLawyer) {
        // Modo Edición: PUT /users/{id}
        const { password, ...updateData } = formData; // Evitamos mandar passwords vacíos en PUT
        await apiClient.put(`/users/${editingLawyer.id}`, updateData);
      } else {
        // Modo Registro: POST /users
        await apiClient.post('/users', formData);
      }
      
      setIsModalOpen(false);
      await fetchLawyers(); // Recarga de lista fresca desde BD
    } catch (err: any) {
      console.error('Error procesando operación:', err);
      setError(err.response?.data?.message || 'Error operativo en el servidor al guardar.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Desactivación Lógica (PATCH /users/{id}/deactivate)
  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de que desea revocar el acceso y desactivar al apoderado ${name}?`)) return;
    
    setLoading(true);
    try {
      await apiClient.patch(`/users/${id}/deactivate`);
      await fetchLawyers();
    } catch (err: any) {
      console.error('Error de deactivación:', err);
      setError('Fallo al intentar dar de baja al usuario en la plataforma.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(l => 
    l.name?.toLowerCase().includes(search.toLowerCase()) || 
    l.dni?.includes(search) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Control de Abogados</h1>
          <p className="text-xs text-gray-500">Alta, baja y gestión de permisos del personal de la firma.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 border border-amber-500/30 transition-all shadow-sm"
        >
          <UserPlus size={14} />
          <span>Registrar Nuevo Apoderado</span>
        </button>
      </div>

      {/* Banner de Errores Operativos */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center max-w-md">
        <Search size={16} className="text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, correo o cédula/DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs w-full focus:outline-none text-gray-700 bg-transparent"
        />
      </div>

      {/* Tabla Corporativa */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
              {loading && lawyers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    <Loader2 className="animate-spin inline mr-2 text-slate-800" size={16} />
                    Sincronizando registros del personal...
                  </td>
                </tr>
              ) : filteredLawyers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No se encontraron apoderados con los criterios ingresados.
                  </td>
                </tr>
              ) : (
                filteredLawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{lawyer.name}</div>
                      <div className="text-[11px] text-gray-400 flex items-center mt-0.5">
                        <Mail size={12} className="mr-1" /> {lawyer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      <span className="flex items-center">
                        <CreditCard size={12} className="mr-1 text-gray-400" /> {lawyer.dni}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        lawyer.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        <Shield size={10} />
                        {lawyer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(lawyer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <button 
                        onClick={() => openEditModal(lawyer)}
                        title="Editar Información"
                        className="p-1.5 text-blue-600 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeactivate(lawyer.id, lawyer.name)}
                        title="Revocar Acceso de Abogado"
                        className="p-1.5 text-red-500 rounded-md hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                      >
                        <Trash size={16} /> 
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE PERSISTENCIA (REGISTRO / EDICIÓN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-scaleIn">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                {editingLawyer ? `Modificar Perfil: ${editingLawyer.name}` : 'Registrar Nuevo Apoderado'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Cédula Profesional o DNI</label>
                <input 
                  type="text" 
                  required
                  value={formData.dni} 
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Correo Electrónico Corporativo</label>
                <input 
                  type="email" 
                  required
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Contraseña: Requerida solo para registros nuevos */}
              {!editingLawyer && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 block">Contraseña Temporal de Acceso</label>
                  <input 
                    type="password" 
                    required={!editingLawyer}
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Rol de Permisos en Sistema</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'ADMIN' | 'LAWYER'})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="LAWYER">LAWYER (Acceso Operativo)</option>
                  <option value="ADMIN">ADMIN (Acceso Total Infraestructura)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-xs font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingLawyer ? 'Guardar Cambios' : 'Dar de Alta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}