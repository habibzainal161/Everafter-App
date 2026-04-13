/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Palette, 
  FileText, 
  Database, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  Moon,
  Sun,
  Check,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { storage, cn } from '../lib/utils';
import { APP_LOGO, APP_NAME, APP_TAGLINE } from '../constants';
import CloudinaryUpload from './CloudinaryUpload';

interface SettingsProps {
  onUpdate?: () => void;
}

export default function Settings({ onUpdate }: SettingsProps) {
  const [studioInfo, setStudioInfo] = useState({
    name: APP_NAME,
    tagline: APP_TAGLINE,
    whatsapp: '',
    instagram: '',
    logo: APP_LOGO
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    primaryColor: '#3B82F6'
  });

  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedStudio = storage.get('studio_info', null);
    if (savedStudio) setStudioInfo(savedStudio);
  }, []);

  const handleSave = () => {
    storage.set('studio_info', studioInfo);
    setIsSaved(true);
    if (onUpdate) onUpdate();
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetData = async () => {
    if (confirm('PERINGATAN: Semua data customer, proyek, dan galeri akan dihapus permanen, TERMASUK file di Cloudinary. Lanjutkan?')) {
      const assets = storage.get('gallery_assets', []);
      const publicIds = assets.map((a: any) => a.publicId).filter(Boolean);

      if (publicIds.length > 0) {
        try {
          const response = await fetch('/api/media/delete-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicIds })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Gagal menghapus aset Cloudinary:', errorData.error);
            alert('Data lokal akan dihapus, namun beberapa file di Cloudinary mungkin gagal dihapus. Silakan cek konsol.');
          }
        } catch (error) {
          console.error('Error calling delete API:', error);
          alert('Gagal menghubungi server untuk menghapus file Cloudinary. Data lokal tetap akan dihapus.');
        }
      }

      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      customers: storage.get('customers', []),
      projects: storage.get('projects', []),
      gallery: storage.get('gallery_assets', []),
      studio: studioInfo
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `everafter-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (confirm('Mengimpor data akan menimpa data yang ada saat ini. Lanjutkan?')) {
          if (data.customers) storage.set('customers', data.customers);
          if (data.projects) storage.set('projects', data.projects);
          if (data.gallery) storage.set('gallery_assets', data.gallery);
          if (data.studio) storage.set('studio_info', data.studio);
          
          alert('Data berhasil diimpor!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Gagal mengimpor data. Pastikan format file benar.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-display font-bold text-navy dark:text-dark-text">Pengaturan</h2>
        <p className="text-gray-500 dark:text-dark-muted">Konfigurasi studio dan manajemen sistem Anda.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Studio Profile */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-navy dark:text-dark-text">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Store size={20} />
              </div>
              <h3 className="text-lg font-bold">Profil Studio</h3>
            </div>

            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-dark-border">
              <div className="w-32 h-32 bg-white dark:bg-dark-card rounded-2xl p-3 shadow-sm flex items-center justify-center border border-gray-100 dark:border-dark-border overflow-hidden">
                <img src={studioInfo.logo || APP_LOGO} alt="Logo" className="w-full h-auto object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-bold text-navy dark:text-dark-text">Logo Studio</h4>
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">Logo ini akan muncul di dashboard dan sidebar aplikasi.</p>
                </div>
                <div className="flex items-center gap-2">
                  <CloudinaryUpload 
                    onUploadSuccess={(asset) => setStudioInfo({...studioInfo, logo: asset.url})}
                    label="Ganti Logo"
                    className="!space-y-0"
                  />
                  {studioInfo.logo !== APP_LOGO && (
                    <button 
                      onClick={() => setStudioInfo({...studioInfo, logo: APP_LOGO})}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Gunakan Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Studio</label>
                <input 
                  type="text" 
                  value={studioInfo.name}
                  onChange={e => setStudioInfo({...studioInfo, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text border border-transparent focus:border-blue-500/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slogan / Tagline</label>
                <input 
                  type="text" 
                  value={studioInfo.tagline}
                  onChange={e => setStudioInfo({...studioInfo, tagline: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text border border-transparent focus:border-blue-500/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp Bisnis</label>
                <input 
                  type="tel" 
                  placeholder="628..."
                  value={studioInfo.whatsapp}
                  onChange={e => setStudioInfo({...studioInfo, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text border border-transparent focus:border-blue-500/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram Studio</label>
                <input 
                  type="text" 
                  placeholder="@studio_anda"
                  value={studioInfo.instagram}
                  onChange={e => setStudioInfo({...studioInfo, instagram: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text border border-transparent focus:border-blue-500/30 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all",
                  isSaved ? "bg-green-500 text-white" : "bg-navy dark:bg-blue-600 text-white hover:bg-navy/90"
                )}
              >
                {isSaved ? <Check size={18} /> : <Save size={18} />}
                {isSaved ? 'Tersimpan' : 'Simpan Perubahan'}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: System & Data */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-navy dark:text-dark-text">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Database size={20} />
              </div>
              <h3 className="text-lg font-bold">Manajemen Data</h3>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-blue-500" />
                  <span className="text-xs font-bold text-navy dark:text-dark-text">Backup Data (JSON)</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Upload size={18} className="text-purple-500" />
                  <span className="text-xs font-bold text-navy dark:text-dark-text">Import Data</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportData} 
                  className="hidden" 
                  accept=".json"
                />
                <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-4">
                <button 
                  onClick={handleResetData}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/5 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs"
                >
                  <RotateCcw size={16} />
                  Reset Semua Data
                </button>
              </div>
            </div>
          </section>

          <section className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-blue-200">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">System Status</span>
              </div>
              <h4 className="text-xl font-display font-bold">Everafter v1.0</h4>
              <p className="text-xs text-blue-100 leading-relaxed opacity-80">
                Semua data Anda disimpan secara lokal di browser ini. Pastikan untuk melakukan backup secara berkala.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          </section>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
