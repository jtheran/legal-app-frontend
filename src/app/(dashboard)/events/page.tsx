'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, Plus, Clock, 
  MapPin, FileText, Trash2, Ban, Loader2, X, AlertCircle 
} from 'lucide-react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  addMonths, subMonths, parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '@/api/client';

// ── INTERFACES SEGÚN TU DATA DEL BACKEND ─────────────────────────────────
interface EventItem {
  id: string;
  title: string;
  description: string;
  folderNumber: string;
  clientId: string;
  courtId: string;
  userId: string;
  date: string; // ISO String para mapear el día del evento
  status: 'OPEN' | 'CANCELLED' | 'COMPLETED';
}

export default function CalendarAdminPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  
  // Estado del Formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    folderNumber: '',
    clientId: '',
    courtId: '',
    date: '',
    status: 'OPEN' as 'OPEN' | 'CANCELLED' | 'COMPLETED'
  });

  // ── 1. CARGA DE EVENTOS DESDE EL BACKEND (GET /events) ──────────────────
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events');
      const data = response.data?.data || response.data || [];
      setEvents(data);
    } catch (err: any) {
      console.error('Error cargando la agenda:', err);
      setError('Error al sincronizar el calendario judicial con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ── 2. PROCESAMIENTO DE MATRIZ DEL CALENDARIO (date-fns) ────────────────
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // ── 3. MODALES Y FORMULARIOS ───────────────────────────────────────────
  const openCreateModal = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      folderNumber: '',
      clientId: '',
      courtId: '',
      date: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
      status: 'OPEN'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      folderNumber: event.folderNumber,
      clientId: event.clientId,
      courtId: event.courtId,
      date: event.date ? format(parseISO(event.date), "yyyy-MM-dd'T'HH:mm") : '',
      status: event.status
    });
    setIsModalOpen(true);
  };

  // ── 4. PERSISTENCIA EN EL BACKEND ───────────────────────────────────────
  
  // Guardar (POST /events o PUT /events/{id})
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedEvent) {
        await apiClient.put(`/events/${selectedEvent.id}`, formData);
      } else {
        await apiClient.post('/events', formData);
      }
      setIsModalOpen(false);
      await fetchEvents();
    } catch (err) {
      setError('Fallo al guardar el compromiso en el calendario.');
    } finally {
      setLoading(false);
    }
  };

  // Cancelación Lógica (PATCH /events/{id}/cancel)
  const handleCancelEvent = async (id: string) => {
    if (!confirm('¿Desea cancelar este evento programado?')) return;
    setLoading(true);
    try {
      await apiClient.patch(`/events/${id}/cancel`);
      setIsModalOpen(false);
      await fetchEvents();
    } catch (err) {
      setError('No se pudo cancelar el evento.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminación Física Permanente (DELETE /events/{id})
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¡Acción irreversible! ¿Desea eliminar este registro del calendario?')) return;
    setLoading(true);
    try {
      await apiClient.delete(`/events/${id}`);
      setIsModalOpen(false);
      await fetchEvents();
    } catch (err) {
      setError('Error al eliminar permanentemente el evento.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar eventos del día seleccionado para la agenda lateral
  const selectedDayEvents = events.filter(event => 
    event.date && isSameDay(parseISO(event.date), selectedDate)
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Agenda Judicial</h1>
          <p className="text-xs text-gray-500">Control de audiencias, términos procesales y reuniones de la firma.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 border border-amber-500/30 transition-all shadow-sm"
        >
          <Plus size={14} />
          <span>Programar Evento</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle size={14} /> <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── CUADRÍCULA DEL CALENDARIO (2 COLUMNAS DE ANCHO) ───────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          
          {/* Navegación del Mes */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex space-x-1">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Días de la Semana */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="py-1">{d}</div>)}
          </div>

          {/* Celdas de los Días del Mes */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const dayEvents = events.filter(e => e.date && isSameDay(parseISO(e.date), day));
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[75px] border border-gray-100 rounded-lg p-1 cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-slate-900 bg-slate-50/50' : 'bg-white hover:bg-gray-50/70'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span className={`text-xs font-semibold p-1 rounded-md inline-block w-6 h-6 text-center ${
                    isSelected ? 'bg-slate-900 text-white' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Badges/Puntos de Eventos dentro de la celda */}
                  <div className="space-y-0.5 max-h-[45px] overflow-hidden">
                    {dayEvents.slice(0, 2).map(e => (
                      <div 
                        key={e.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate border ${
                          e.status === 'CANCELLED' 
                            ? 'bg-rose-50 text-rose-700 border-rose-100 line-through' 
                            : 'bg-blue-50 text-blue-800 border-blue-100 font-medium'
                        }`}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-gray-400 font-bold text-center">
                        +{dayEvents.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AGENDA DETALLADA DIARIA (1 COLUMNA DE ANCHO) ────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-800" />
              <span>Compromisos del Día</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {loading && events.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                <Loader2 className="animate-spin inline mr-1.5" size={14} /> Sincronizando...
              </div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                No hay audiencias o términos fijados para esta fecha.
              </div>
            ) : (
              selectedDayEvents.map(event => (
                <div 
                  key={event.id}
                  onClick={() => openEditModal(event)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                    event.status === 'CANCELLED'
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xs font-bold text-gray-900 ${event.status === 'CANCELLED' ? 'line-through' : ''}`}>
                      {event.title}
                    </h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      event.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                  
                  <div className="grid grid-cols-2 gap-y-1 gap-x-2 pt-2 mt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {event.date ? format(parseISO(event.date), 'HH:mm aa') : 'Sin hora'}
                    </span>
                    <span className="flex items-center gap-1 font-mono truncate">
                      <FileText size={12} /> {event.folderNumber}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── MODAL OPERATIVO (CREAR / EDITAR COMPROMISO) ───────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {selectedEvent ? 'Detalle / Modificar Evento' : 'Fijar Nuevo Evento Judicial'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Título del Evento o Audiencia</label>
                <input 
                  type="text" required value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="Ej: Audiencia Inicial Art. 372"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 block">Número de Radicado / Exp</label>
                  <input 
                    type="text" required value={formData.folderNumber} 
                    onChange={(e) => setFormData({...formData, folderNumber: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 block">Fecha y Hora</label>
                  <input 
                    type="datetime-local" required value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 block">Descripción y Notas de Estrategia</label>
                <textarea 
                  rows={3} value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                />
              </div>

              {/* Botones de Gestión de Estado Existente */}
              <div className="pt-3 flex justify-between items-center border-t border-gray-100">
                <div className="flex space-x-1">
                  {selectedEvent && selectedEvent.status !== 'CANCELLED' && (
                    <button 
                      type="button" title="Cancelar Audiencia"
                      onClick={() => handleCancelEvent(selectedEvent.id)}
                      className="p-2 text-amber-600 hover:bg-amber-50 border border-transparent rounded-lg transition-colors"
                    >
                      <Ban size={14} />
                    </button>
                  )}
                  {selectedEvent && (
                    <button 
                      type="button" title="Eliminar Registro"
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="p-2 text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-xs font-medium hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center space-x-1"
                  >
                    <span>{selectedEvent ? 'Actualizar' : 'Agendar'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}