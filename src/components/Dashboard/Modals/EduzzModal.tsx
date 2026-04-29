import React, { useState } from 'react';
import { X, RefreshCw, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { EduzzConfig, EduzzProduct, EduzzOffer } from '../../../types';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface EduzzModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EduzzConfig | undefined;
  onChange: (config: EduzzConfig) => void;
}

export function EduzzModal({ isOpen, onClose, config, onChange }: EduzzModalProps) {
  const [loading, setLoading] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleChange = (field: keyof EduzzConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const fetchProducts = async () => {
    if (!config?.email || !config?.publicKey || !config?.apiKey) {
      toast.error('Preencha Email, Public Key e API Key para buscar automaticamente.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-eduzz-products', {
        body: {
          email: config.email,
          publicKey: config.publicKey,
          apiKey: config.apiKey,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const apiProducts: EduzzProduct[] = data?.products || [];

      // Merge with existing products to preserve any offers/flows already set
      const merged: EduzzProduct[] = apiProducts.map((p) => {
        const existing = config.products?.find((ep) => String(ep.id) === String(p.id));
        if (!existing) return p;

        const mergedOffers: EduzzOffer[] = (p.offers || []).map((apiOffer) => {
          const existingOffer = existing.offers?.find((eo) => eo.key === apiOffer.key);
          if (existingOffer) {
            return { ...apiOffer, flows: existingOffer.flows || {} };
          }
          return apiOffer;
        });

        // Keep manually added offers that the API does not return
        const manualOffers = (existing.offers || []).filter(
          (eo) => !mergedOffers.some((mo) => mo.key === eo.key)
        );

        return { ...p, offers: [...mergedOffers, ...manualOffers] };
      });

      // Keep manual products that aren't in the API response
      const manualOnly = (config.products || []).filter(
        (ep) => !merged.some((mp) => String(mp.id) === String(ep.id))
      );

      handleChange('products', [...merged, ...manualOnly]);
      toast.success('Produtos atualizados com sucesso!');
    } catch (error: any) {
      console.error('Error fetching Eduzz products:', error);
      toast.error(
        'Não foi possível buscar produtos da Eduzz. Adicione manualmente. (' +
          (error.message || 'erro desconhecido') +
          ')'
      );
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    const newProduct: EduzzProduct = {
      id: `manual-${Date.now()}`,
      name: '',
      offers: [{ key: '', name: 'Oferta padrão', flows: {} }],
    };
    const newProducts = [...(config?.products || []), newProduct];
    handleChange('products', newProducts);
    setExpandedProducts((prev) => new Set([...prev, String(newProduct.id)]));
  };

  const updateProductField = (productId: string | number, field: 'id' | 'name', value: any) => {
    const newProducts = config?.products?.map((p) =>
      String(p.id) === String(productId) ? { ...p, [field]: value } : p
    );
    handleChange('products', newProducts);
  };

  const removeProduct = (productId: string | number) => {
    if (!window.confirm('Remover este produto e todas as suas ofertas?')) return;
    const newProducts = config?.products?.filter((p) => String(p.id) !== String(productId));
    handleChange('products', newProducts);
  };

  const toggleProduct = (id: string | number) => {
    const sid = String(id);
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) {
        next.delete(sid);
      } else {
        next.add(sid);
      }
      return next;
    });
  };

  const addOffer = (productId: string | number) => {
    const newProducts = config?.products?.map((p) =>
      String(p.id) === String(productId)
        ? { ...p, offers: [...p.offers, { key: '', name: '', flows: {} }] }
        : p
    );
    handleChange('products', newProducts);
  };

  const updateOffer = (
    productId: string | number,
    offerIndex: number,
    field: keyof EduzzOffer | 'flows',
    value: any,
    flowKey?: string
  ) => {
    const newProducts = config?.products?.map((p) => {
      if (String(p.id) !== String(productId)) return p;
      const newOffers = [...p.offers];
      if (field === 'flows' && flowKey) {
        newOffers[offerIndex] = {
          ...newOffers[offerIndex],
          flows: { ...newOffers[offerIndex].flows, [flowKey]: value },
        };
      } else {
        newOffers[offerIndex] = { ...newOffers[offerIndex], [field]: value };
      }
      return { ...p, offers: newOffers };
    });
    handleChange('products', newProducts);
  };

  const removeOffer = (productId: string | number, offerIndex: number) => {
    const newProducts = config?.products?.map((p) => {
      if (String(p.id) !== String(productId)) return p;
      return { ...p, offers: p.offers.filter((_, i) => i !== offerIndex) };
    });
    handleChange('products', newProducts);
  };

  const replicateFlows = (productId: string | number, sourceOfferIndex: number) => {
    if (
      !window.confirm(
        'Deseja preencher automaticamente os fluxos vazios das outras ofertas deste produto com os valores atuais?'
      )
    ) {
      return;
    }

    const newProducts = config?.products?.map((p) => {
      if (String(p.id) !== String(productId)) return p;
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
          },
        };
      });
      return { ...p, offers: newOffers };
    });
    handleChange('products', newProducts);
    toast.success('Fluxos replicados para campos vazios!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-0 md:p-4">
      <div className="bg-[#0F1E36] border-0 md:border md:border-white/10 w-full h-full md:h-[90vh] md:w-[95%] md:max-w-4xl md:rounded-2xl shadow-2xl flex flex-col">
        <div className="px-4 py-4 md:px-8 md:py-6 border-b border-white/10 flex justify-between items-center bg-[#0F1E36] md:rounded-t-2xl shrink-0">
          <div>
            <span className="text-[10px] md:text-xs text-[#D4AF37] font-bold uppercase tracking-widest block mb-1">
              Integração
            </span>
            <h3 className="text-lg md:text-2xl font-poppins font-bold text-white truncate">
              Configuração Eduzz
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#051024]/50 p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
              <input
                type="email"
                value={config?.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-slate-700"
                placeholder="email@dominio.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Public Key
              </label>
              <input
                type="text"
                value={config?.publicKey || ''}
                onChange={(e) => handleChange('publicKey', e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-slate-700"
                placeholder="Insira a Public Key"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config?.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-slate-700"
                placeholder="Insira a API Key"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Caso a API da Eduzz não esteja disponível ou suas credenciais não tenham permissão para
            listar produtos, use o botão "Adicionar Produto" para cadastrar manualmente.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wide text-sm transition-all bg-gradient-to-b from-[#0066CC] to-[#004A99] border-b-4 border-[#003366] hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Buscando...' : 'Atualizar Produtos'}
            </button>
            <button
              onClick={addProduct}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wide text-sm transition-all bg-gradient-to-b from-green-600 to-green-700 border-b-4 border-green-900 hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1"
            >
              <Plus className="w-4 h-4" />
              Adicionar Produto
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white mb-4">Produtos e Ofertas</h4>
            {config?.products?.map((product) => {
              const sid = String(product.id);
              const isExpanded = expandedProducts.has(sid);
              return (
                <div
                  key={sid}
                  className="border border-white/10 rounded-lg overflow-hidden bg-[#0F1E36]"
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a2e4d] transition-colors"
                    onClick={() => toggleProduct(product.id)}
                  >
                    <div className="font-medium text-white">
                      {product.name || 'Novo produto'}{' '}
                      <span className="text-xs text-slate-500 ml-2">(ID: {String(product.id)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProduct(product.id);
                        }}
                        className="text-red-500 hover:text-red-400 p-1"
                        title="Remover produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-[#051024] space-y-4 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            ID do Produto
                          </label>
                          <input
                            type="text"
                            value={String(product.id)}
                            onChange={(e) => updateProductField(product.id, 'id', e.target.value)}
                            className="w-full bg-[#0F1E36] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                            placeholder="Ex: 12345"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Nome do Produto
                          </label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateProductField(product.id, 'name', e.target.value)}
                            className="w-full bg-[#0F1E36] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                            placeholder="Nome do produto"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => addOffer(product.id)}
                          className="text-xs text-[#D4AF37] hover:text-[#f3d576] flex items-center gap-1 font-bold uppercase tracking-wide"
                        >
                          <Plus className="w-4 h-4" /> Adicionar Oferta
                        </button>
                      </div>

                      {product.offers.map((offer, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0F1E36]/50 p-4 rounded-lg border border-white/5"
                        >
                          <div className="flex justify-between mb-4">
                            <h5 className="text-sm font-bold text-slate-300 uppercase">
                              Oferta {idx + 1}
                            </h5>
                            <button
                              onClick={() => removeOffer(product.id, idx)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Nome da Oferta
                              </label>
                              <input
                                type="text"
                                value={offer.name}
                                onChange={(e) =>
                                  updateOffer(product.id, idx, 'name', e.target.value)
                                }
                                className="w-full p-2 text-sm border border-white/10 rounded bg-[#051024] text-white focus:border-[#D4AF37] focus:outline-none"
                                placeholder="Nome da oferta"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Key da Oferta
                              </label>
                              <input
                                type="text"
                                value={offer.key}
                                onChange={(e) =>
                                  updateOffer(product.id, idx, 'key', e.target.value)
                                }
                                className="w-full p-2 text-sm border border-white/10 rounded bg-[#051024] text-white focus:border-[#D4AF37] focus:outline-none"
                                placeholder="Identificador único"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-bold text-slate-400 uppercase">
                                IDs dos Fluxos
                              </p>
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
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  Compra Aprovada
                                </label>
                                <input
                                  type="text"
                                  value={offer.flows.approved_purchase || ''}
                                  onChange={(e) =>
                                    updateOffer(
                                      product.id,
                                      idx,
                                      'flows',
                                      e.target.value,
                                      'approved_purchase'
                                    )
                                  }
                                  className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  Abandono de Carrinho
                                </label>
                                <input
                                  type="text"
                                  value={offer.flows.abandonment || ''}
                                  onChange={(e) =>
                                    updateOffer(
                                      product.id,
                                      idx,
                                      'flows',
                                      e.target.value,
                                      'abandonment'
                                    )
                                  }
                                  className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  Cartão Recusado
                                </label>
                                <input
                                  type="text"
                                  value={offer.flows.card_declined || ''}
                                  onChange={(e) =>
                                    updateOffer(
                                      product.id,
                                      idx,
                                      'flows',
                                      e.target.value,
                                      'card_declined'
                                    )
                                  }
                                  className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  Reembolso
                                </label>
                                <input
                                  type="text"
                                  value={offer.flows.refund || ''}
                                  onChange={(e) =>
                                    updateOffer(
                                      product.id,
                                      idx,
                                      'flows',
                                      e.target.value,
                                      'refund'
                                    )
                                  }
                                  className="w-full bg-[#051024] border border-white/10 rounded px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none transition-colors text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {product.offers.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-2">
                          Nenhuma oferta cadastrada.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {(!config?.products || config.products.length === 0) && (
              <p className="text-slate-500 text-center py-8">
                Nenhum produto cadastrado. Clique em "Atualizar Produtos" ou "Adicionar Produto".
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
