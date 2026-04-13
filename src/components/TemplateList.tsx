/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Eye, Layers, Monitor, Printer, X, User, Sparkles, ChevronRight, Check } from 'lucide-react';
import type { Template, InvitationMode, Customer } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ModernElegant from './templates/ModernElegant';

const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Classic Elegance',
    mode: 'print',
    category: 'elegant',
    thumbnail: 'https://picsum.photos/seed/wedding1/400/600',
    config: { pages: 2, orientation: 'portrait' }
  },
  {
    id: 't2',
    name: 'Modern Minimal',
    mode: 'digital',
    category: 'minimalist',
    thumbnail: 'https://picsum.photos/seed/wedding2/400/600',
    config: { sections: ['cover', 'story', 'event', 'rsvp'] }
  },
  {
    id: 't3',
    name: 'Floral Garden',
    mode: 'print',
    category: 'floral',
    thumbnail: 'https://picsum.photos/seed/wedding3/400/600',
    config: { pages: 1, orientation: 'landscape' }
  },
  {
    id: 't4',
    name: 'Navy Gold',
    mode: 'digital',
    category: 'modern',
    thumbnail: 'https://picsum.photos/seed/wedding4/400/600',
    config: { sections: ['cover', 'event', 'gallery', 'wishes'] }
  },
  {
    id: 't5',
    name: 'Modern Elegant',
    mode: 'digital',
    category: 'elegant',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop',
    config: { sections: ['cover', 'quote', 'couple', 'event', 'rsvp', 'gift'] }
  },
];

interface TemplateListProps {
  customers: Customer[];
  initialCustomer?: Customer | null;
  onSelectTemplate: (template: Template, customer?: Customer) => void;
}

export default function TemplateList({ customers, initialCustomer, onSelectTemplate }: TemplateListProps) {
  const [filter, setFilter] = useState<InvitationMode | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(initialCustomer || null);

  const filtered = MOCK_TEMPLATES.filter(t => filter === 'all' || t.mode === filter);

  const sampleData = {
    groomName: 'Raden Mas Bagus',
    brideName: 'Siti Aminah',
    eventDate: '2026-12-25',
    locationName: 'Gedung Agung Yogyakarta',
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-navy dark:text-dark-text">Template Manager</h2>
          <p className="text-gray-500 dark:text-dark-muted">Pilih dari koleksi template desain profesional kami.</p>
        </div>
        <div className="flex bg-white dark:bg-dark-card p-1 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm transition-colors duration-300">
          {[
            { id: 'all', label: 'Semua', icon: Layers },
            { id: 'print', label: 'Cetak', icon: Printer },
            { id: 'digital', label: 'Digital', icon: Monitor },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === item.id 
                  ? "bg-navy dark:bg-blue-600 text-white" 
                  : "text-gray-500 dark:text-dark-muted hover:text-navy dark:hover:text-dark-text"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((template) => (
          <div 
            key={template.id} 
            onClick={() => setSelectedTemplate(template)}
            className="group bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="aspect-[2/3] relative overflow-hidden bg-gray-100 dark:bg-dark-bg">
              <img 
                src={template.thumbnail} 
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-navy/40 dark:bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <div className="bg-white dark:bg-dark-card text-navy dark:text-dark-text p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                  <Eye size={20} />
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                  template.mode === 'print' ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                )}>
                  {template.mode === 'print' ? 'Cetak' : 'Digital'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-display font-bold text-navy dark:text-dark-text">{template.name}</h4>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-1 capitalize">{template.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-dark-card w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Preview Area */}
              <div className="flex-1 bg-gray-100 dark:bg-dark-bg relative overflow-hidden flex items-center justify-center p-8">
                <button 
                  onClick={() => setSelectedTemplate(null)}
                  className="absolute top-6 right-6 p-2 bg-white dark:bg-dark-card text-navy dark:text-dark-text rounded-full shadow-lg z-10 hover:scale-110 transition-transform"
                >
                  <X size={20} />
                </button>

                <div className="w-full max-w-sm aspect-[9/16] bg-white dark:bg-dark-card rounded-[32px] shadow-2xl overflow-hidden relative border-8 border-navy/5 dark:border-blue-600/10">
                  {selectedTemplate.id === 't5' ? (
                    <ModernElegant 
                      customer={previewCustomer || {
                        ...sampleData,
                        id: 'sample',
                        groomParents: 'Bpk. & Ibu Groom',
                        brideParents: 'Bpk. & Ibu Bride',
                        matrimonyTime: '08:00',
                        locationAddress: 'Alamat Contoh',
                        phoneNumber: '08123456789',
                        createdAt: Date.now()
                      } as Customer}
                      projectData={{}}
                      isPreview={true}
                    />
                  ) : (
                    <>
                      <img 
                        src={selectedTemplate.thumbnail} 
                        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-16 h-px bg-navy dark:bg-blue-600" />
                        <h3 className="font-display text-2xl font-bold text-navy dark:text-dark-text leading-tight">
                          {previewCustomer ? previewCustomer.groomName : sampleData.groomName} <br/>
                          <span className="text-sm font-normal italic">&</span> <br/>
                          {previewCustomer ? previewCustomer.brideName : sampleData.brideName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em]">
                          {previewCustomer ? previewCustomer.eventDate : sampleData.eventDate}
                        </p>
                        <div className="pt-4">
                          <p className="text-[10px] text-gray-400 dark:text-dark-muted italic">
                            {previewCustomer ? previewCustomer.locationName : sampleData.locationName}
                          </p>
                        </div>
                        <div className="w-16 h-px bg-navy dark:bg-blue-600" />
                      </div>
                    </>
                  )}
                  
                  {/* Mode Badge */}
                  <div className="absolute top-4 right-4 bg-navy dark:bg-blue-600 text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest z-20">
                    Preview {selectedTemplate.mode}
                  </div>
                </div>
              </div>

              {/* Control Sidebar */}
              <div className="w-full md:w-80 border-l border-gray-100 dark:border-dark-border p-8 flex flex-col justify-between">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-display font-bold text-navy dark:text-dark-text">{selectedTemplate.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Sesuaikan preview dengan data klien Tuan.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Pilih Data Klien
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                      <button 
                        onClick={() => setPreviewCustomer(null)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all border",
                          !previewCustomer 
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-500 font-bold" 
                            : "bg-gray-50 dark:bg-dark-bg border-transparent text-dark-muted hover:border-dark-border"
                        )}
                      >
                        <span>Gunakan Data Contoh</span>
                        {!previewCustomer && <Sparkles size={12} />}
                      </button>
                      {customers.map(c => (
                        <button 
                          key={c.id}
                          onClick={() => setPreviewCustomer(c)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all border",
                            previewCustomer?.id === c.id 
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-500 font-bold" 
                              : "bg-gray-50 dark:bg-dark-bg border-transparent text-dark-muted hover:border-dark-border"
                          )}
                        >
                          <span className="truncate">{c.groomName} & {c.brideName}</span>
                          {previewCustomer?.id === c.id && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-8">
                  <button 
                    onClick={() => onSelectTemplate(selectedTemplate, previewCustomer || undefined)}
                    className="w-full py-4 bg-navy dark:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-navy/20 dark:shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Gunakan Template Ini <ChevronRight size={18} />
                  </button>
                  <button 
                    onClick={() => setSelectedTemplate(null)}
                    className="w-full py-4 bg-gray-50 dark:bg-dark-bg text-dark-muted rounded-2xl font-bold text-sm hover:text-dark-text transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
