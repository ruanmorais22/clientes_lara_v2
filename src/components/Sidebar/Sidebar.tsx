import React from 'react';
import { Cpu, GraduationCap, MessageSquare, PenTool, Layout, X } from 'lucide-react';
import { Folder } from '../../types';

const categories = [
  { id: 'automatize', label: 'Automatize', icon: <Cpu size={20} /> },
  { id: 'profinho', label: 'Profinho', icon: <GraduationCap size={20} /> },
  { id: 'sofia', label: 'Plataforma Sofia', icon: <MessageSquare size={20} /> },
  { id: 'fabrica', label: 'Fábrica de Posts', icon: <PenTool size={20} /> },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setCurrentFolder: (folder: Folder | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, setCurrentFolder }) => {
  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-[#051024] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="font-poppins font-extrabold text-2xl tracking-tight flex items-center gap-3" style={{
              backgroundImage: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <Layout className="text-[#D4AF37]" strokeWidth={2.5} />
              Automatize
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-poppins tracking-wider uppercase">Team Edition</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setCurrentFolder(null);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center px-4 py-4 rounded-xl transition-all duration-300 group
                ${activeTab === cat.id
                  ? 'bg-[#0F1E36] border border-[#D4AF37]/30 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'text-slate-400 hover:bg-[#0F1E36] hover:text-[#D4AF37] border border-transparent'}
              `}
            >
              <span className={`mr-3 transition-colors ${activeTab === cat.id ? 'text-[#D4AF37]' : 'text-slate-500 group-hover:text-[#D4AF37]'}`}>
                {cat.icon}
              </span>
              <span className="font-poppins font-semibold text-sm">{cat.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] opacity-60 mb-2">Sincronização Ativa</div>
          <div className="text-xs text-slate-600 font-mono">v2.3 • Mobile Ready</div>
        </div>
      </aside>
    </>
  );
};
