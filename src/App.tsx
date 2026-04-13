/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FilePlus, 
  Layers, 
  History, 
  Settings,
  ChevronRight,
  Plus,
  Search,
  MoreVertical,
  Download,
  Eye,
  Edit2,
  Trash2,
  Moon,
  Sun,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, storage } from './lib/utils';
import type { Customer, Project, Template, InvitationMode } from './types';
import { APP_LOGO, APP_NAME, APP_TAGLINE } from './constants';

// Components (to be moved to separate files later if needed)
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import TemplateList from './components/TemplateList';
import ProjectList from './components/ProjectList';
import InvitationWizard from './components/InvitationWizard';
import MediaGallery from './components/MediaGallery';
import SettingsView from './components/Settings';

type View = 'dashboard' | 'customers' | 'templates' | 'projects' | 'wizard' | 'gallery' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [studioInfo, setStudioInfo] = useState<any>(null);
  const [theme] = useState<'dark'>('dark');

  useEffect(() => {
    const savedCustomers = storage.get('customers', []);
    if (savedCustomers.length === 0) {
      const mockCustomer: Customer = {
        id: 'mock-1',
        groomName: 'Habib Zainal',
        groomNickname: 'Habib',
        groomParents: 'Bapak Zainal & Ibu Fatimah',
        brideName: 'Siti Aminah',
        brideNickname: 'Aminah',
        brideParents: 'Bapak Ahmad & Ibu Khadijah',
        eventDate: '2026-08-17',
        matrimonyTime: '09:00',
        receptionTime: '11:00',
        locationName: 'Gedung Serbaguna Jakarta',
        locationAddress: 'Jl. Sudirman No. 1, Jakarta Pusat',
        phoneNumber: '081234567890',
        groomInstagram: 'habib_zainal',
        brideInstagram: 'aminah_siti',
        journeyOfLove: 'Pertemuan pertama kami di sebuah perpustakaan kota, di mana kami tidak sengaja mengambil buku yang sama. Sejak saat itu, setiap halaman hidup kami adalah tentang kebersamaan.',
        createdAt: Date.now(),
      };
      setCustomers([mockCustomer]);
      storage.set('customers', [mockCustomer]);
    } else {
      setCustomers(savedCustomers);
    }
    
    setProjects(storage.get('projects', []));
    setStudioInfo(storage.get('studio_info', null));
    document.documentElement.classList.add('dark');
  }, []);

  const navigateTo = (view: View, project: any = null) => {
    setSelectedProject(project);
    setCurrentView(view);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Data Customer', icon: Users },
    { id: 'gallery', label: 'Galeri Media', icon: ImageIcon },
    { id: 'wizard', label: 'Buat Undangan', icon: FilePlus },
    { id: 'templates', label: 'Template', icon: Layers },
    { id: 'projects', label: 'Riwayat Proyek', icon: History },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-dark-bg overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col transition-colors duration-300">
        <div className="p-6 flex flex-col items-center text-center">
          <img 
            src={studioInfo?.logo || APP_LOGO} 
            alt={studioInfo?.name || APP_NAME} 
            className="w-36 h-auto mb-2 drop-shadow-md" 
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-display font-bold text-navy dark:text-dark-text tracking-tight hidden">{studioInfo?.name || APP_NAME}</h1>
          <p className="text-[10px] text-gray-400 dark:text-dark-muted uppercase tracking-[0.3em] font-bold">{studioInfo?.tagline || APP_TAGLINE}</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                currentView === item.id 
                  ? "bg-navy text-white shadow-lg shadow-navy/20 dark:bg-blue-600 dark:shadow-blue-900/20" 
                  : "text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-navy dark:hover:text-dark-text"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-border space-y-2">
          <button 
            onClick={() => navigateTo('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              currentView === 'settings' 
                ? "bg-navy text-white shadow-lg shadow-navy/20 dark:bg-blue-600 dark:shadow-blue-900/20" 
                : "text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-navy dark:hover:text-dark-text"
            )}
          >
            <Settings size={20} />
            Pengaturan
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-7xl mx-auto"
          >
            {currentView === 'dashboard' && (
              <Dashboard 
                stats={{
                  customers: customers.length,
                  projects: projects.length,
                  active: projects.filter(p => p.status === 'draft').length
                }}
                studioName={studioInfo?.name || APP_NAME}
                studioLogo={studioInfo?.logo || APP_LOGO}
                onNewProject={() => navigateTo('wizard')}
                onViewProjects={() => navigateTo('projects')}
              />
            )}
            {currentView === 'customers' && (
              <CustomerList 
                customers={customers} 
                onUpdate={(newCustomers) => {
                  setCustomers(newCustomers);
                  storage.set('customers', newCustomers);
                }}
                onCreateInvitation={(customer) => navigateTo('templates', customer)}
              />
            )}
            {currentView === 'templates' && (
              <TemplateList 
                customers={customers} 
                initialCustomer={selectedProject as any}
                onSelectTemplate={(template, customer) => {
                  navigateTo('wizard', { 
                    templateId: template.id, 
                    customerId: customer?.id,
                    mode: template.mode
                  });
                }}
              />
            )}
            {currentView === 'gallery' && <MediaGallery customers={customers} />}
            {currentView === 'projects' && (
              <ProjectList 
                projects={projects} 
                customers={customers}
                onEdit={(project) => navigateTo('wizard', project)}
                onDelete={(id) => {
                  const filtered = projects.filter(p => p.id !== id);
                  setProjects(filtered);
                  storage.set('projects', filtered);
                }}
              />
            )}
            {currentView === 'wizard' && (
              <InvitationWizard 
                initialProject={selectedProject}
                customers={customers}
                onSave={(project) => {
                  const exists = projects.find(p => p.id === project.id);
                  const updated = exists 
                    ? projects.map(p => p.id === project.id ? project : p)
                    : [project, ...projects];
                  setProjects(updated);
                  storage.set('projects', updated);
                  setCurrentView('projects');
                }}
                onCancel={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'settings' && (
              <SettingsView onUpdate={() => setStudioInfo(storage.get('studio_info', null))} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

