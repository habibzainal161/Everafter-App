/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Edit2, Trash2, UserPlus, FilePlus, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Customer } from '../types';
import { cn } from '../lib/utils';

interface CustomerListProps {
  customers: Customer[];
  onUpdate: (customers: Customer[]) => void;
  onCreateInvitation: (customer: Customer) => void;
}

export default function CustomerList({ customers, onUpdate, onCreateInvitation }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});

  const filtered = customers.filter(c => 
    `${c.groomName} ${c.brideName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: crypto.randomUUID(),
      groomName: newCustomer.groomName || '',
      groomNickname: newCustomer.groomNickname || '',
      groomParents: newCustomer.groomParents || '',
      groomInstagram: newCustomer.groomInstagram || '',
      groomAddress: newCustomer.groomAddress || '',
      
      brideName: newCustomer.brideName || '',
      brideNickname: newCustomer.brideNickname || '',
      brideParents: newCustomer.brideParents || '',
      brideInstagram: newCustomer.brideInstagram || '',
      brideAddress: newCustomer.brideAddress || '',
      
      eventDate: newCustomer.eventDate || '',
      matrimonyTime: newCustomer.matrimonyTime || '',
      receptionTime: newCustomer.receptionTime || '',
      locationName: newCustomer.locationName || '',
      locationAddress: newCustomer.locationAddress || '',
      mapsUrl: newCustomer.mapsUrl || '',
      
      openingMessage: newCustomer.openingMessage || '',
      quote: newCustomer.quote || '',
      prayer: newCustomer.prayer || '',
      journeyOfLove: newCustomer.journeyOfLove || '',
      
      bankAccounts: newCustomer.bankAccounts || [],
      rsvpNumber: newCustomer.rsvpNumber || '',
      
      phoneNumber: newCustomer.phoneNumber || '',
      email: newCustomer.email || '',
      createdAt: Date.now(),
    };
    onUpdate([customer, ...customers]);
    setIsAdding(false);
    setNewCustomer({});
  };

  const addBankAccount = () => {
    const bankAccounts = [...(newCustomer.bankAccounts || []), { bankName: '', accountHolder: '', accountNumber: '' }];
    setNewCustomer({ ...newCustomer, bankAccounts });
  };

  const updateBankAccount = (index: number, field: string, value: string) => {
    const bankAccounts = [...(newCustomer.bankAccounts || [])];
    bankAccounts[index] = { ...bankAccounts[index], [field]: value };
    setNewCustomer({ ...newCustomer, bankAccounts });
  };

  const removeBankAccount = (index: number) => {
    const bankAccounts = (newCustomer.bankAccounts || []).filter((_, i) => i !== index);
    setNewCustomer({ ...newCustomer, bankAccounts });
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus data customer ini?')) {
      onUpdate(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-navy dark:text-dark-text">Data Customer</h2>
          <p className="text-gray-500 dark:text-dark-muted">Kelola informasi pelanggan Anda di sini.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-navy dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-navy/90 dark:hover:bg-blue-700 transition-all"
        >
          <UserPlus size={20} /> Tambah Customer
        </button>
      </header>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b border-gray-50 dark:border-dark-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama mempelai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border-none rounded-lg text-sm focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-500/20 outline-none text-navy dark:text-dark-text"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-bg/50 text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">
                <th className="px-6 py-4">Mempelai</th>
                <th className="px-6 py-4">Tanggal Acara</th>
                <th className="px-6 py-4">Lokasi</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy dark:text-dark-text">{customer.groomName} & {customer.brideName}</div>
                    <div className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">ID: {customer.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-muted">
                    {customer.eventDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-muted max-w-xs truncate">
                    {customer.locationName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-muted">
                    {customer.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onCreateInvitation(customer)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                      >
                        <FilePlus size={14} /> Buat Undangan
                      </button>
                      <button className="p-2 text-gray-400 hover:text-navy dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-card rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-dark-muted">
                    Belum ada data customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-navy/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden transition-colors duration-300"
          >
            <form onSubmit={handleAdd}>
              <div className="p-8 border-b border-gray-100 dark:border-dark-border">
                <h3 className="text-2xl font-display font-bold text-navy dark:text-dark-text">Tambah Customer Baru</h3>
                <p className="text-gray-500 dark:text-dark-muted">Lengkapi data mempelai dan acara secara detail.</p>
              </div>
              
              <div className="p-8 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                {/* Groom Info */}
                <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl border border-gray-100 dark:border-dark-border">
                  <h4 className="col-span-2 text-sm font-bold text-navy dark:text-dark-text uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-blue-500 rounded-full" /> Data Mempelai Pria
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Lengkap</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, groomName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Panggilan</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, groomNickname: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Orang Tua</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Putra dari Bapak... & Ibu..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, groomParents: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Instagram (@username)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, groomInstagram: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Asal</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, groomAddress: e.target.value})}
                    />
                  </div>
                </div>

                {/* Bride Info */}
                <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl border border-gray-100 dark:border-dark-border">
                  <h4 className="col-span-2 text-sm font-bold text-navy dark:text-dark-text uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-pink-500 rounded-full" /> Data Mempelai Wanita
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Lengkap</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, brideName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Panggilan</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, brideNickname: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Orang Tua</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Putri dari Bapak... & Ibu..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, brideParents: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Instagram (@username)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, brideInstagram: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Asal</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, brideAddress: e.target.value})}
                    />
                  </div>
                </div>

                {/* Event Details */}
                <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl border border-gray-100 dark:border-dark-border">
                  <h4 className="col-span-2 text-sm font-bold text-navy dark:text-dark-text uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-orange-500 rounded-full" /> Detail Acara
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Acara</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, eventDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Waktu Akad/Pemberkatan</label>
                    <input 
                      required
                      type="time" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, matrimonyTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Waktu Resepsi</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, receptionTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nomor WhatsApp RSVP</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Lokasi</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Gedung Serbaguna..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, locationName: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Lengkap Lokasi</label>
                    <textarea 
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text min-h-[80px] transition-all"
                      onChange={e => setNewCustomer({...newCustomer, locationAddress: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Link Google Maps</label>
                    <input 
                      type="url" 
                      placeholder="https://maps.google.com/..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text transition-all"
                      onChange={e => setNewCustomer({...newCustomer, mapsUrl: e.target.value})}
                    />
                  </div>
                </div>

                {/* Content & Messaging */}
                <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl border border-gray-100 dark:border-dark-border">
                  <h4 className="col-span-2 text-sm font-bold text-navy dark:text-dark-text uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-purple-500 rounded-full" /> Pesan & Kutipan
                  </h4>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pesan Pembuka</label>
                    <textarea 
                      placeholder="Contoh: Dengan memohon rahmat Allah SWT..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text min-h-[80px] transition-all"
                      onChange={e => setNewCustomer({...newCustomer, openingMessage: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Kutipan / Ayat Suci</label>
                    <textarea 
                      placeholder="Contoh: Ar-Rum ayat 21..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text min-h-[80px] transition-all"
                      onChange={e => setNewCustomer({...newCustomer, quote: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Doa Penutup</label>
                    <textarea 
                      placeholder="Contoh: Semoga menjadi keluarga sakinah..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text min-h-[80px] transition-all"
                      onChange={e => setNewCustomer({...newCustomer, prayer: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Journey of Love (Cerita Cinta)</label>
                    <textarea 
                      placeholder="Ceritakan perjalanan cinta mempelai..."
                      className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-navy dark:text-dark-text min-h-[120px] transition-all"
                      onChange={e => setNewCustomer({...newCustomer, journeyOfLove: e.target.value})}
                    />
                  </div>
                </div>

                {/* Bank Accounts */}
                <div className="col-span-2 bg-gray-50 dark:bg-dark-bg p-6 rounded-3xl border border-gray-100 dark:border-dark-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-navy dark:text-dark-text uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-green-500 rounded-full" /> Rekening Digital Gift
                    </h4>
                    <button 
                      type="button"
                      onClick={addBankAccount}
                      className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Tambah Rekening
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(newCustomer.bankAccounts || []).map((acc, index) => (
                      <div key={index} className="grid grid-cols-3 gap-3 p-4 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border relative group/acc">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Nama Bank</label>
                          <input 
                            type="text" 
                            value={acc.bankName}
                            placeholder="BCA / Mandiri / DANA"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg rounded-lg text-xs outline-none"
                            onChange={e => updateBankAccount(index, 'bankName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Atas Nama</label>
                          <input 
                            type="text" 
                            value={acc.accountHolder}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg rounded-lg text-xs outline-none"
                            onChange={e => updateBankAccount(index, 'accountHolder', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">No. Rekening</label>
                          <input 
                            type="text" 
                            value={acc.accountNumber}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg rounded-lg text-xs outline-none"
                            onChange={e => updateBankAccount(index, 'accountNumber', e.target.value)}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeBankAccount(index)}
                          className="absolute -right-2 -top-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/acc:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {(newCustomer.bankAccounts || []).length === 0 && (
                      <p className="text-[10px] text-gray-400 italic text-center py-4">Belum ada rekening ditambahkan.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-dark-bg flex items-center justify-end gap-4 border-t border-gray-100 dark:border-dark-border">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 text-sm font-semibold text-gray-500 dark:text-dark-muted hover:text-navy dark:hover:text-dark-text transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-navy dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-navy/90 dark:hover:bg-blue-700 transition-all"
                >
                  Simpan Customer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
