'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, ShieldCheck, Lock, Mail, ArrowRight, Gavel } from 'lucide-react';
import apiClient from '@/api/client';
import { useAuth } from '@/context/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Petición al endpoint de autenticación
      const response = await apiClient.post('/auth/login', { email, password });
      
      // DESESTRUCTURACIÓN DE LA NUEVA RESPUESTA JSON
      const { accessToken, refreshToken, user } = response.data;

      // Enviamos las tres piezas de información al AuthContext
      login(accessToken, refreshToken, user);

      // Redirección inmediata al flujo de trabajo auditado
      if(user.role == 'ADMIN'){
        router.push('/admin/dashboard');
      }
      
      router.push('/dashboard');
      
      
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.response?.data?.message || 'Credenciales judiciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 font-sans">
      
      {/* SECCIÓN IZQUIERDA: Panel Animado Conceptual (Justicia y Derecho) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden border-r-4 border-amber-500/30">
        
        {/* Capas de Fondos Geométricos Animados (Simulando formalidad y estructura) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.4)_0%,transparent_70%)] animate-pulse duration-[6000ms]" />
        
        {/* Cuadrícula sutil que representa la estructura de la ley */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative z-10 w-full max-w-md text-center flex flex-col items-center">
          
          {/* Escudo Central Animado */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Anillo exterior rotatorio lento (La ley constante) */}
            <div className="absolute w-32 h-32 rounded-full border border-dashed border-amber-400/40 animate-[spin_20s_linear_infinite]" />
            {/* Anillo intermedio pulsante (La protección jurídica) */}
            <div className="absolute w-28 h-28 rounded-full border-2 border-blue-500/20 animate-ping opacity-75 duration-1000" />
            {/* Base sólida del logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-amber-500/80 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/10 transform hover:rotate-12 transition-transform duration-500">
              <Scale size={44} className="text-amber-400 animate-[pulse_3s_ease-in-out_infinite]" />
            </div>
          </div>

          {/* Textos de Branding */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            LEGAL<span className="text-amber-400 font-light">·AI</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
            Plataforma de Inteligencia Artificial para la gestión de expedientes y análisis predictivo de litigios.
          </p>

          {/* Indicadores de Valores Jurídicos en la Base */}
          <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-slate-800 text-slate-400 text-xs font-medium tracking-wider">
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck size={18} className="text-blue-500" />
              <span>LEGALIDAD</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Gavel size={18} className="text-amber-500" />
              <span>EQUIDAD</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Lock size={18} className="text-emerald-500" />
              <span>CUSTODIA</span>
            </div>
          </div>
        </div>

        {/* Decoraciones de Líneas de Luz en las esquinas */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SECCIÓN DERECHA: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <div className="lg:hidden inline-flex p-3 bg-slate-900 rounded-xl mb-4 border border-amber-500/40">
              <Scale size={28} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Control de Mando Judicial
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ingrese sus credenciales de apoderado para acceder al sistema.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center space-x-2 animate-[shake_0.5s_ease-in-out]">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input de Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide block">
                Correo Institucional
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-900 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abogado@firma.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Input de Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 tracking-wide">
                  Clave de Seguridad
                </label>
                <a href="#" className="text-xs text-blue-900 hover:underline font-medium">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-900 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center space-x-2 group active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none border-b-2 border-amber-500/50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Autenticar Firma Digital</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer del Formulario */}
          <div className="text-center pt-4">
            <p className="text-xs text-slate-400">
              Este sistema contiene datos procesales confidenciales amparados por el secreto profesional. El acceso no autorizado será sancionado penalmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}