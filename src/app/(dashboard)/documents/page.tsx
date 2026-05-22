'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { FileText, Search, Upload, Eye, Trash2, Filter, Download, FileUp } from 'lucide-react';

interface LegalDocument {
  id: string;
  name: string;
  type: string; // Ej: 'CONTRATO', 'PODER', 'PRUEBA', 'SENTENCIA'
  size: string;
  createdAt: string;
  case?: { title: string; radicado: string };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/document', {
        params: { 
          name: search || undefined, 
          type: typeFilter || undefined 
        }
      });
      setDocuments(response.data.data || response.data);
    } catch (error) {
      console.error('Error al consultar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Deseas eliminar permanentemente el documento "${name}"?`)) return;
    try {
      await apiClient.delete(`/document/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      alert('Documento eliminado del expediente digital.');
    } catch (error) {
      alert('No se pudo eliminar el archivo.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={22} /> Archivo Digital y Documental
          </h1>
          <p className="text-xs text-slate-400">Pruebas, poderes, contratos y minutas indexadas en la plataforma.</p>
        </div>
        <Link href="/dashboard/documents/upload" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs">
          <Upload size={16} /> Radicar Documento
        </Link>
      </div>

      {/* Barra de Filtros Avanzados */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 border rounded-xl shadow-xs">
        <div className="flex gap-2 flex-1 border p-1 rounded-lg bg-slate-50">
          <input 
            type="text" 
            placeholder="Buscar documento por nombre..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && fetchDocuments()} 
            className="w-full pl-2 text-xs bg-transparent outline-none text-slate-700" 
          />
          <button onClick={fetchDocuments} className="bg-slate-800 text-white p-2 rounded-md hover:bg-slate-900">
            <Search size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 border px-2.5 py-1 rounded-lg min-w-[180px]">
          <Filter size={14} className="text-slate-400" />
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full text-xs bg-transparent outline-none text-slate-600 cursor-pointer"
          >
            <option value="">Todos los Tipos</option>
            <option value="PODER">Poderes Apud-Acta</option>
            <option value="CONTRATO">Contratos de Honorarios</option>
            <option value="PRUEBA">Material Probatorio</option>
            <option value="MINUTA">Minutas / Demandas</option>
          </select>
        </div>
      </div>

      {/* Listado de Documentos */}
      {loading ? (
        <div className="text-sm text-slate-400 animate-pulse flex items-center gap-2"><FileText className="animate-spin" /> Escaneando repositorio documental...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50/50">
          <p className="text-sm text-slate-400">No hay documentos registrados con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Nombre del Archivo</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Caso Judicial Asociado</th>
                <th className="p-3.5">Fecha Carga</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-3.5">
                    <Link href={`/dashboard/documents/${doc.id}`} className="font-semibold text-slate-900 hover:text-blue-600 block mb-0.5">{doc.name}</Link>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.size || 'N/A'}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                      {doc.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {doc.case ? (
                      <div>
                        <span className="font-medium block text-slate-800">{doc.case.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Rad: {doc.case.radicado}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Documento General</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    <Link href={`/dashboard/documents/${doc.id}`} className="p-1 inline-flex items-center text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Detalles del Archivo">
                      <Eye size={14} />
                    </Link>
                    <button onClick={() => handleDelete(doc.id, doc.name)} className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar del Servidor">
                      <Trash2 size={14} />
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