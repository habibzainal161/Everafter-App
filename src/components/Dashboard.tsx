/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilePlus, Users, History, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_LOGO, APP_NAME } from '../constants';

interface DashboardProps {
  stats: {
    customers: number;
    projects: number;
    active: number;
  };
  studioName: string;
  studioLogo: string;
  onNewProject: () => void;
  onViewProjects: () => void;
}

export default function Dashboard({ stats, studioName, studioLogo, onNewProject, onViewProjects }: DashboardProps) {
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-6">
        <div className="w-32 h-32 bg-white dark:bg-dark-card rounded-2xl p-3 shadow-lg border border-gray-100 dark:border-dark-border flex items-center justify-center">
          <img src={studioLogo} alt={studioName} className="w-full h-auto" referrerPolicy="no-referrer" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold text-navy dark:text-dark-text">Selamat Datang di {studioName}</h2>
          <p className="text-gray-500 dark:text-dark-muted mt-2">Kelola dan buat undangan profesional dengan mudah.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Customer', value: stats.customers, icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'Total Proyek', value: stats.projects, icon: History, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { label: 'Proyek Aktif', value: stats.active, icon: FilePlus, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm transition-colors duration-300"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-navy dark:text-dark-text mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-navy dark:bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-navy/20 dark:shadow-blue-900/20" onClick={onNewProject}>
          <div className="relative z-10">
            <h3 className="text-2xl font-display font-bold mb-2">Mulai Proyek Baru</h3>
            <p className="text-white/70 mb-6 max-w-xs">Pilih template dan buat undangan impian customer Anda sekarang.</p>
            <button className="bg-white text-navy px-6 py-3 rounded-xl font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Buat Undangan <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
        </div>

        <div className="bg-beige dark:bg-dark-card rounded-3xl p-8 text-navy dark:text-dark-text relative overflow-hidden group cursor-pointer border border-navy/5 dark:border-dark-border shadow-sm" onClick={onViewProjects}>
          <div className="relative z-10">
            <h3 className="text-2xl font-display font-bold mb-2">Lihat Riwayat</h3>
            <p className="text-navy/60 dark:text-dark-muted mb-6 max-w-xs">Pantau progres pengerjaan dan revisi undangan yang sedang berjalan.</p>
            <button className="bg-navy dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Buka Riwayat <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-navy/5 dark:bg-blue-600/10 rounded-full blur-3xl group-hover:bg-navy/10 transition-all" />
        </div>
      </div>
    </div>
  );
}
