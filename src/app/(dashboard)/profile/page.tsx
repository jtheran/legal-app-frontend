'use client';

import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, ShieldAlert, CreditCard, Save, Lock, Bell, Inbox } from 'lucide-react';
import apiClient from '@/api/client';
import { useAuth } from '@/context/authContext';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

interface UserProfileData {
  id: string;
  email: string;
  dni: string;
  name: string;
  role: 'ADMIN' | 'LAWYER';
  createdAt: string;
  notifications: NotificationItem[]; // Inyectado por la relación de Prisma
}

export default function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // El endpoint /auth/profile debe venir con el include: { notifications: true } en el backend
        const response = await apiClient.get('/auth/profile');
        setProfile(response.data);
        setName(response.data.name);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        setMessage({ type: 'error', text: 'No se pudo recuperar el perfil judicial.' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      await apiClient.patch('/auth/profile', { name });
      setProfile(prev => prev ? { ...prev, name } : null);
      if (authUser) {
        const token = localStorage.getItem('legal_access_token') || '';
        const refreshToken = localStorage.getItem('legal_refresh_token') || '';
        login(token, refreshToken, { ...authUser, name });
      }
      setMessage({ type: 'success', text: 'Identidad corporativa actualizada con éxito.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500 font-mono animate-pulse">Cargando expediente de credenciales...</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mi Perfil de Operador</h1>
        <p className="text-xs text-gray-500">Gestione sus datos de firma y revise su historial de alertas y auditorías automáticas.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* FILA SUPERIOR: INFORMACIÓN DEL PANEL Y FORMULARIO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm h-fit">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-950 border border-amber-500/40 rounded-full flex items-center justify-center mb-3">
            <UserIcon size={28} className="text-amber-400" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide">{profile.name}</h2>
          <span className="mt-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-bold uppercase tracking-widest">{profile.role}</span>
          <div className="w-full border-t border-slate-800 mt-4 pt-4 text-left space-y-2 text-[11px] text-slate-400">
            <div className="flex justify-between"><span className="text-slate-500">Alta Sistema:</span> <span className="text-slate-300">{new Date(profile.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 tracking-wide block">Nombre Completo / Firma Autorizada</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white transition-all font-medium" disabled={saving} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><span>Correo Institucional</span><Lock size={10} /></label>
                <input type="text" readOnly value={profile.email} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-500 font-mono select-none outline-none cursor-not-allowed" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><span>Identificación (DNI)</span><Lock size={10} /></label>
                <input type="text" readOnly value={profile.dni} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-500 font-mono select-none outline-none cursor-not-allowed" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving || name.trim() === profile.name} className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-all disabled:opacity-40 border-b border-amber-500/40">
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={14} /><span>Actualizar Identidad</span></>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 📬 BANDEJA INFERIOR: HISTORIAL DE NOTIFICACIONES */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-2 bg-gray-50/70">
          <Bell size={16} className="text-slate-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Historial Completo de Notificaciones</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {(!profile.notifications || profile.notifications.length === 0) ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center space-y-2">
              <Inbox size={28} className="text-gray-300" />
              <p className="text-xs font-mono">Su buzón de notificaciones procesadas está vacío.</p>
            </div>
          ) : (
            profile.notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 flex items-start space-x-3 transition-colors ${!notif.read ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-amber-500 animate-pulse'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}