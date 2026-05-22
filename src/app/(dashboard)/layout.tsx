'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/authContext';
import apiClient from '@/api/client';
import { 
  LayoutDashboard,
  PanelLeft,
  Scale, 
  Users, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  UserCheck, 
  User2, 
  ChevronDown,
  Bell,
  CheckCheckIcon,
  Clock
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  
  // Estados de control para los Dropdowns
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // 1. Cargar últimas 5 notificaciones para el Header
  useEffect(() => {
    if (!user) return;
    const fetchLatestNotifications = async () => {
      try {
        // Ajusta este endpoint según tu backend (puede ser /auth/profile o uno específico)
        const response = await apiClient.get('/notifications');
        setNotifications(response.data.slice(0, 5));
      } catch (err) {
        console.error('Error al cargar alertas del header:', err);
      }
    };

    fetchLatestNotifications();
    // Opcional: Podrías poner un setInterval cada 60s si deseas un sondeo básico
  }, [user, pathname]); // Recargar si cambia de ruta (por si las marca como leídas en perfil)

  // 2. Detectar clics externos para cerrar menús
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-mono">Verificando Credenciales...</div>;
  }
  if (!user) return null;

  const menuItems = [
    { name: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mis Casos', href: '/cases', icon: Scale },
    { name: 'Clientes', href: '/client', icon: Users },
  ];

  const adminItems = [
    { name: 'Dashboard de Control', href: '/admin/dashboard', icon: PanelLeft },
    { name: 'Control de Abogados', href: '/admin/lawyer', icon: UserCheck },
    { name: 'Logs de Auditoría', href: '/admin/audit', icon: ShieldAlert },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      
      {/* SIDEBAR IZQUIERDO */}
      <aside className="w-64 bg-slate-900 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 space-x-3">
            <Scale className="text-amber-400" size={24} />
            <span className="text-white font-bold tracking-wider text-base">
              LEGAL<span className="text-amber-400 font-light">·AI</span>
            </span>
          </div>

          {/* Render dinámico del Perfil transformado en acceso directo */}
          <Link 
            href="/profile" 
            className="block p-4 bg-slate-900/50 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors group"
          >
            <p className="text-[10px] bg-amber-500/10 text-amber-400 font-bold tracking-widest px-2 py-0.5 rounded w-max mb-1">
              {user.role}
            </p>
            <p className="text-sm text-slate-200 font-medium truncate group-hover:text-amber-400 transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 truncate font-mono">
              CC/DNI: {user.dni}
            </p>
          </Link>

          <nav className="p-4 space-y-1">
          {user.role === 'LAWYER' && (
              <div className="pt-6 space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Navegación
              </p>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              </div>
            )}

            {/* SECCIÓN ADMINISTRADOR */}
            {user.role === 'ADMIN' && (
              <div className="pt-6 space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                  Administración
                </p>
                
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>
    
        {/* Cierre de Sesión Seguro desde Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sistema</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER GENERAL */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-md z-30">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Estado de la Sesión */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium tracking-wide">
            <CheckCheckIcon size={18} className="text-emerald-500" />
            <span>Sesión Validada</span>
          </div>

          {/* Separador Visual (Opcional, se oculta en pantallas muy chicas) */}
          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          {/* Fecha y Hora del Sistema */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium tracking-wide bg-slate-900 px-2.5 py-1 shadow-sm">
            <Clock size={20} className="text-white-900" />
            <span className="font-mono text-amber-400">
              {new Date().toLocaleString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        </div>

          <div className="flex items-center space-x-4">
            {/* 🔔 COMPONENTE DROPDOWN DE NOTIFICACIONES */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative focus:outline-none"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center tracking-tighter">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alertas del Expediente</span>
                    <Link href="/profile" onClick={() => setNotifOpen(false)} className="text-[10px] text-amber-400 hover:underline">Ver todas</Link>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-900">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 font-mono">Sin alertas pendientes.</div>
                    ) : (
                      notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href="/profile"
                          onClick={() => setNotifOpen(false)}
                          className={`block p-3 text-left transition-colors hover:bg-slate-900 ${!notif.read ? 'bg-slate-900/30' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <p className={`text-xs font-medium truncate w-44 ${!notif.read ? 'text-amber-400' : 'text-slate-200'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[9px] text-slate-500 font-mono shrink-0">
                              {new Date(notif.createdAt).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.description}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DROPDOWN DE USUARIO */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors focus:outline-none bg-slate-800/40 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <User2 size={13} className="text-amber-400" />
                </div>
                <span className="text-xs font-semibold tracking-wide truncate max-w-[100px]">{user.name}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1 border-b border-slate-900">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{user.role}</p>
                  </div>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors">
                    <User2 size={14} className="text-slate-400" />
                    <span>Mi Perfil</span>
                  </Link>
                  <div className="border-t border-slate-900 my-1" />
                  <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors text-left">
                    <LogOut size={14} />
                    <span>Terminar Sesión</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}