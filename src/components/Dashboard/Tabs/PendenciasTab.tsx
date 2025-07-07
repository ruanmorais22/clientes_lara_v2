import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { ChecklistItem } from '../../../types';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface PendenciasTabProps {
  promptId: number;
}

export function PendenciasTab({ promptId }: PendenciasTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('prompt_id', promptId)
        .order('order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast.error('Falha ao carregar o checklist.');
    } finally {
      setLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const newOrder = (items[items.length - 1]?.order || 0) + 1;
    const newItem: Omit<ChecklistItem, 'id' | 'created_at' | 'updated_at'> = {
      prompt_id: promptId,
      text: newItemText.trim(),
      is_completed: false,
      order: newOrder,
    };

    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, data]);
      setNewItemText('');
      toast.success('Item adicionado com sucesso!');
    } catch (error) {
      toast.error('Falha ao adicionar item.');
    }
  };

  const handleToggleComplete = async (item: ChecklistItem) => {
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .update({ is_completed: !item.is_completed })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(i => (i.id === item.id ? data : i)));
      toast.success('Status do item atualizado!');
    } catch (error) {
      toast.error('Falha ao atualizar status.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Item removido com sucesso!');
    } catch (error) {
      toast.error('Falha ao remover item.');
    }
  };

  const handleStartEditing = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleCancelEditing = () => {
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleSaveEditing = async (id: string) => {
    if (!editingItemText.trim()) return;
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .update({ text: editingItemText.trim() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(i => (i.id === id ? data : i)));
      handleCancelEditing();
      toast.success('Item atualizado com sucesso!');
    } catch (error) {
      toast.error('Falha ao atualizar item.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pendências</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Adicionar nova tarefa..."
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <input
              type="checkbox"
              checked={item.is_completed}
              onChange={() => handleToggleComplete(item)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {editingItemId === item.id ? (
              <input
                type="text"
                value={editingItemText}
                onChange={(e) => setEditingItemText(e.target.value)}
                className="flex-grow p-1 border-b border-blue-500 bg-transparent focus:outline-none"
                autoFocus
              />
            ) : (
              <span className={`flex-grow ${item.is_completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {item.text}
              </span>
            )}
            
            <div className="flex items-center gap-2">
              {editingItemId === item.id ? (
                <>
                  <button onClick={() => handleSaveEditing(item.id)} className="p-1 text-green-600 hover:text-green-800">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancelEditing} className="p-1 text-gray-500 hover:text-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => handleStartEditing(item)} className="p-1 text-gray-500 hover:text-gray-700">
                  <Edit className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma pendência ainda.</p>
        )}
      </div>
    </div>
  );
}
