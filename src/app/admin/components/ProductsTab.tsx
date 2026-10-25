'use client';

import React, { useState } from 'react';
import { ProductItem } from '@/types';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Save,
  Tag,
} from 'lucide-react';

interface ProductsTabProps {
  products: ProductItem[];
  onSaveProducts: (products: ProductItem[]) => Promise<boolean>;
  isSaving: boolean;
}

export default function ProductsTab({
  products,
  onSaveProducts,
  isSaving,
}: ProductsTabProps) {
  const [items, setItems] = useState<ProductItem[]>(products || []);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuresText, setFeaturesText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenAdd = () => {
    setEditingItem({
      id: `prod-${Date.now()}`,
      name: '',
      tagline: '',
      description: '',
      category: 'landing-page',
      badge: '',
      originalPrice: 'R$ 297',
      price: 97,
      priceFormatted: 'R$ 97',
      installments: 'ou 12x de R$ 9,74',
      features: [],
      imageUrl: '',
      demoUrl: '',
      ctaText: 'Comprar Agora',
      active: true,
      order: items.length + 1,
    });
    setFeaturesText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProductItem) => {
    setEditingItem({ ...item });
    setFeaturesText(item.features ? item.features.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.name.trim() || !editingItem.price) {
      alert('Preencha ao menos o nome e o valor do produto.');
      return;
    }

    const feats = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const updatedItem: ProductItem = {
      ...editingItem,
      features: feats,
      priceFormatted: editingItem.priceFormatted || `R$ ${editingItem.price}`,
    };

    const exists = items.some((p) => p.id === updatedItem.id);
    let newItems: ProductItem[];

    if (exists) {
      newItems = items.map((p) => (p.id === updatedItem.id ? updatedItem : p));
    } else {
      newItems = [...items, updatedItem];
    }

    setItems(newItems);
    setIsModalOpen(false);
    setEditingItem(null);

    const ok = await onSaveProducts(newItems);
    if (ok) {
      setFeedback({ type: 'success', message: 'Produtos salvos com sucesso!' });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: 'Erro ao salvar produtos.' });
    }
  };

  const handleToggleActive = async (id: string) => {
    const newItems = items.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setItems(newItems);
    await onSaveProducts(newItems);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este produto?')) return;
    const newItems = items.filter((p) => p.id !== id);
    setItems(newItems);
    await onSaveProducts(newItems);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // reindex
    const reordered = copy.map((p, idx) => ({ ...p, order: idx + 1 }));
    setItems(reordered);
    await onSaveProducts(reordered);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <span>Pacotes de Landing Pages por Estrutura</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Gerencie os pacotes e estruturas exibidos na loja do site com links de demonstração, painéis de gestão e download.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((prod, index) => (
          <div
            key={prod.id}
            className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
              prod.active
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-slate-900/40 border-slate-800/50 opacity-60'
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {prod.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    title="Mover para cima"
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === items.length - 1}
                    title="Mover para baixo"
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {prod.badge && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded w-fit">
                  {prod.badge}
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-1">{prod.name}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">{prod.tagline}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 line-through block">De {prod.originalPrice}</span>
                <span className="text-2xl font-black text-white">{prod.priceFormatted}</span>
                {prod.installments && (
                  <span className="text-xs text-emerald-400 block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{prod.installments}</span>
                )}
              </div>

              {prod.features && prod.features.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recursos ({prod.features.length}):</span>
                  <ul className="text-xs text-slate-300 flex flex-col gap-1">
                    {prod.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                    {prod.features.length > 3 && (
                      <li className="text-[11px] text-slate-500 pl-5">+ {prod.features.length - 3} mais recursos</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => handleToggleActive(prod.id)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  prod.active
                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                    : 'text-slate-500 hover:bg-slate-800'
                }`}
                title={prod.active ? 'Produto Ativo no site' : 'Produto Oculto'}
              >
                {prod.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{prod.active ? 'Ativo' : 'Oculto'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(prod)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span>{items.some((p) => p.id === editingItem.id) ? 'Editar Produto' : 'Novo Produto'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">ID Único (URL / Checkout)</label>
                  <input
                    type="text"
                    value={editingItem.id}
                    onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="landing-page">Landing Page</option>
                    <option value="combo">Combo Multi-Nichos</option>
                    <option value="service">Serviço / Implementação</option>
                    <option value="system">Sistema / App</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Ex: Combo Completo 5 em 1 + Painel Admin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Slogan / Chamada Curta</label>
                <input
                  type="text"
                  value={editingItem.tagline}
                  onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })}
                  placeholder="Ex: 5 estruturas de alta conversão + Painel Admin Dinâmico"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Preço Numérico (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: parseFloat(e.target.value) || 0,
                        priceFormatted: `R$ ${e.target.value}`,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Preço Original ("De R$")</label>
                  <input
                    type="text"
                    value={editingItem.originalPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, originalPrice: e.target.value })}
                    placeholder="Ex: R$ 497"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Parcelamento</label>
                  <input
                    type="text"
                    value={editingItem.installments || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, installments: e.target.value })}
                    placeholder="Ex: ou 12x de R$ 19,78"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Badge de Destaque</label>
                  <input
                    type="text"
                    value={editingItem.badge || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    placeholder="Ex: MAIS VENDIDO • COM PAINEL ADMIN"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={editingItem.ctaText || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, ctaText: e.target.value })}
                    placeholder="Ex: Comprar com Pix / Cartão"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Link de Demonstração Ao Vivo</label>
                  <input
                    type="text"
                    value={editingItem.demoUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, demoUrl: e.target.value })}
                    placeholder="Ex: /modelos/01-curso-infoproduto"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Imagem / Banner URL</label>
                  <input
                    type="text"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    placeholder="Ex: /criativos/novos/criativo-05-combo-5em1-feed.jpg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recursos Inclusos (1 item por linha)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Acesso a 5 landing pages&#10;Painel Admin incluso&#10;Página de obrigado&#10;Suporte VIP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Produto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

