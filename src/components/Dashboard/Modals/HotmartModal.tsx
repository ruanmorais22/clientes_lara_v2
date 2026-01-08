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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-0 md:p-4">
      <div className="bg-[#0F1E36] border-0 md:border md:border-white/10 w-full h-full md:h-[90vh] md:w-[95%] md:max-w-4xl md:rounded-2xl shadow-2xl flex flex-col">
        <div className="px-4 py-4 md:px-8 md:py-6 border-b border-white/10 flex justify-between items-center bg-[#0F1E36] md:rounded-t-2xl shrink-0">
          <div>
            <span className="text-[10px] md:text-xs text-[#D4AF37] font-bold uppercase tracking-widest block mb-1">Integração</span>
            <h3 className="text-lg md:text-2xl font-poppins font-bold text-white truncate">Configuração Hotmart</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-2"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#051024]/50 p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={config?.clientId || ''}
                onChange={(e) => handleChange('clientId', e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-slate-700"
                placeholder="Insira o Client ID"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Client Secret
              </label>
              <input
                type="password"
                value={config?.clientSecret || ''}
                onChange={(e) => handleChange('clientSecret', e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-slate-700"
                placeholder="Insira o Client Secret"
              />
            </div>
          </div>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wide text-sm transition-all bg-gradient-to-b from-orange-600 to-orange-700 border-b-4 border-orange-900 hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1 mb-8 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Buscando...' : 'Atualizar Produtos'}
          </button>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white mb-4">Produtos e Ofertas</h4>
            {config?.products?.map((product) => (
              <div key={product.id} className="border border-white/10 rounded-lg overflow-hidden bg-[#0F1E36]">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a2e4d] transition-colors"
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="font-medium text-white">
                    {product.name} <span className="text-xs text-slate-500 ml-2">(ID: {product.id})</span>
                  </div>
                  {expandedProducts.has(product.id) ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>

                {expandedProducts.has(product.id) && (
                  <div className="p-4 bg-[#051024] space-y-4 border-t border-white/10">
                    <div className="flex justify-end">
                      <button
                        onClick={() => addOffer(product.id)}
                        className="text-xs text-[#D4AF37] hover:text-[#f3d576] flex items-center gap-1 font-bold uppercase tracking-wide"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Oferta
                      </button>
                    </div>

                    {product.offers.map((offer, idx) => (
                      <div key={idx} className="bg-[#0F1E36]/50 p-4 rounded-lg border border-white/5">
                        <div className="flex justify-between mb-4">
                          <h5 className="text-sm font-bold text-slate-300 uppercase">Oferta {idx + 1}</h5>
                          <button onClick={() => removeOffer(product.id, idx)} className="text-red-500 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome da Oferta</label>
                            <input
                              type="text"
                              value={offer.name}
                              readOnly
                              className="w-full p-2 text-sm border border-white/5 rounded bg-[#051024] text-slate-500 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Key da Oferta</label>
                            <input
                              type="text"
                              value={offer.key}
                              readOnly
                              className="w-full p-2 text-sm border border-white/5 rounded bg-[#051024] text-slate-500 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-400 uppercase">IDs dos Fluxos</p>
                            <button
                              onClick={() => replicateFlows(product.id, idx)}
                              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded transition-colors uppercase font-bold tracking-wide"
                              title="Preencher ofertas vazias deste produto com estes fluxos"
                            >
                              <RefreshCw className="w-3 h-3" /> Replicar para vazios
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Compra Aprovada</label>
                              <input
                                type="text"
                                value={offer.flows.approved_purchase || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'approved_purchase')}
                                className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Abandono de Carrinho</label>
                              <input
                                type="text"
                                value={offer.flows.abandonment || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'abandonment')}
                                className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cartão Recusado</label>
                              <input
                                type="text"
                                value={offer.flows.card_declined || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'card_declined')}
                                className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reembolso</label>
                              <input
                                type="text"
                                value={offer.flows.refund || ''}
                                onChange={(e) => updateOffer(product.id, idx, 'flows', e.target.value, 'refund')}
                                className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {product.offers.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-2">Nenhuma oferta cadastrada.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {(!config?.products || config.products.length === 0) && (
              <p className="text-slate-500 text-center py-8">
                Nenhum produto encontrado. Configure as credenciais e clique em "Atualizar Produtos".
              </p>
            )}
          </div>
        </div>
        
        <div className="px-4 py-4 md:px-8 md:py-6 bg-[#0F1E36] border-t border-white/10 flex justify-end md:rounded-b-2xl">
          <button
             onClick={onClose}
             className="px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wide text-sm transition-all bg-gradient-to-b from-green-600 to-green-700 border-b-4 border-green-900 hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1"
          >
            Confirmar Configuração
          </button>
        </div>
      </div>
    </div>
  );
}
