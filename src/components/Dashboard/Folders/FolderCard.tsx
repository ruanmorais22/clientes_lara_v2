import React from 'react';
import { Folder } from '../../../types';
import { Folder as FolderIcon, Edit3, Trash2 } from 'lucide-react';

interface FolderCardProps {
  folder: Folder;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onEdit, onDelete }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-[#0F1E36] p-5 md:p-6 rounded-xl border border-white/5 hover:border-[#D4AF37]/50 shadow-lg cursor-pointer transition-all duration-300 active:scale-95 md:active:scale-100 md:hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="p-2 md:p-3 rounded-lg bg-[#051024] text-[#D4AF37] border border-white/5 group-hover:bg-[#D4AF37] group-hover:text-[#051024] transition-colors">
          <FolderIcon size={20} className="md:w-6 md:h-6" />
        </div>
        <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="text-slate-500 hover:text-[#D4AF37] p-2 transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-slate-500 hover:text-red-500 p-2 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <h4 className="font-poppins font-semibold text-white text-base md:text-lg truncate mb-1">{folder.name}</h4>
      <p className="text-xs text-slate-500">Toque para abrir</p>
    </div>
  );
};
