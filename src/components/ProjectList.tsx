/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Edit2, Trash2, Download, Eye, ExternalLink } from 'lucide-react';
import type { Project, Customer } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface ProjectListProps {
  projects: Project[];
  customers: Customer[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectList({ projects, customers, onEdit, onDelete }: ProjectListProps) {
  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? `${customer.groomName} & ${customer.brideName}` : 'Unknown Customer';
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-display font-bold text-navy dark:text-dark-text">Riwayat Proyek</h2>
        <p className="text-gray-500 dark:text-dark-muted">Daftar semua undangan yang telah dibuat atau sedang dalam proses.</p>
      </header>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-bg/50 text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">
                <th className="px-6 py-4">Proyek / Customer</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Terakhir Update</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy dark:text-dark-text">{getCustomerName(project.customerId)}</div>
                    <div className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">ID: {project.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      project.mode === 'print' ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    )}>
                      {project.mode === 'print' ? 'Cetak' : 'Digital'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-sm font-medium",
                      project.status === 'completed' ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", project.status === 'completed' ? "bg-green-600 dark:bg-green-400" : "bg-orange-600 dark:bg-orange-400")} />
                      {project.status === 'completed' ? 'Selesai' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">
                    {format(project.updatedAt, 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit(project)}
                        className="p-2 text-gray-400 hover:text-navy dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-card rounded-lg transition-all"
                        title="Edit Proyek"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-navy dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-card rounded-lg transition-all" title="Preview">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-navy dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-card rounded-lg transition-all" title="Export">
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(project.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-dark-muted">
                    Belum ada riwayat proyek.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
