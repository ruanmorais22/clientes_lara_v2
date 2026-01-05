import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Folder } from '../../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  folder: Folder | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, onSave, folder }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    } else {
      setName('');
    }
  }, [folder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F1E36] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500"><X size={20}/></button>
        <h3 className="text-lg md:text-xl font-poppins font-bold text-white mb-6">
          {folder ? 'Editar Pasta' : 'Nova Pasta'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#D4AF37] uppercase mb-2">Nome da Pasta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lançamento 2024"
              className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="submit" className="px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wide text-sm transition-all bg-gradient-to-b from-green-600 to-green-700 border-b-4 border-green-900 hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1">
              {folder ? 'Salvar' : 'Criar Pasta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
