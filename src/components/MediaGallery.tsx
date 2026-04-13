/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Trash2, ExternalLink, Copy, Check, Folder, ChevronRight, User, Layers } from 'lucide-react';
import CloudinaryUpload from './CloudinaryUpload';
import { storage } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import type { Customer } from '../types';

export interface GalleryAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  publicId: string;
  createdAt: number;
  customerId?: string; // Link to customer/project
}

interface MediaGalleryProps {
  customers: Customer[];
}

export default function MediaGallery({ customers }: MediaGalleryProps) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | 'all'>('all');
  const [uploadToCustomerId, setUploadToCustomerId] = useState<string>('');

  useEffect(() => {
    setAssets(storage.get('gallery_assets', []));
  }, []);

  const handleUploadSuccess = (newAsset: { type: 'image' | 'video'; url: string; publicId: string }) => {
    const asset: GalleryAsset = {
      ...newAsset,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      customerId: uploadToCustomerId || undefined
    };
    setAssets(prev => {
      const updated = [asset, ...prev];
      storage.set('gallery_assets', updated);
      return updated;
    });
  };

  const handleDelete = (id: string) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    storage.set('gallery_assets', updated);
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter(a => selectedCustomerId === 'all' || a.customerId === selectedCustomerId);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-navy dark:text-dark-text">Galeri Media</h2>
          <p className="text-gray-500 dark:text-dark-muted">Kelola aset foto dan video prewedding klien Anda.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
          <button 
            onClick={() => setSelectedCustomerId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${selectedCustomerId === 'all' ? 'bg-navy dark:bg-blue-600 text-white shadow-lg' : 'text-dark-muted hover:text-dark-text'}`}
          >
            Semua Aset
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-dark-border mx-1" />
          <select 
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-transparent text-xs font-bold text-navy dark:text-dark-text outline-none px-2 cursor-pointer"
          >
            <option value="all" className="dark:bg-dark-card">Filter Klien...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id} className="dark:bg-dark-card">{c.groomName} & {c.brideName}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Folders/Clients */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-100 dark:border-dark-border shadow-sm">
            <h3 className="text-sm font-bold text-navy dark:text-dark-text mb-4 flex items-center gap-2">
              <Folder size={16} className="text-blue-500" /> Folder Klien
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedCustomerId('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${selectedCustomerId === 'all' ? 'bg-blue-500/10 text-blue-500 font-bold' : 'text-dark-muted hover:bg-dark-bg'}`}
              >
                <span className="flex items-center gap-2"><Layers size={14} /> Semua File</span>
                <span className="bg-dark-bg px-2 py-0.5 rounded-full text-[10px]">{assets.length}</span>
              </button>
              {customers.map(customer => {
                const count = assets.filter(a => a.customerId === customer.id).length;
                return (
                  <button 
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${selectedCustomerId === customer.id ? 'bg-blue-500/10 text-blue-500 font-bold' : 'text-dark-muted hover:bg-dark-bg'}`}
                  >
                    <span className="flex items-center gap-2 truncate"><User size={14} /> {customer.groomNickname || customer.groomName.split(' ')[0]} & {customer.brideNickname || customer.brideName.split(' ')[0]}</span>
                    <span className="bg-dark-bg px-2 py-0.5 rounded-full text-[10px]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-100 dark:border-dark-border shadow-sm">
            <h3 className="text-sm font-bold text-navy dark:text-dark-text mb-4">Unggah ke Folder</h3>
            <div className="space-y-4">
              <select 
                value={uploadToCustomerId}
                onChange={(e) => setUploadToCustomerId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg rounded-xl text-xs outline-none border border-transparent focus:border-blue-500/30 text-navy dark:text-dark-text"
              >
                <option value="">Pilih Klien/Proyek...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.groomName} & {c.brideName}</option>
                ))}
              </select>
              <CloudinaryUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden group shadow-sm"
                >
                  <div className="aspect-video relative bg-dark-bg overflow-hidden">
                    {asset.type === 'image' ? (
                      <img src={asset.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-600/10">
                        <Video size={32} className="text-blue-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={() => copyToClipboard(asset.url, asset.id)}
                        className="p-2 bg-white text-navy rounded-lg hover:bg-gray-100 transition-colors"
                        title="Salin URL CDN"
                      >
                        {copiedId === asset.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                      <a 
                        href={asset.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white text-navy rounded-lg hover:bg-gray-100 transition-colors"
                        title="Buka File Asli"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {asset.type === 'image' ? <ImageIcon size={14} className="text-blue-500" /> : <Video size={14} className="text-blue-500" />}
                        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest truncate max-w-[100px]">
                          {asset.publicId}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {asset.customerId && (
                      <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-bold bg-blue-500/5 px-2 py-1 rounded-lg">
                        <User size={10} />
                        {customers.find(c => c.id === asset.customerId)?.groomName.split(' ')[0]} & {customers.find(c => c.id === asset.customerId)?.brideName.split(' ')[0]}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAssets.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 dark:border-dark-border rounded-3xl">
                <ImageIcon size={48} className="mx-auto text-gray-200 dark:text-dark-bg mb-4" />
                <p className="text-gray-400 dark:text-dark-muted">
                  {selectedCustomerId === 'all' ? 'Belum ada aset media.' : 'Folder ini masih kosong.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
