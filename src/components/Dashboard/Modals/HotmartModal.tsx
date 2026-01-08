import React, { useState } from 'react';
import { X, RefreshCw, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { HotmartConfig, HotmartProduct, HotmartOffer } from '../../../types';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface HotmartModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HotmartConfig | undefined;
  onChange: (config: HotmartConfig) => void;
}

export function HotmartModal({ isOpen, onClose, config, onChange }: HotmartModalProps) {
  const [loading, setLoading] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handleChange = (field: keyof HotmartConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const fetchProducts = async () => {
    if (!config?.clientId || !config?.clientSecret) {
      toast.error('Preencha Client ID e Client Secret');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-hotmart-products', {
        body: {
          clientId: config.clientId,
          clientSecret: config.clientSecret
        }
      });

      if (error) throw error;

      if (data.error) throw new Error(data.error);

      // Merge existing products/offers with new ones to preserve flow IDs
      const newProducts: HotmartProduct[] = data.products.map((p: any) => {
        const existingProduct = config.products?.find(ep => ep.id === p.id);
        
        // Map API offers, preserving flows from existing offers if they match
        const mergedOffers = (p.offers || []).map((apiOffer: HotmartOffer) => {
          const existingOffer = existingProduct?.offers?.find(eo => eo.key === apiOffer.key);
          if (existingOffer) {
            return {
              ...apiOffer,
              flows: existingOffer.flows || {}
            };
          }
          return apiOffer;
        });

        // Also keep manual offers that might have been added but not in API (optional, but good for safety)
        // For now, let's just use the API list + preserved flows, as the user wants to "Update" from API.
        
        return {
          ...p,
          offers: mergedOffers
        };
      });

      handleChange('products', newProducts);
      toast.success('Produtos atualizados com sucesso!');
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao buscar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedProducts(newExpanded);
  };

  const addOffer = (productId: number) => {
    const newProducts = config?.products?.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          offers: [...p.offers, { key: '', name: '', flows: {} }]
        };
      }
      return p;
    });
    handleChange('products', newProducts);
  };

  const updateOffer = (productId: number, offerIndex: number, field: keyof HotmartOffer | 'flows', value: any, flowKey?: string) => {
    const newProducts = config?.products?.map(p => {
      if (p.id === productId) {
        const newOffers = [...p.offers];
        if (field === 'flows' && flowKey) {
          newOffers[offerIndex] = {
            ...newOffers[offerIndex],
            flows: { ...newOffers[offerIndex].flows, [flowKey]: value }
          };
        } else {
          newOffers[offerIndex] = { ...newOffers[offerIndex], [field]: value };
        }
        return { ...p, offers: newOffers };
      }
      return p;
    });
    handleChange('products', newProducts);
  };

  const removeOffer = (productId: number, offerIndex: number) => {
    const newProducts = config?.products?.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          offers: p.offers.filter((_, i) => i !== offerIndex)
        };
      }
      return p;
    });
    handleChange('products', newProducts);
  };

  const replicateFlows = (productId: number, sourceOfferIndex: number) => {
    if (!window.confirm('Deseja preencher automaticamente os fluxos vazios das outras ofertas deste produto com os valores atuais?')) {
      return;
    }

    const newProducts = config?.products?.map(p => {
      if (p.id === productId) {
        const sourceFlows = p.offers[sourceOfferIndex].flows;
        const newOffers = p.offers.map((offer, idx) => {
          if (idx === sourceOfferIndex) return offer;
          
          return {
            ...offer,
            flows: {
              approved_purchase: offer.flows.approved_purchase || sourceFlows.approved_purchase,
              abandonment: offer.flows.abandonment || sourceFlows.abandonment,
              card_declined: offer.flows.card_declined || sourceFlows.card_declined,
              refund: offer.flows.refund || sourceFlows.refund,
            }
          };
        });
        return { ...p, offers: newOffers };
      }
      return p;
    });
    handleChange('products', newProducts);
    toast.success('Fluxos replicados para campos vazios!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Configuração Hotmart</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={config?.clientId || ''}
                onChange={(e) => handleChange('clientId', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Insira o Client ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Secret
              </label>
              <input
                type="password"
                value={config?.clientSecret || ''}
                onChange={(e) => handleChange('clientSecret', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Insira o Client Secret"
              />
            </div>
          </div>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mb-8 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Buscando...' : 'Atualizar Produtos'}
          </button>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Produtos e Ofertas</h4>
            {config?.products?.map((product) => (
              <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div
                  className="bg-gray-50 dark:bg-gray-750 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.name} <span className="text-sm text-gray-500 ml-2">(ID: {product.id})</span>
                  </div>
                  {expandedProducts.has(product.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>

                {expandedProducts.has(product.id) && (
                  <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => addOffer(product.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Oferta
                      </button>
                    </div>

                    {product.offers.map((offer, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between mb-4">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Oferta {idx + 1}</h5>
                          <button onClick={() => removeOffer(product.id, idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Nome da Oferta"
                            value={offer.name}
                            readOnly
                            className="p-2 text-sm border rounded bg-gray-100 dark:bg-gray-900 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                          />
                          <input
                            type="text"
                            placeholder="Key da Oferta"
                            value={offer.key}
                            readOnly
                            className="p-2 text-sm border rounded bg-gray-100 dark:bg-gray-900 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-500 uppercase">IDs dos Fluxos</p>
                            <button
                              onClick={() => replicateFlows(product.id, idx)}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded transition-colors"
                              title="Preencher ofertas vazias deste produto com estes fluxos"
                            >
                              <RefreshCw className="w-3 h-3" /> Replicar para vazios
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Compra Aprovada</label>
                              <input
                                type="text"
                                value={offer.flows.approved_purchase || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'approved_purchase')}
                                className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Abandono de Carrinho</label>
                              <input
                                type="text"
                                value={offer.flows.abandonment || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'abandonment')}
                                className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Cartão Recusado</label>
                              <input
                                type="text"
                                value={offer.flows.card_declined || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'card_declined')}
                                className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Reembolso</label>
                              <input
                                type="text"
                                value={offer.flows.refund || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'refund')}
                                className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {product.offers.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">Nenhuma oferta cadastrada.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {(!config?.products || config.products.length === 0) && (
              <p className="text-gray-500 text-center py-8">
                Nenhum produto encontrado. Configure as credenciais e clique em "Atualizar Produtos".
              </p>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
          <button
             onClick={onClose}
             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirmar Configuração
          </button>
        </div>
      </div>
    </div>
  );
}
