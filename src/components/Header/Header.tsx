import React from 'react';
import { Menu, ArrowLeft, Folder } from 'lucide-react';
import { Folder as FolderType } from '../../types';

interface HeaderProps {
  currentFolder: FolderType | null;
  setCurrentFolder: (folder: FolderType | null) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentFolder, setCurrentFolder, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <header className="h-16 md:h-20 bg-[#051024] border-b border-white/10 flex items-center justify-between px-4 md:px-8 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-[#0F1E36] lg:hidden"
        >
          <Menu size={24} />
        </button>
        {currentFolder ? (
          <>
            <button
              onClick={() => setCurrentFolder(null)}
              className="p-2 rounded-full hover:bg-[#0F1E36] text-slate-400 hover:text-[#D4AF37] transition-all"
            >
              <ArrowLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] md:text-xs text-[#D4AF37] font-bold uppercase tracking-widest mb-0.5 truncate">
                Pasta
              </span>
              <h2 className="text-lg md:text-2xl font-poppins font-bold text-white flex items-center gap-2 truncate">
                <Folder size={18} className="text-slate-500 shrink-0" />
                <span className="truncate">{currentFolder.name}</span>
              </h2>
            </div>
          </>
        ) : (
          <h2 className="text-lg md:text-2xl font-poppins font-bold text-white flex items-center gap-3">
            <span style={{
              backgroundImage: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Pastas da Equipe
            </span>
          </h2>
        )}
      </div>
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1E36] border border-white/5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online</span>
      </div>
    </header>
  );
};
