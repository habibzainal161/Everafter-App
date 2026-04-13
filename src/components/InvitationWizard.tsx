/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  User, 
  Monitor, 
  Printer, 
  Layers, 
  Sparkles,
  Image as ImageIcon,
  Eye,
  Download,
  Save,
  X,
  Type,
  Layout,
  Trash2,
  Edit2,
  Plus,
  Minus,
  Video,
  RotateCcw,
  MousePointer2,
  Move,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, storage } from '../lib/utils';
import type { Customer, Project, Template, InvitationMode } from '../types';
import { GoogleGenAI } from '@google/genai';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import CloudinaryUpload from './CloudinaryUpload';
import { GalleryAsset } from './MediaGallery';
import { APP_LOGO, APP_NAME } from '../constants';
import ModernElegant from './templates/ModernElegant';

interface WizardProps {
  initialProject: Project | null;
  customers: Customer[];
  onSave: (project: Project) => void;
  onCancel: () => void;
}

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

export default function InvitationWizard({ initialProject, customers, onSave, onCancel }: WizardProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [mode, setMode] = useState<InvitationMode>('digital');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(MOCK_TEMPLATES[4]); // Default to Modern Elegant
  const [previewKey, setPreviewKey] = useState(0);
  const [projectData, setProjectData] = useState<Project['data']>({
    customText: '',
    sections: [],
    photos: [],
    notes: '',
    guestList: [],
    preweddingAssets: [],
    assetPosition: 'center',
    assetScale: 1,
    assetOffsetY: 0,
    assetOffsetX: 0,
    titleFontSize: 36,
    bodyFontSize: 11
  });
  const [newGuest, setNewGuest] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [galleryAssets, setGalleryAssets] = useState<GalleryAsset[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [galleryPickerTarget, setGalleryPickerTarget] = useState<'coverPhoto' | 'openingPhoto' | 'quotePhoto' | 'parallaxTopPhoto' | 'parallaxBottomPhoto' | 'groomPhoto' | 'bridePhoto' | 'videoThumbnail' | 'preweddingAssets' | null>(null);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Keyboard controls for moving elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeElementId) return;
      
      // Don't move if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;
      let dRotation = 0;
      let dScale = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === '[') dRotation = -step;
      else if (e.key === ']') dRotation = step;
      else if (e.key === '=' || e.key === '+') dScale = 0.05;
      else if (e.key === '-' || e.key === '_') dScale = -0.05;
      else return;

      e.preventDefault();

      setProjectData(prev => ({
        ...prev,
        elementStyles: {
          ...prev.elementStyles,
          [activeElementId]: {
            ...(prev.elementStyles?.[activeElementId] || { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 }),
            x: (prev.elementStyles?.[activeElementId]?.x || 0) + dx,
            y: (prev.elementStyles?.[activeElementId]?.y || 0) + dy,
            rotation: (prev.elementStyles?.[activeElementId]?.rotation || 0) + dRotation,
            scale: Math.max(0.1, (prev.elementStyles?.[activeElementId]?.scale || 1) + dScale),
          }
        }
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElementId]);

  const sampleData = {
    groomName: 'Raden Mas Bagus',
    brideName: 'Siti Aminah',
    eventDate: '2026-12-25',
    locationName: 'Gedung Agung Yogyakarta',
    locationAddress: 'Jl. Malioboro No. 1, Yogyakarta',
    matrimonyTime: '09:00',
    receptionTime: '11:00',
    openingMessage: 'Dengan memohon rahmat Allah SWT...',
    quote: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...',
    prayer: 'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
  };

  useEffect(() => {
    setGalleryAssets(storage.get('gallery_assets', []));
  }, []);

  useEffect(() => {
    if (initialProject) {
      const customer = customers.find(c => c.id === initialProject.customerId);
      const template = MOCK_TEMPLATES.find(t => t.id === initialProject.templateId);
      if (customer) setSelectedCustomer(customer);
      if (template) setSelectedTemplate(template);
      setMode(initialProject.mode);
      setProjectData(prev => ({
        ...prev,
        ...(initialProject.data || {})
      }));
    }
  }, [initialProject, customers]);

  useEffect(() => {
    if (selectedCustomer) {
      const customerAssets = galleryAssets.filter(a => a.customerId === selectedCustomer.id);
      setProjectData(prev => ({
        ...prev,
        openingMessage: selectedCustomer.openingMessage || prev.openingMessage || '',
        quote: selectedCustomer.quote || prev.quote || '',
        prayer: selectedCustomer.prayer || prev.prayer || '',
        preweddingAssets: prev.preweddingAssets?.length ? prev.preweddingAssets : customerAssets,
      }));
    }
  }, [selectedCustomer, galleryAssets]);

  const addGuest = () => {
    if (!newGuest.trim()) return;
    setProjectData(prev => ({
      ...prev,
      guestList: [...(prev.guestList || []), newGuest.trim()]
    }));
    setNewGuest('');
  };

  const removeGuest = (index: number) => {
    setProjectData(prev => ({
      ...prev,
      guestList: prev.guestList?.filter((_, i) => i !== index)
    }));
  };

  const generateAIText = async (style: 'formal' | 'casual') => {
    const target = selectedCustomer || sampleData;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `Buatkan teks undangan pernikahan ${style} dalam Bahasa Indonesia untuk pasangan ${target.groomName} dan ${target.brideName}. 
      Sertakan kata-kata pembuka, detail acara pada ${target.eventDate} di ${target.locationName}, dan penutup. 
      Format dalam beberapa paragraf rapi.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text || '';
      setProjectData(prev => ({ ...prev, customText: text }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: selectedTemplate?.config.orientation || 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Undangan-${selectedCustomer?.groomName || 'Sample'}.pdf`);
  };

  const handleAssetSelect = (asset: GalleryAsset) => {
    if (!galleryPickerTarget) return;

    setProjectData(prev => {
      if (galleryPickerTarget === 'preweddingAssets') {
        const exists = prev.preweddingAssets?.find(a => a.id === asset.id);
        if (exists) {
          return {
            ...prev,
            preweddingAssets: prev.preweddingAssets?.filter(a => a.id !== asset.id)
          };
        } else {
          return {
            ...prev,
            preweddingAssets: [...(prev.preweddingAssets || []), asset]
          };
        }
      } else {
        // Single selection for coverPhoto, groomPhoto, bridePhoto
        return {
          ...prev,
          [galleryPickerTarget]: asset
        };
      }
    });
    
    if (galleryPickerTarget !== 'preweddingAssets') {
      setGalleryPickerTarget(null); // Close modal after single select
    }
  };

  const handleFinalSave = () => {
    if (!selectedCustomer || !selectedTemplate) {
      alert("Pilih customer dan template terlebih dahulu, Tuan.");
      return;
    }
    
    const project: Project = {
      id: initialProject?.id || crypto.randomUUID(),
      customerId: selectedCustomer.id,
      templateId: selectedTemplate.id,
      mode: mode,
      status: 'completed',
      data: projectData,
      createdAt: initialProject?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSave(project);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (projectData.assetOffsetX || 0),
      y: e.clientY - (projectData.assetOffsetY || 0)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setProjectData(prev => ({
      ...prev,
      assetOffsetX: e.clientX - dragStart.x,
      assetOffsetY: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) setIsDragging(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
      {/* Header */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white dark:bg-dark-card rounded-xl p-2 shadow-sm border border-gray-100 dark:border-dark-border flex items-center justify-center">
            <img src={APP_LOGO} alt={APP_NAME} className="w-full h-auto" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-navy dark:text-dark-text">Editor Undangan</h2>
            <p className="text-xs text-gray-500 dark:text-dark-muted">
              {selectedCustomer ? `Mengedit undangan untuk ${selectedCustomer.groomName} & ${selectedCustomer.brideName}` : 'Gunakan data contoh untuk melihat preview desain.'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setPreviewKey(prev => prev + 1)} 
          className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2 text-sm font-medium"
          title="Muat ulang preview"
        >
          <RotateCcw size={20} />
          <span className="hidden sm:inline">Refresh Preview</span>
        </button>
      </header>

      <div className="flex-1 min-h-0 flex gap-8">
        {/* Editor Sidebar (Scrolls internally) */}
        <div className="w-[450px] h-full shrink-0 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col overflow-hidden transition-colors duration-300">
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            
            {/* 1. Data & Template Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <Layout size={14} /> 1. Data & Template
              </label>
              
              <div className="space-y-3">
                {/* Customer Select */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-dark-muted uppercase">Pilih Data Klien</span>
                    <span className="text-[8px] text-gray-400 italic">Data nama & lokasi</span>
                  </div>
                  <select 
                    value={selectedCustomer?.id || ''}
                    onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-bg rounded-xl text-xs outline-none border border-transparent focus:border-blue-500/30 text-navy dark:text-dark-text"
                  >
                    <option value="">-- Gunakan Data Contoh --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.groomName} & {c.brideName}</option>
                    ))}
                  </select>
                </div>

                {/* Mode Toggle */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-dark-muted uppercase">Jenis Undangan</span>
                  <div className="flex bg-gray-50 dark:bg-dark-bg p-1 rounded-xl border border-dark-border">
                    {[
                      { id: 'digital', label: 'Digital', icon: Monitor },
                      { id: 'print', label: 'Cetak', icon: Printer },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id as any)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                          mode === m.id 
                            ? "bg-navy dark:bg-blue-600 text-white shadow-lg" 
                            : "text-dark-muted hover:text-dark-text"
                        )}
                      >
                        <m.icon size={12} /> {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-dark-muted uppercase">Pilih Desain</span>
                  <button 
                    onClick={() => setShowTemplatePicker(true)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-dark-bg rounded-xl text-xs text-navy dark:text-dark-text border border-transparent hover:border-blue-500/30 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Layers size={14} className="text-blue-500" />
                      {selectedTemplate?.name || 'Pilih Template'}
                    </span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Media Assets Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={14} /> 2. Foto & Latar Belakang
                </label>
              </div>
              
              <p className="text-[9px] text-gray-500 leading-relaxed">
                Tentukan foto spesifik untuk setiap bagian undangan. Anda dapat memilih foto dari galeri klien.
              </p>

              <div className="space-y-6">
                {/* Background Photos Group */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-navy uppercase tracking-widest border-b border-gray-100 pb-2">A. Latar Belakang (Background)</h4>
                  
                  {[
                    { id: 'coverPhoto', label: 'Cover Screen', desc: 'Layar pertama sebelum dibuka' },
                    { id: 'openingPhoto', label: 'Opening Section', desc: 'Latar halaman utama' },
                    { id: 'quotePhoto', label: 'Quote Section', desc: 'Latar kutipan/doa' },
                    { id: 'parallaxTopPhoto', label: 'Parallax Atas', desc: 'Latar profil (bagian atas)' },
                    { id: 'parallaxBottomPhoto', label: 'Parallax Bawah', desc: 'Latar profil (bagian bawah)' },
                    { id: 'journeyPhoto', label: 'Journey Section', desc: 'Latar halaman cerita cinta' },
                  ].map(slot => (
                    <div key={slot.id} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-dark-card overflow-hidden">
                          {(projectData as any)[slot.id] ? (
                            <img src={(projectData as any)[slot.id].url} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={14} className="m-auto mt-2 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-navy dark:text-dark-text">{slot.label}</p>
                          <p className="text-[8px] text-gray-500">{slot.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setGalleryPickerTarget(slot.id as any)}
                        className="px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-[9px] font-bold text-navy dark:text-dark-text hover:border-blue-500 transition-colors"
                      >
                        {(projectData as any)[slot.id] ? 'Ganti' : 'Pilih'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Content Photos Group */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-navy uppercase tracking-widest border-b border-gray-100 pb-2">B. Foto Konten & Galeri</h4>
                  
                  {[
                    { id: 'groomPhoto', label: 'Mempelai Pria', desc: 'Bingkai profil pria' },
                    { id: 'bridePhoto', label: 'Mempelai Wanita', desc: 'Bingkai profil wanita' },
                    { id: 'videoThumbnail', label: 'Video Thumbnail', desc: 'Cover video prewedding' },
                  ].map(slot => (
                    <div key={slot.id} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-card overflow-hidden">
                          {(projectData as any)[slot.id] ? (
                            <img src={(projectData as any)[slot.id].url} className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} className="m-auto mt-2 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-navy dark:text-dark-text">{slot.label}</p>
                          <p className="text-[8px] text-gray-500">{slot.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setGalleryPickerTarget(slot.id as any)}
                        className="px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-[9px] font-bold text-navy dark:text-dark-text hover:border-blue-500 transition-colors"
                      >
                        {(projectData as any)[slot.id] ? 'Ganti' : 'Pilih'}
                      </button>
                    </div>
                  ))}

                  {/* Gallery Photos */}
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-dark-card overflow-hidden flex items-center justify-center">
                        <Layers size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-navy dark:text-dark-text">Our Gallery (Staircase)</p>
                        <p className="text-[8px] text-gray-500">{projectData.preweddingAssets?.length || 0} foto terpilih (Min. 3)</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setGalleryPickerTarget('preweddingAssets')}
                      className="px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-[9px] font-bold text-navy dark:text-dark-text hover:border-blue-500 transition-colors"
                    >
                      Pilih Foto
                    </button>
                  </div>
                </div>
              </div>

              {projectData.coverPhoto && (
                <div className="space-y-4 p-4 bg-dark-bg/50 rounded-2xl border border-dark-border mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Sesuaikan Latar (Drag & Drop)</label>
                    <button 
                      onClick={() => setProjectData({...projectData, assetScale: 1, assetOffsetY: 0, assetOffsetX: 0})}
                      className="flex items-center gap-1 text-[9px] text-blue-500 font-bold hover:underline"
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                  </div>
                  
                  <div className="flex justify-center">
                    <div 
                      className="w-32 aspect-[9/16] bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden relative cursor-move border border-blue-500/30 shadow-inner"
                      onMouseDown={(e) => {
                        const startX = e.clientX - (projectData.assetOffsetX || 0);
                        const startY = e.clientY - (projectData.assetOffsetY || 0);
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          setProjectData(prev => ({
                            ...prev,
                            assetOffsetX: moveEvent.clientX - startX,
                            assetOffsetY: moveEvent.clientY - startY
                          }));
                        };
                        
                        const handleMouseUp = () => {
                          window.removeEventListener('mousemove', handleMouseMove);
                          window.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                      }}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        const startX = touch.clientX - (projectData.assetOffsetX || 0);
                        const startY = touch.clientY - (projectData.assetOffsetY || 0);
                        
                        const handleTouchMove = (moveEvent: TouchEvent) => {
                          const touchMove = moveEvent.touches[0];
                          setProjectData(prev => ({
                            ...prev,
                            assetOffsetX: touchMove.clientX - startX,
                            assetOffsetY: touchMove.clientY - startY
                          }));
                        };
                        
                        const handleTouchEnd = () => {
                          window.removeEventListener('touchmove', handleTouchMove);
                          window.removeEventListener('touchend', handleTouchEnd);
                        };
                        
                        window.addEventListener('touchmove', handleTouchMove);
                        window.addEventListener('touchend', handleTouchEnd);
                      }}
                    >
                      <img 
                        src={projectData.coverPhoto.url} 
                        alt="Preview" 
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                          transform: `scale(${projectData.assetScale || 1}) translate(${projectData.assetOffsetX || 0}px, ${projectData.assetOffsetY || 0}px)`
                        }}
                      />
                      <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1 mt-4">
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>Ukuran (Zoom)</span>
                      <span>{Math.round((projectData.assetScale || 1) * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="3" step="0.05" 
                      value={projectData.assetScale || 1}
                      onChange={(e) => setProjectData({...projectData, assetScale: parseFloat(e.target.value)})}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <p className="text-[8px] text-gray-400 text-center italic">Tarik/geser foto di dalam kotak 9:16 untuk mengepaskan posisi latar belakang.</p>
                </div>
              )}
            </div>

            {/* 3. Text Editor Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <Type size={14} /> 3. Editor Teks & Posisi
              </label>

              <div className="space-y-4 p-4 bg-dark-bg/50 rounded-2xl border border-dark-border">
                {activeElementId ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Elemen Terpilih: <span className="text-blue-400">{activeElementId}</span></span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setProjectData(prev => {
                              const newStyles = { ...prev.elementStyles };
                              delete newStyles[activeElementId];
                              return { ...prev, elementStyles: newStyles };
                            });
                          }}
                          className="text-[9px] text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <RotateCcw size={10} /> Reset
                        </button>
                        <button 
                          onClick={() => setActiveElementId(null)}
                          className="text-[9px] text-gray-400 hover:text-white"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Posisi X */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Posisi X (Horizontal)</label>
                          <div className="flex items-center gap-1 bg-white dark:bg-dark-bg px-2 py-1 rounded-lg border border-gray-200 dark:border-dark-border">
                            <input 
                              type="number"
                              value={projectData.elementStyles?.[activeElementId]?.x || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setProjectData(prev => ({
                                  ...prev,
                                  elementStyles: {
                                    ...prev.elementStyles,
                                    [activeElementId]: {
                                      ...(prev.elementStyles?.[activeElementId] || {}),
                                      x: val
                                    }
                                  }
                                }));
                              }}
                              className="w-12 bg-transparent text-[10px] text-blue-500 font-mono font-bold outline-none text-center"
                            />
                            <span className="text-[8px] text-gray-400 font-bold pr-1">px</span>
                          </div>
                        </div>
                        <input 
                          type="range" min="-400" max="400" step="1"
                          value={projectData.elementStyles?.[activeElementId]?.x || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setProjectData(prev => ({
                              ...prev,
                              elementStyles: {
                                ...prev.elementStyles,
                                [activeElementId]: {
                                  ...(prev.elementStyles?.[activeElementId] || {}),
                                  x: val
                                }
                              }
                            }));
                          }}
                          className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-dark-bg rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Posisi Y */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Posisi Y (Vertikal)</label>
                          <div className="flex items-center gap-1 bg-white dark:bg-dark-bg px-2 py-1 rounded-lg border border-gray-200 dark:border-dark-border">
                            <input 
                              type="number"
                              value={projectData.elementStyles?.[activeElementId]?.y || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setProjectData(prev => ({
                                  ...prev,
                                  elementStyles: {
                                    ...prev.elementStyles,
                                    [activeElementId]: {
                                      ...(prev.elementStyles?.[activeElementId] || {}),
                                      y: val
                                    }
                                  }
                                }));
                              }}
                              className="w-12 bg-transparent text-[10px] text-blue-500 font-mono font-bold outline-none text-center"
                            />
                            <span className="text-[8px] text-gray-400 font-bold pr-1">px</span>
                          </div>
                        </div>
                        <input 
                          type="range" min="-800" max="800" step="1"
                          value={projectData.elementStyles?.[activeElementId]?.y || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setProjectData(prev => ({
                              ...prev,
                              elementStyles: {
                                ...prev.elementStyles,
                                [activeElementId]: {
                                  ...(prev.elementStyles?.[activeElementId] || {}),
                                  y: val
                                }
                              }
                            }));
                          }}
                          className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-dark-bg rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Skala */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Skala (Ukuran)</label>
                          <span className="text-[10px] font-mono font-bold text-blue-500">
                            {Math.round((projectData.elementStyles?.[activeElementId]?.scale || 1) * 100)}%
                          </span>
                        </div>
                        <input 
                          type="range" min="0.1" max="3" step="0.05"
                          value={projectData.elementStyles?.[activeElementId]?.scale || 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 1;
                            setProjectData(prev => ({
                              ...prev,
                              elementStyles: {
                                ...prev.elementStyles,
                                [activeElementId]: {
                                  ...(prev.elementStyles?.[activeElementId] || {}),
                                  scale: val
                                }
                              }
                            }));
                          }}
                          className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-dark-bg rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Rotasi */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Rotasi (Derajat)</label>
                          <span className="text-[10px] font-mono font-bold text-blue-500">
                            {projectData.elementStyles?.[activeElementId]?.rotation || 0}°
                          </span>
                        </div>
                        <input 
                          type="range" min="-180" max="180" step="1"
                          value={projectData.elementStyles?.[activeElementId]?.rotation || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setProjectData(prev => ({
                              ...prev,
                              elementStyles: {
                                ...prev.elementStyles,
                                [activeElementId]: {
                                  ...(prev.elementStyles?.[activeElementId] || {}),
                                  rotation: val
                                }
                              }
                            }));
                          }}
                          className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-dark-bg rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Opasitas */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Opasitas (Transparansi)</label>
                          <span className="text-[10px] font-mono font-bold text-blue-500">
                            {Math.round((projectData.elementStyles?.[activeElementId]?.opacity ?? 1) * 100)}%
                          </span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.05"
                          value={projectData.elementStyles?.[activeElementId]?.opacity ?? 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setProjectData(prev => ({
                              ...prev,
                              elementStyles: {
                                ...prev.elementStyles,
                                [activeElementId]: {
                                  ...(prev.elementStyles?.[activeElementId] || {}),
                                  opacity: val
                                }
                              }
                            }));
                          }}
                          className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-dark-bg rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500 italic">
                    Klik elemen teks di dalam preview untuk mengedit posisi dan ukurannya.
                  </div>
                )}

                <div className="w-full h-px bg-dark-border my-4" />

                {/* Title Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Ukuran Nama Panggilan (Global)</label>
                    <div className="flex items-center gap-1 bg-white dark:bg-dark-bg px-2 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border shadow-inner focus-within:border-blue-500/50 transition-all">
                      <input 
                        type="number"
                        step="0.1"
                        value={projectData.titleFontSize || 36}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setProjectData({...projectData, titleFontSize: isNaN(val) ? 0 : val});
                        }}
                        className="w-14 bg-transparent text-xs text-blue-600 dark:text-blue-400 font-mono font-bold outline-none text-center"
                      />
                      <span className="text-[9px] text-gray-400 font-bold pr-1">px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setProjectData(prev => ({ ...prev, titleFontSize: Math.max(12, (prev.titleFontSize || 36) - 2) }))}
                      className="p-1.5 bg-gray-100 dark:bg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <input 
                      type="range" min="12" max="120" step="1"
                      value={projectData.titleFontSize || 36}
                      onChange={(e) => setProjectData({...projectData, titleFontSize: parseInt(e.target.value)})}
                      className="flex-1 h-1 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <button 
                      onClick={() => setProjectData(prev => ({ ...prev, titleFontSize: Math.min(120, (prev.titleFontSize || 36) + 2) }))}
                      className="p-1.5 bg-gray-100 dark:bg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Body Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Ukuran Teks Pesan</label>
                    <div className="flex items-center gap-1 bg-white dark:bg-dark-bg px-2 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border shadow-inner focus-within:border-blue-500/50 transition-all">
                      <input 
                        type="number"
                        step="0.1"
                        value={projectData.bodyFontSize || 11}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setProjectData({...projectData, bodyFontSize: isNaN(val) ? 0 : val});
                        }}
                        className="w-14 bg-transparent text-xs text-blue-600 dark:text-blue-400 font-mono font-bold outline-none text-center"
                      />
                      <span className="text-[9px] text-gray-400 font-bold pr-1">px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setProjectData(prev => ({ ...prev, bodyFontSize: Math.max(8, (prev.bodyFontSize || 11) - 1) }))}
                      className="p-1.5 bg-gray-100 dark:bg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <input 
                      type="range" min="8" max="24" step="0.5"
                      value={projectData.bodyFontSize || 11}
                      onChange={(e) => setProjectData({...projectData, bodyFontSize: parseFloat(e.target.value)})}
                      className="flex-1 h-1 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <button 
                      onClick={() => setProjectData(prev => ({ ...prev, bodyFontSize: Math.min(24, (prev.bodyFontSize || 11) + 1) }))}
                      className="p-1.5 bg-gray-100 dark:bg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setProjectData({...projectData, titleFontSize: 36, bodyFontSize: 11})}
                    className="w-full flex items-center justify-center gap-1 text-[9px] text-gray-400 font-bold hover:text-blue-500 transition-colors"
                  >
                    <RotateCcw size={10} /> Reset Ukuran Font
                  </button>
                </div>

                <div className="w-full h-px bg-dark-border my-4" />

                {/* Loop Animations Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-dark-muted uppercase tracking-widest">Animasi Berulang (Loop)</label>
                    <p className="text-[8px] text-gray-500 italic">Membuat teks melayang terus-menerus</p>
                  </div>
                  <button 
                    onClick={() => setProjectData(prev => ({ ...prev, loopAnimations: !prev.loopAnimations }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      projectData.loopAnimations ? "bg-blue-600" : "bg-gray-200 dark:bg-dark-bg"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                      projectData.loopAnimations ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Music Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <Music size={14} /> 4. Musik Latar
              </label>
              <div className="p-4 bg-dark-bg/50 rounded-2xl border border-dark-border space-y-3">
                <p className="text-[9px] text-dark-muted leading-relaxed">
                  Masukkan URL musik (MP3) untuk diputar otomatis saat undangan dibuka.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white dark:bg-dark-bg px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border shadow-inner focus-within:border-blue-500/50 transition-all">
                    <input 
                      type="text"
                      placeholder="https://example.com/music.mp3"
                      value={projectData.musicUrl || ''}
                      onChange={(e) => setProjectData({...projectData, musicUrl: e.target.value})}
                      className="w-full bg-transparent text-xs text-navy dark:text-dark-text outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudinaryUpload 
                    onUploadSuccess={(asset) => setProjectData({...projectData, musicUrl: asset.url})}
                    label="Unggah MP3"
                    className="!space-y-0 flex-1"
                  />
                </div>
              </div>
            </div>

            {/* 5. AI Content Section */}
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Sparkles size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Konten Otomatis</span>
              </div>
              <p className="text-[9px] text-blue-600/70 leading-relaxed">
                Teks, pesan, dan kutipan diambil langsung dari data pelanggan yang Tuan pilih. Template akan menyesuaikan tampilan secara otomatis.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border space-y-3">
            <button 
              onClick={handleFinalSave}
              className="w-full bg-navy dark:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-navy/90 dark:hover:bg-blue-700 transition-all shadow-lg"
            >
              <Save size={18} /> Simpan Proyek
            </button>
            <button 
              onClick={handleExportPDF}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-600 dark:text-dark-muted hover:bg-white dark:hover:bg-dark-card transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Preview Area (Fixed in place) */}
        <div className="flex-1 h-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center p-6 overflow-hidden relative">
          {/* Scale Wrapper */}
          <div 
            className="relative flex items-center justify-center"
            style={{
              transform: mode === 'digital' 
                ? 'scale(min(1, calc((100vw - 550px) / 420), calc((100vh - 180px) / 850)))' 
                : 'scale(min(1, calc((100vw - 550px) / 650), calc((100vh - 180px) / 900)))',
              transformOrigin: 'center center'
            }}
          >
            {/* Phone Hardware Wrapper */}
            <div className={cn(
              "relative shrink-0 transition-all duration-500",
              mode === 'digital' ? "w-[403px] h-[840px] flex items-center justify-center bg-zinc-900 rounded-[3.5rem] shadow-2xl border border-zinc-800/50" : "w-[595px] h-[842px] shadow-2xl"
            )}>
              
              {/* Hardware Buttons */}
              {mode === 'digital' && (
                <>
                  {/* Silent Switch */}
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[30px] bg-zinc-800 rounded-l-md"></div>
                  {/* Vol Up */}
                  <div className="absolute top-[170px] -left-[3px] w-[3px] h-[60px] bg-zinc-800 rounded-l-md"></div>
                  {/* Vol Down */}
                  <div className="absolute top-[250px] -left-[3px] w-[3px] h-[60px] bg-zinc-800 rounded-l-md"></div>
                  {/* Power */}
                  <div className="absolute top-[190px] -right-[3px] w-[3px] h-[90px] bg-zinc-800 rounded-r-md"></div>
                </>
              )}

              {/* The Actual Screen / Preview */}
              <div 
                key={previewKey}
                ref={previewRef}
                className={cn(
                  "relative overflow-hidden bg-black",
                  mode === 'digital' ? "w-[375px] h-[812px] rounded-[2.5rem]" : "w-full h-full bg-white",
                  isDragging && "ring-4 ring-blue-500/50"
                )}
              >
                {/* Premium Phone Overlay (Pointer Events None) */}
                {mode === 'digital' && (
                  <div className="absolute inset-0 z-50 pointer-events-none">
                    {/* Inner Shadow / Bezel Edge */}
                    <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_0_2px_rgba(0,0,0,0.8)]"></div>
                    
                    {/* Dynamic Island */}
                    <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full flex items-center justify-end px-3 shadow-lg">
                      <div className="w-3 h-3 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mr-2"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-900/50"></div>
                    </div>

                    {/* Screen Glare / Reflection */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05]"></div>
                  </div>
                )}

                {/* Content */}
                {selectedTemplate?.id === 't5' ? (
                  <div className="w-full h-full overflow-y-auto scrollbar-hide bg-black relative z-0">
                    <ModernElegant 
                      customer={selectedCustomer || sampleData as any} 
                      projectData={projectData} 
                      isPreview={true}
                      onElementClick={setActiveElementId}
                      onElementMove={(id, x, y) => {
                        setProjectData(prev => ({
                          ...prev,
                          elementStyles: {
                            ...prev.elementStyles,
                            [id]: {
                              ...(prev.elementStyles?.[id] || { x: 0, y: 0, scale: 1 }),
                              x, y
                            }
                          }
                        }));
                      }}
                      activeElementId={activeElementId || undefined}
                    />
                  </div>
                ) : (
              <div className={cn(
                "h-full flex flex-col bg-white",
                selectedTemplate?.category === 'elegant' && "font-serif",
                selectedTemplate?.category === 'minimalist' && "font-sans"
              )}>
                {/* Photo Section with Drag Support */}
                <div 
                  className={cn(
                    "h-1/3 relative overflow-hidden cursor-move group/photo transition-colors",
                    isDragging ? "bg-blue-500/10" : "bg-black/5"
                  )}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                >
                  <img 
                    src={
                      projectData.preweddingAssets && projectData.preweddingAssets.length > 0 
                        ? projectData.preweddingAssets[projectData.preweddingAssets.length - 1].url 
                        : 'https://picsum.photos/seed/wedding-bg/800/600'
                    } 
                    style={{
                      transform: `scale(${projectData.assetScale || 1}) translate(${projectData.assetOffsetX || 0}px, ${projectData.assetOffsetY || 0}px)`,
                    }}
                    className={cn(
                      "w-full h-full object-cover pointer-events-none select-none transition-transform duration-75",
                      projectData.assetPosition === 'top' ? "object-top" : 
                      projectData.assetPosition === 'bottom' ? "object-bottom" : "object-center"
                    )}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  
                  {/* Drag Indicator Overlay */}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity pointer-events-none",
                    isDragging ? "opacity-0" : "group-hover/photo:opacity-100 opacity-0"
                  )}>
                    <div className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                      <Move size={12} /> Klik & Geser Foto
                    </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center pointer-events-none">
                    <p className="font-serif italic text-lg opacity-90">The Wedding of</p>
                    <h1 
                      className="font-display font-bold mt-2 leading-tight"
                      style={{ fontSize: `${projectData.titleFontSize || 36}px` }}
                    >
                      {(selectedCustomer || sampleData).groomNickname || (selectedCustomer || sampleData).groomName.split(' ')[0]} <br /> & <br /> {(selectedCustomer || sampleData).brideNickname || (selectedCustomer || sampleData).brideName.split(' ')[0]}
                    </h1>
                  </div>
                </div>
                
                <div className="flex-1 p-10 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-12 h-px bg-navy/20" />
                  
                  <div className="space-y-4">
                    {(selectedCustomer?.openingMessage || sampleData.openingMessage) && (
                      <div 
                        className="whitespace-pre-wrap text-gray-500 leading-relaxed italic"
                        style={{ fontSize: `${projectData.bodyFontSize || 11}px` }}
                      >
                        {selectedCustomer?.openingMessage || sampleData.openingMessage}
                      </div>
                    )}

                    {(selectedCustomer?.quote || sampleData.quote) && (
                      <div 
                        className="whitespace-pre-wrap text-blue-500 font-medium leading-relaxed px-6"
                        style={{ fontSize: `${(projectData.bodyFontSize || 11) - 1}px` }}
                      >
                        "{selectedCustomer?.quote || sampleData.quote}"
                      </div>
                    )}
                    
                    {(selectedCustomer?.prayer || sampleData.prayer) && (
                      <div 
                        className="whitespace-pre-wrap text-navy font-medium leading-relaxed"
                        style={{ fontSize: `${(projectData.bodyFontSize || 11) + 1}px` }}
                      >
                        {selectedCustomer?.prayer || sampleData.prayer}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40">Save the Date</p>
                      <p className="text-lg font-display font-bold text-navy">{(selectedCustomer || sampleData).eventDate}</p>
                      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-medium">
                        <span>Akad: {(selectedCustomer || sampleData).matrimonyTime}</span>
                        {(selectedCustomer || sampleData).receptionTime && (
                          <>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>Resepsi: {(selectedCustomer || sampleData).receptionTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-navy">{(selectedCustomer || sampleData).locationName}</p>
                      <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                        {(selectedCustomer || sampleData).locationAddress}
                      </p>
                    </div>
                  </div>

                  {mode === 'digital' && (selectedCustomer?.phoneNumber || sampleData.matrimonyTime) && (
                    <div className="pt-4">
                      <button className="bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-full shadow-lg shadow-navy/20 flex items-center gap-2 hover:scale-105 transition-transform">
                        <Check size={12} /> Konfirmasi Kehadiran
                      </button>
                    </div>
                  )}

                  <div className="w-12 h-px bg-navy/20" />
                </div>
              </div>
            )}
            </div>
          </div>
          </div>

          {/* Preview Badge */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 dark:border-dark-border shadow-xl z-50">
            <span className="text-[10px] font-bold text-navy dark:text-dark-text uppercase tracking-widest">
              {mode === 'digital' ? 'Digital Preview' : 'Print Layout'}
            </span>
          </div>
        </div>
      </div>

      {/* Template Picker Modal */}
      <AnimatePresence>
        {showTemplatePicker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-dark-card w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold text-navy dark:text-dark-text">Pilih Template Baru</h3>
                <button onClick={() => setShowTemplatePicker(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto max-h-[60vh] pr-2 scrollbar-hide">
                {MOCK_TEMPLATES.filter(t => t.mode === mode).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => { setSelectedTemplate(template); setShowTemplatePicker(false); }}
                    className={cn(
                      "group rounded-2xl border-2 overflow-hidden transition-all",
                      selectedTemplate?.id === template.id ? "border-blue-500" : "border-transparent hover:border-blue-500/30"
                    )}
                  >
                    <div className="aspect-[2/3] relative">
                      <img src={template.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <Check size={32} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-left bg-gray-50 dark:bg-dark-bg">
                      <p className="text-xs font-bold text-navy dark:text-dark-text truncate">{template.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Gallery Picker Modal */}
      <AnimatePresence>
        {galleryPickerTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-navy dark:text-dark-text">
                    Pilih Foto {galleryPickerTarget === 'preweddingAssets' ? 'Galeri' : 'Slot Spesifik'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {galleryPickerTarget === 'preweddingAssets' ? 'Pilih beberapa foto untuk galeri.' : 'Pilih satu foto untuk bagian ini.'}
                  </p>
                </div>
                <button onClick={() => setGalleryPickerTarget(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {galleryAssets.filter(a => !selectedCustomer || a.customerId === selectedCustomer.id).length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-sm text-gray-400">Belum ada foto di folder klien ini, Tuan.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Unggah foto terlebih dahulu di menu Galeri Media.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {galleryAssets
                      .filter(a => !selectedCustomer || a.customerId === selectedCustomer.id)
                      .map((asset) => {
                        let isSelected = false;
                        if (galleryPickerTarget === 'preweddingAssets') {
                          isSelected = !!projectData.preweddingAssets?.some(a => a.id === asset.id);
                        } else {
                          isSelected = projectData[galleryPickerTarget]?.id === asset.id;
                        }
                        return (
                          <button
                            key={asset.id}
                            onClick={() => handleAssetSelect(asset)}
                            className={cn(
                              "group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                              isSelected ? "border-blue-500" : "border-transparent hover:border-blue-500/50"
                            )}
                          >
                            {asset.type === 'video' ? (
                              <div className="w-full h-full bg-black flex items-center justify-center">
                                <Video size={32} className="text-white/50" />
                              </div>
                            ) : (
                              <img src={asset.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            )}
                            
                            <div className={cn(
                              "absolute inset-0 flex items-center justify-center transition-opacity",
                              isSelected ? "bg-blue-500/20 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100"
                            )}>
                              <Check size={24} className={isSelected ? "text-blue-500" : "text-white"} />
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-dark-border flex justify-end">
                <button 
                  onClick={() => setGalleryPickerTarget(null)}
                  className="px-6 py-2 bg-navy dark:bg-blue-600 text-white rounded-xl font-bold text-sm"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
