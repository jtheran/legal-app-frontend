'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/api/client';
import { ArrowLeft, FileText, Calendar, Trash2, FileUp, RefreshCw, Layers, HardDrive } from 'lucide-react';

interface DocDetails {
  id: string;
  name: string;
  type: string;
  size: string;
  createdAt: string;
  url: string;
  case?: { id: string; title: string; radicado: string };
}

export default function DocumentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [doc, setDoc] = useState<DocDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocDetails = async () => {
    try {
      const response = await apiClient.get(`/document/${id}`);
      setDoc(response.data.data || response.data);
    } catch (error) {
      alert('Error al acceder al documento digital.');
      router.push('/dashboard/documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDocDetails();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Mutación: Reemplazar el archivo cargando una nueva versión (/document/upload)
  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !doc) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentId', doc.id); // Enviamos el ID para indicar qué archivo se pisa/reemplaza

    try {
      await apiClient.post('/document/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Nueva versión del archivo cargada y reemplazada con éxito.');
      setSelectedFile(null);
      fetchDocDetails(); // Refrescar metadatos (tamaño, fecha de actualización, etc.)
    } catch (error) {
      alert('Error en el servidor al intentar reemplazar el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!doc || !confirm(`¿Eliminar permanentemente el documento: ${doc.name}?`)) return;
    try {
      await apiClient.delete(`/document/${doc.id}`);
      router.push('/dashboard/documents');
    } catch (error) {
      alert('No se pudo suprimir el archivo.');
    }
  };

  if (loading) return <div className="p-6 text-sm text-slate-400 flex items-center gap-2"><RefreshCw className="animate-spin" /> Extrayendo archivo del repositorio central...</div>;
  if (!doc) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Barra de control */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.push('/dashboard/documents')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Regresar al archivo digital
        </button>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
          <Trash2 size={14} /> Eliminar Archivo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* METADATOS DEL DOCUMENTO */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl space-y-4 shadow-xs h-fit">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><FileText size={22} /></div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-slate-900 text-sm truncate" title={doc.name}>{doc.name}</h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase">{doc.type}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between"><span className="text-slate-400">Peso en disco:</span> <span className="font-mono">{doc.size || 'N/A'}</span></div>
            <div className="flex justify-between flex-wrap gap-1"><span className="text-slate-400">Radicación web:</span> <span className="flex items-center gap-1 font-medium"><Calendar size={12} /> {new Date(doc.createdAt).toLocaleDateString()}</span></div>
          </div>

          {doc.case && (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Expediente Ligado</span>
              <Link href={`/dashboard/cases/${doc.case.id}`} className="text-xs font-semibold text-blue-600 hover:underline line-clamp-1">
                {doc.case.title}
              </Link>
            </div>
          )}
        </div>

        {/* COMPONENTE DE REEMPLAZO / SUBIDA (POST /document/upload) */}
        <div className="md:col-span-2 bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
            <Layers size={16} className="text-blue-600" /> Control de Versiones del Documento
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Si se han realizado subsanaciones, correcciones o existe un folio más reciente, puedes cargar el nuevo archivo. El sistema reemplazará el binario anterior conservando los metadatos básicos de radicación.
          </p>

          <form onSubmit={handleUpdateDocument} className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
            <div className="flex flex-col items-center justify-center text-center">
              <FileUp size={32} className="text-slate-400 mb-2 animate-bounce" />
              <label className="bg-white border px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50">
                Seleccionar nuevo archivo
                <input 
                  type="file" 
                  required
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
              {selectedFile ? (
                <p className="text-xs text-emerald-600 font-medium mt-2">✓ Preparado: {selectedFile.name}</p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">PDF, Word, imágenes de pruebas (Max 15MB)</p>
              )}
            </div>

            {selectedFile && (
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                {uploading ? <RefreshCw size={14} className="animate-spin" /> : <HardDrive size={14} />}
                {uploading ? 'Sobreescribiendo archivo...' : 'Confirmar Reemplazo / Upload'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}