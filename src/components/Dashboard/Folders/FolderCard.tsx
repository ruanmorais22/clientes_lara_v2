import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Folder as FolderIcon, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Folder } from '../../../types';
import { supabase } from '../../../services/supabase';
import toast from 'react-hot-toast';

interface FolderCardProps {
  folder: Folder;
  onClick: () => void;
  onUpdate: () => void;
}

export function FolderCard({ folder, onClick, onUpdate }: FolderCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX - 110
      });
    }
  }, [showMenu]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Pasta excluída com sucesso!');
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao excluir pasta');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newName.trim()) {
      toast.error('O nome da pasta não pode estar vazio');
      return;
    }

    try {
      const { error } = await supabase
        .from('folders')
        .update({ name: newName.trim() })
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Nome da pasta atualizado com sucesso!');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao atualizar o nome da pasta');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !buttonRef.current?.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSave} className="p-4">
          <div className="flex items-center gap-3">
            <FolderIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showDeleteConfirm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full p-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Confirmar exclusão</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tem certeza que deseja excluir a pasta "{folder.name}"?<br />
            Todos os projetos dentro dela serão movidos para "Sem pasta".
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border dark:border-gray-600 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 w-full">
      <div
        className="p-4 flex items-center gap-3"
        onClick={onClick}
      >
        <FolderIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{folder.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{folder.prompts ? folder.prompts.length : 0} projetos</p>
        </div>
        {folder.id !== 'root' && (
          <div>
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {showMenu && createPortal(
              <div
                className="fixed w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-[9999]"
                style={{
                  top: menuPosition.top,
                  left: menuPosition.left,
                }}
              >
                <button
                  onClick={handleEditClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar nome
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir pasta
                </button>
              </div>,
              document.body
            )}
          </div>
        )}
      </div>
    </div>
  );
}
