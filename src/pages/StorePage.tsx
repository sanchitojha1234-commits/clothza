import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace, type LookbookItem } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';
import { 
  MessageCircle, MapPin, 
  Heart, Plus, Edit3, Eye, MousePointerClick,
  Sparkles, Trash2, ShoppingBag, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THEME_PRESETS: Record<string, {
  container: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  sidebarBg: string;
  filterBtnActive: string;
  filterBtnInactive: string;
  priceFilterBg: string;
  priceSliderAccent: string;
  titleFont: string;
  bodyFont: string;
  headerLayout: string;
  cardGeometry: string;
  borderStyle: string;
  badgeStyle: string;
  logoWrapper: string;
}> = {
  minimalist: {
    container: 'bg-white text-neutral-900 min-h-screen font-serif antialiased pb-20',
    textPrimary: 'text-neutral-900',
    textSecondary: 'text-neutral-600',
    textTertiary: 'text-neutral-400',
    sidebarBg: 'bg-neutral-50/50 border border-neutral-200 rounded-none shadow-none p-6 space-y-6',
    filterBtnActive: 'bg-neutral-900 text-white rounded-none border border-neutral-900 uppercase tracking-widest text-[10px] font-bold py-2 px-4',
    filterBtnInactive: 'bg-white text-neutral-500 hover:text-black rounded-none border border-neutral-200 hover:border-black uppercase tracking-widest text-[10px] font-medium py-2 px-4 transition-all',
    priceFilterBg: 'bg-neutral-50 border border-neutral-200 rounded-none text-neutral-600 font-sans px-3 py-1.5',
    priceSliderAccent: 'accent-neutral-900',
    titleFont: 'font-serif tracking-widest uppercase font-light',
    bodyFont: 'font-serif',
    headerLayout: 'border-b border-neutral-200 pb-4',
    cardGeometry: 'rounded-none border border-neutral-200 shadow-none hover:border-neutral-950 transition-all',
    borderStyle: 'border-neutral-200',
    badgeStyle: 'bg-neutral-950 text-white rounded-none border-none text-[8px] uppercase tracking-wider',
    logoWrapper: 'w-20 h-20 sm:w-24 sm:h-24 rounded-none overflow-hidden border-4 border-white bg-white shadow-md shrink-0',
  },
  streetwear: {
    container: 'bg-[#0f1013] text-white min-h-screen font-sans tracking-tight antialiased pb-20',
    textPrimary: 'text-white',
    textSecondary: 'text-neutral-400',
    textTertiary: 'text-neutral-500',
    sidebarBg: 'bg-[#181a20] border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none p-6 space-y-6',
    filterBtnActive: 'bg-white text-black rounded-none border-2 border-white font-black uppercase text-[11px] py-2 px-4 tracking-tighter',
    filterBtnInactive: 'bg-transparent text-neutral-400 hover:text-white rounded-none border-2 border-neutral-800 hover:border-white font-bold uppercase text-[11px] py-2 px-4 transition-all tracking-tighter',
    priceFilterBg: 'bg-[#181a20] border-2 border-white text-white font-mono px-3 py-1.5 rounded-none',
    priceSliderAccent: 'accent-white',
    titleFont: 'font-sans font-black uppercase tracking-tighter italic text-2xl sm:text-3xl',
    bodyFont: 'font-sans font-medium',
    headerLayout: 'border-b-2 border-white pb-4',
    cardGeometry: 'rounded-none border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-200',
    borderStyle: 'border-white',
    badgeStyle: 'bg-yellow-400 text-black rounded-none border border-black text-[9px] font-black uppercase',
    logoWrapper: 'w-20 h-20 sm:w-24 sm:h-24 rounded-none overflow-hidden border-4 border-white bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] shrink-0',
  },
  linen: {
    container: 'bg-[#FAF6EE] text-[#3c362a] min-h-screen font-sans antialiased pb-20',
    textPrimary: 'text-[#3c362a]',
    textSecondary: 'text-[#6e6350]',
    textTertiary: 'text-[#9c8e76]',
    sidebarBg: 'bg-[#f4efe3] border border-[#ebdcb9]/40 rounded-[2.5rem] shadow-none p-8 space-y-6',
    filterBtnActive: 'bg-[#5a6b5c] text-white rounded-full font-medium py-2 px-5 shadow-sm text-xs',
    filterBtnInactive: 'bg-[#FAF6EE]/80 text-[#6e6350] hover:text-[#3c362a] rounded-full border border-[#ebdcb9]/50 hover:bg-[#ebdcb9]/20 font-medium py-2 px-5 transition-all text-xs',
    priceFilterBg: 'bg-[#f4efe3] border border-[#ebdcb9]/40 text-[#6e6350] px-4 py-2 rounded-full',
    priceSliderAccent: 'accent-[#5a6b5c]',
    titleFont: 'font-serif font-semibold tracking-wide text-2xl text-[#2d3a2f]',
    bodyFont: 'font-sans',
    headerLayout: 'border-b border-[#ebdcb9]/40 pb-5',
    cardGeometry: 'rounded-[2rem] border border-[#ebdcb9]/40 bg-[#FAF6EE] shadow-sm hover:shadow-md transition-all duration-300',
    borderStyle: 'border-[#ebdcb9]/40',
    badgeStyle: 'bg-[#5a6b5c]/10 text-[#5a6b5c] rounded-full text-[9px] font-semibold',
    logoWrapper: 'w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] overflow-hidden border-4 border-[#FAF6EE] bg-white shadow-md shrink-0',
  },
  leather: {
    container: 'bg-[#fbf9f4] text-[#331d0b] min-h-screen font-serif antialiased pb-20',
    textPrimary: 'text-[#331d0b]',
    textSecondary: 'text-[#614530]',
    textTertiary: 'text-[#927863]',
    sidebarBg: 'bg-[#f3edd9]/40 border border-[#d6c7b2] rounded-xl p-6 space-y-6 shadow-sm',
    filterBtnActive: 'bg-[#704214] text-[#fbf9f4] rounded-lg font-bold py-2 px-4 text-xs border border-[#704214]',
    filterBtnInactive: 'bg-transparent text-[#614530] hover:text-[#331d0b] rounded-lg border border-[#d6c7b2] hover:border-[#704214] font-semibold py-2 px-4 transition-all text-xs',
    priceFilterBg: 'bg-[#f3edd9]/40 border border-[#d6c7b2] text-[#614530] px-3 py-1.5 rounded-lg',
    priceSliderAccent: 'accent-[#704214]',
    titleFont: 'font-serif font-black tracking-tight text-[#4a2e16]',
    bodyFont: 'font-serif',
    headerLayout: 'border-b border-[#d6c7b2] pb-4',
    cardGeometry: 'rounded-xl border border-[#d6c7b2] bg-white shadow-sm hover:shadow-md hover:border-[#704214] transition-all duration-300',
    borderStyle: 'border-[#d6c7b2]',
    badgeStyle: 'bg-[#704214]/10 text-[#704214] border border-[#704214]/20 rounded-md text-[9px] font-bold uppercase',
    logoWrapper: 'w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-4 border-[#fbf9f4] bg-white shadow-sm shrink-0',
  },
  custom: {
    container: 'bg-bg-primary text-text-primary min-h-screen font-sans antialiased pb-20',
    textPrimary: 'text-text-primary',
    textSecondary: 'text-text-secondary',
    textTertiary: 'text-text-tertiary',
    sidebarBg: 'bg-bg-secondary border border-border-main rounded-3xl p-6 space-y-6',
    filterBtnActive: 'bg-text-primary text-bg-primary rounded-full py-1.5 px-4 font-medium text-xs',
    filterBtnInactive: 'bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border-main rounded-full py-1.5 px-4 transition-all text-xs',
    priceFilterBg: 'bg-bg-tertiary border border-border-main text-text-secondary px-3 py-1.5 rounded-full',
    priceSliderAccent: 'accent-text-primary',
    titleFont: 'font-serif font-bold text-2xl sm:text-3xl tracking-tight',
    bodyFont: 'font-sans',
    headerLayout: 'border-b border-border-main pb-4',
    cardGeometry: 'rounded-3xl border border-border-main bg-card-main shadow-sm hover:shadow-md transition-all duration-300',
    borderStyle: 'border-border-main',
    badgeStyle: 'bg-bg-tertiary text-text-secondary rounded-full text-[9px] font-semibold',
    logoWrapper: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-lg shrink-0',
  }
};

export const StorePage: React.FC = () => {
  const { 
    activeStoreSlug, 
    stores, 
    products, 
    currentUser, 
    favorites, 
    toggleFavoriteStore, 
    trackView,
    navigateToDashboard,
    messages,
    sendChatMessage,
    lookbooks,
    addLookbook,
    deleteLookbook,
    addLookbookBundleToCart
  } = useMarketplace();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');

  // Lookbook states
  const [isCurateOpen, setIsCurateOpen] = useState(false);
  const [curItems, setCurItems] = useState<LookbookItem[]>([]);
  const [curName, setCurName] = useState('');
  const [curDesc, setCurDesc] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const store = stores.find((s) => s.slug === activeStoreSlug);

  // Track store page view on mount
  useEffect(() => {
    if (store) {
      trackView('store', store.id);
    }
  }, [activeStoreSlug]);

  // Scroll to bottom of chat history when new message arrives
  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isChatOpen]);

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-text-primary">Boutique Not Found</h2>
        <p className="text-xs text-text-secondary">The store you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  if (store.subscriptionStatus === 'inactive') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in font-sans">
        <div className="p-8 rounded-3xl border border-border-main bg-card-main shadow-xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-text-primary">Boutique Closed</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              The boutique storefront <strong className="text-text-primary">{store.name}</strong> is temporarily unavailable as its subscription renewal is pending.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isFavorited = favorites.stores.includes(store.id);
  const isOwner = currentUser?.role === 'seller' && currentUser.storeId === store.id;
  const customerId = currentUser?.id || 'user-customer';

  // Filter messages between current customer and this store
  const chatHistory = messages.filter(
    (msg) => msg.storeId === store.id && msg.customerId === customerId
  );

  // Filter products belonging to this store
  const storeProducts = products.filter((p) => p.storeId === store.id);

  const filteredProducts = storeProducts.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesPrice = product.price <= maxPrice;
    return matchesCategory && matchesPrice;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    
    sendChatMessage(store.id, customerId, chatText.trim(), customerId, currentUser?.name || 'Alex Rivera');
    const sentText = chatText.trim();
    setChatText('');

    // Trigger mock auto-response from the boutique after 1.5 seconds
    setTimeout(() => {
      sendChatMessage(
        store.id,
        customerId,
        `Thank you for messaging ${store.name}! Our customer service team has received your inquiry about "${sentText.slice(0, 30)}${sentText.length > 30 ? '...' : ''}" and we will write back to you shortly.`,
        store.id,
        store.name
      );
    }, 1500);
  };

  const theme = store.theme || 'minimalist';
  const preset = THEME_PRESETS[theme] || THEME_PRESETS.minimalist;

  return (
    <div className={`space-y-8 animate-fade-in text-left ${preset.container}`}>
      
      {/* Banner & Logo Cover */}
      <div className="w-full relative h-64 sm:h-80 bg-bg-tertiary">
        <img
          src={store.banner}
          alt={store.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Floating details overlay */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 z-10 text-white">
          <div className="flex items-center space-x-4">
            <div className={preset.logoWrapper}>
              <img
                src={store.logo}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h1 className={`font-bold tracking-tight text-white ${preset.titleFont}`}>
                {store.name}
              </h1>
              {store.location && (
                <div className="flex items-center space-x-1 text-xs text-white/85">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{store.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavoriteStore(store.id)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-red-500 transition-all cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            
            {isOwner && (
              <button
                onClick={navigateToDashboard}
                className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:opacity-90 transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Inventory</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout (Sidebar Info + Catalog) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className={preset.sidebarBg}>
            <div className="space-y-2">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${preset.textPrimary}`}>About Boutique</h3>
              <p className={`text-xs leading-relaxed ${preset.textSecondary}`}>{store.description}</p>
            </div>

            {/* Contacts & Socials */}
            <div className={`space-y-3 pt-4 border-t ${preset.borderStyle}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${preset.textPrimary}`}>Contact Seller</h3>
              
              {store.instagram && (
                <a
                  href={`https://instagram.com/${store.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center space-x-2.5 text-xs ${preset.textSecondary} hover:${preset.textPrimary} transition-colors`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  <span>@{store.instagram}</span>
                </a>
              )}

              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/\+/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center space-x-2.5 text-xs ${preset.textSecondary} hover:${preset.textPrimary} transition-colors`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Inquiry</span>
                </a>
              )}
            </div>

            {/* Analytics Summary */}
            <div className={`pt-4 border-t ${preset.borderStyle} flex items-center justify-between text-[11px] ${preset.textTertiary}`}>
              <div className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{store.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>{store.clicks} clicks</span>
              </div>
            </div>

          </div>
        </div>

        {/* Store Catalog */}
        <div className="space-y-8 lg:col-span-3">
          
          {/* Header Filter Options */}
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${preset.headerLayout} gap-4`}>
            <div>
              <h2 className={`font-bold ${preset.titleFont}`}>Store Catalog</h2>
              <p className={`text-xs mt-1 ${preset.textSecondary}`}>{storeProducts.length} items listed by seller</p>
            </div>

            {/* Pricing Filter */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs ${preset.priceFilterBg}`}>
              <span className="font-medium">Filter Price:</span>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={`w-20 ${preset.priceSliderAccent}`}
              />
              <span className={`font-bold ${preset.textPrimary}`}>Rs. {maxPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Catalog Categories */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {['All', 'Men', 'Women', 'Kids', 'Accessories', 'Lookbooks'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  activeCategory === cat
                    ? preset.filterBtnActive
                    : preset.filterBtnInactive
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {activeCategory === 'Lookbooks' ? (
            /* Lookbooks Section */
            <div className="space-y-6 animate-fade-in">
              {/* Header with Curate button */}
              <div className="flex justify-between items-center bg-bg-secondary/40 p-4 border border-dashed rounded-3xl border-border-main">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Style Lookbooks</h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Explore curated styling inspirations from the brand and community.</p>
                </div>
                {currentUser ? (
                  <button
                    onClick={() => {
                      setCurItems([]);
                      setCurName('');
                      setCurDesc('');
                      setIsCurateOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-text-primary text-bg-primary text-[10px] font-bold hover:opacity-90 transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Curate Outfit</span>
                  </button>
                ) : (
                  <span className="text-[9px] text-text-tertiary font-medium">Sign in to curate lookbooks</span>
                )}
              </div>

              {lookbooks.filter(lb => lb.storeId === store.id).length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border-main rounded-3xl space-y-3">
                  <Sparkles className="w-7.5 h-7.5 text-text-tertiary mx-auto animate-pulse" />
                  <p className="text-xs font-semibold text-text-primary">No outfits curated yet</p>
                  <p className="text-[10px] text-text-secondary max-w-xs mx-auto">Be the first to curate a styled outfit lookbook for this boutique storefront catalog!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lookbooks.filter(lb => lb.storeId === store.id).map((lb) => {
                    const subtotal = lb.items.reduce((sum, item) => {
                      const p = products.find(prod => prod.id === item.productId);
                      return sum + (p ? p.price : 0);
                    }, 0);
                    const discountedTotal = Math.round(subtotal * 0.95);

                    return (
                      <div
                        key={lb.id}
                        className={`p-6 flex flex-col space-y-4 border ${preset.cardGeometry} bg-card-main`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-sm font-bold ${preset.textPrimary}`}>{lb.name}</h4>
                            <p className="text-[10px] text-text-secondary mt-1">{lb.description}</p>
                          </div>
                          
                          {/* Creator Badge */}
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase shrink-0 ${
                            lb.isOfficial 
                              ? 'bg-accent-main/10 text-accent-color border-accent-main/20' 
                              : 'bg-bg-secondary text-text-secondary border-border-main'
                          }`}>
                            {lb.isOfficial ? 'Brand Curator' : 'Shopper'}
                          </span>
                        </div>

                        {/* Items collage scroll */}
                        <div className="flex space-x-3 overflow-x-auto py-1 scrollbar-none">
                          {lb.items.map((item, idx) => {
                            const p = products.find(prod => prod.id === item.productId);
                            if (!p) return null;
                            return (
                              <div key={idx} className="flex items-center space-x-2 shrink-0 bg-bg-secondary/40 p-1.5 rounded-xl border border-border-main">
                                <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover rounded-lg border border-border-main" />
                                <div className="text-left">
                                  <p className="text-[9px] font-bold text-text-primary line-clamp-1 w-20">{p.name}</p>
                                  <p className="text-[8px] text-text-secondary mt-0.5">{item.selectedSize} &bull; {item.selectedColor}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t border-border-main pt-3 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-text-tertiary block">Bundle Subtotal</span>
                            <div className="flex items-baseline space-x-1.5 mt-0.5">
                              <span className={`text-[10px] text-text-tertiary line-through`}>Rs. {subtotal.toLocaleString()}</span>
                              <span className={`text-xs font-bold text-text-primary`}>Rs. {discountedTotal.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                addLookbookBundleToCart(lb.items);
                                alert('Outfit lookbook bundle added to your shopping bag! A 5% discount is applied to these items.');
                              }}
                              className="px-3 py-1.5 rounded-full bg-accent-main text-accent-fg text-[9px] font-bold hover:opacity-90 transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Add Bundle</span>
                            </button>

                            {/* Delete option if admin or store owner or lookbook creator */}
                            {(currentUser?.role === 'admin' || (currentUser?.role === 'seller' && currentUser.storeId === store.id) || currentUser?.name === lb.creatorName) && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove this lookbook styling?`)) {
                                    deleteLookbook(lb.id);
                                  }
                                }}
                                className="p-1.5 rounded-full hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-all border border-border-main cursor-pointer"
                                title="Delete Lookbook"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={`text-center py-20 border border-dashed ${preset.borderStyle} ${preset.cardGeometry.includes('rounded-none') ? 'rounded-none' : preset.cardGeometry.includes('rounded-xl') ? 'rounded-xl' : preset.cardGeometry.includes('rounded-[2rem]') ? 'rounded-[2rem]' : 'rounded-3xl'} space-y-4`}>
              <p className={`text-sm font-semibold ${preset.textPrimary}`}>No products found matching filters</p>
              
              {isOwner && (
                <button
                  onClick={navigateToDashboard}
                  className="px-4 py-2 rounded-full bg-text-primary text-bg-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center space-x-1.5 mx-auto shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Product</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Floating Chat Bubble & Conversation Drawer */}
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-4 rounded-full shadow-lg transition-transform duration-300 hover:scale-105 flex items-center justify-center cursor-pointer ${
            theme === 'minimalist' ? 'bg-neutral-900 text-white rounded-none border border-neutral-900 shadow-none' :
            theme === 'streetwear' ? 'bg-white text-black border-2 border-black font-black uppercase rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
            theme === 'linen' ? 'bg-[#5a6b5c] text-white rounded-full' :
            theme === 'leather' ? 'bg-[#704214] text-[#fbf9f4] rounded-xl border border-[#d6c7b2]' :
            'bg-text-primary text-bg-primary rounded-full hover:opacity-90'
          }`}
          title={`Chat with ${store.name}`}
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Chat Drawer/Box Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute bottom-16 right-0 w-80 sm:w-96 h-[420px] shadow-2xl flex flex-col border overflow-hidden ${
                theme === 'minimalist' ? 'bg-white border-neutral-200 rounded-none shadow-none font-serif text-neutral-900' :
                theme === 'streetwear' ? 'bg-[#181a20] border-2 border-white rounded-none shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] font-sans text-white' :
                theme === 'linen' ? 'bg-[#FAF6EE] border border-[#ebdcb9]/40 rounded-[2.5rem] font-sans text-[#3c362a]' :
                theme === 'leather' ? 'bg-[#fcfaf5] border border-[#d6c7b2] rounded-xl font-serif text-[#331d0b]' :
                'bg-card-main border border-border-main rounded-3xl font-sans text-text-primary glassmorphism'
              }`}
            >
              {/* Header */}
              <div className={`p-4 flex items-center justify-between border-b ${preset.borderStyle} ${
                theme === 'streetwear' ? 'bg-[#1e222b]' : ''
              }`}>
                <div className="flex items-center space-x-2.5">
                  <img src={store.logo} alt={store.name} className={`w-7 h-7 object-cover ${
                    theme === 'minimalist' ? 'rounded-none' :
                    theme === 'streetwear' ? 'rounded-none border border-white' :
                    theme === 'linen' ? 'rounded-full' :
                    theme === 'leather' ? 'rounded-md' :
                    'rounded-lg'
                  }`} />
                  <div>
                    <h4 className={`font-bold text-xs ${preset.textPrimary}`}>{store.name}</h4>
                    <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-ping"></span>
                      Styling Support
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className={`text-xs p-1 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer ${preset.textSecondary}`}
                >
                  ✕
                </button>
              </div>

              {/* Message Feed History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-20 space-y-2">
                    <MessageCircle className="w-6 h-6 text-text-tertiary mx-auto animate-bounce" />
                    <p className={`text-xs font-semibold ${preset.textPrimary}`}>Start a Conversation</p>
                    <p className={`text-[10px] ${preset.textSecondary} max-w-[200px] mx-auto`}>
                      Inquire about garments catalog listings, fits, shipping, or active styling.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg) => {
                    const isCustomer = msg.senderId === customerId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 text-xs leading-relaxed ${
                            isCustomer
                              ? theme === 'minimalist' ? 'bg-neutral-900 text-white rounded-none' :
                                theme === 'streetwear' ? 'bg-white text-black font-bold rounded-none border border-black' :
                                theme === 'linen' ? 'bg-[#5a6b5c] text-white rounded-2xl rounded-tr-none' :
                                theme === 'leather' ? 'bg-[#704214] text-[#fbf9f4] rounded-lg rounded-tr-none' :
                                'bg-text-primary text-bg-primary rounded-2xl rounded-tr-none'
                              : theme === 'minimalist' ? 'bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-none' :
                                theme === 'streetwear' ? 'bg-[#222430] text-white font-semibold rounded-none border border-neutral-700' :
                                theme === 'linen' ? 'bg-[#f4efe3] text-[#3c362a] rounded-2xl rounded-tl-none border border-[#ebdcb9]/30' :
                                theme === 'leather' ? 'bg-[#f3edd9]/40 text-[#614530] rounded-lg rounded-tl-none border border-[#d6c7b2]' :
                                'bg-bg-secondary border border-border-main text-text-primary rounded-2xl rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className={`text-[8px] mt-1 ${preset.textTertiary}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input composer */}
              <form onSubmit={handleSend} className={`p-3 border-t ${preset.borderStyle} flex space-x-2`}>
                <input
                  type="text"
                  placeholder="Type styling request..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  className={`flex-grow p-2 text-xs border focus:outline-none ${
                    theme === 'minimalist' ? 'bg-white border-neutral-200 rounded-none focus:border-neutral-900 font-serif' :
                    theme === 'streetwear' ? 'bg-[#222430] border-2 border-white text-white rounded-none focus:border-yellow-400 font-mono' :
                    theme === 'linen' ? 'bg-white border-[#ebdcb9]/40 rounded-full focus:border-[#5a6b5c] px-3' :
                    theme === 'leather' ? 'bg-[#fcfaf5] border border-[#d6c7b2] rounded-lg focus:border-[#704214] px-3' :
                    'bg-bg-secondary border border-border-main rounded-xl focus:border-text-primary'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    theme === 'minimalist' ? 'bg-neutral-900 text-white rounded-none hover:bg-neutral-800' :
                    theme === 'streetwear' ? 'bg-white text-black border-2 border-black rounded-none hover:bg-yellow-400' :
                    theme === 'linen' ? 'bg-[#5a6b5c] text-white rounded-full hover:opacity-90 px-4' :
                    theme === 'leather' ? 'bg-[#704214] text-[#fcfaf5] rounded-lg hover:opacity-90' :
                    'bg-text-primary text-bg-primary rounded-xl hover:opacity-90 shadow-sm'
                  }`}
                >
                  Send
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Curate Outfit Modal Overlay */}
      <AnimatePresence>
        {isCurateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCurateOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-border-main bg-card-main p-6 sm:p-8 shadow-2xl flex flex-col text-left font-sans text-text-primary"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCurateOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-bg-tertiary transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] tracking-wider uppercase font-bold text-accent-main">Boutique Styling Canvas</span>
                <h3 className="font-serif text-xl font-bold text-text-primary">Curate Outfit Lookbook</h3>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 pr-1">
                {/* Left Column: Store Catalog list */}
                <div className="space-y-3 flex flex-col min-h-0">
                  <span className="text-[10px] font-bold uppercase text-text-secondary">Store Catalog Selection</span>
                  <div className="flex-1 overflow-y-auto border border-border-main rounded-2xl bg-bg-secondary/30 p-4 space-y-3 scrollbar-none">
                    {storeProducts.map((p) => {
                      return (
                        <div key={p.id} className="p-3 bg-card-main border border-border-main rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover rounded-lg border border-border-main shrink-0" />
                            <div className="text-left min-w-0">
                              <p className="text-xs font-semibold text-text-primary truncate">{p.name}</p>
                              <p className="text-[10px] text-text-secondary">Rs. {p.price.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const size = p.variants[0]?.size || 'M';
                                const color = p.variants[0]?.color || 'Neutral';
                                
                                const alreadyAdded = curItems.some(
                                  item => item.productId === p.id && item.selectedSize === size && item.selectedColor === color
                                );
                                if (alreadyAdded) {
                                  alert('This garment selection has already been added to your lookbook canvas.');
                                  return;
                                }

                                setCurItems([...curItems, {
                                  productId: p.id,
                                  selectedSize: size,
                                  selectedColor: color
                                }]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-bg-tertiary text-text-primary border border-border-main hover:bg-text-primary hover:text-bg-primary text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                            >
                              Add to Outfit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Styling Canvas */}
                <div className="space-y-3 flex flex-col min-h-0">
                  <span className="text-[10px] font-bold uppercase text-text-secondary">Active Styling Canvas ({curItems.length} items)</span>
                  <div className="flex-1 overflow-y-auto border border-border-main rounded-2xl bg-bg-secondary/40 p-4 space-y-3 scrollbar-none flex flex-col justify-start">
                    {curItems.length === 0 ? (
                      <div className="text-center py-16 text-text-tertiary my-auto">
                        <Sparkles className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                        <p className="text-[10px] font-semibold text-text-secondary">Canvas is empty</p>
                        <p className="text-[9px] max-w-[180px] mx-auto mt-0.5">Select garments from the boutique catalog on the left to start compiling your styling board.</p>
                      </div>
                    ) : (
                      curItems.map((item, idx) => {
                        const p = products.find(prod => prod.id === item.productId);
                        if (!p) return null;
                        return (
                          <div key={idx} className="p-3 bg-card-main border border-border-main rounded-xl flex items-center justify-between gap-3 animate-slide-up">
                            <div className="flex items-center space-x-3">
                              <img src={p.images[0]} alt={p.name} className="w-9 h-11 object-cover rounded-lg border border-border-main" />
                              <div className="text-left">
                                <p className="text-xs font-semibold text-text-primary line-clamp-1">{p.name}</p>
                                <div className="flex space-x-2 mt-1">
                                  <select
                                    value={item.selectedColor}
                                    onChange={(e) => {
                                      const updated = [...curItems];
                                      updated[idx].selectedColor = e.target.value;
                                      setCurItems(updated);
                                    }}
                                    className="p-0.5 bg-bg-secondary text-[8px] font-bold rounded border border-border-main focus:outline-none"
                                  >
                                    {Array.from(new Set(p.variants.map(v => v.color))).map(col => (
                                      <option key={col} value={col}>{col}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={item.selectedSize}
                                    onChange={(e) => {
                                      const updated = [...curItems];
                                      updated[idx].selectedSize = e.target.value;
                                      setCurItems(updated);
                                    }}
                                    className="p-0.5 bg-bg-secondary text-[8px] font-bold rounded border border-border-main focus:outline-none"
                                  >
                                    {Array.from(new Set(p.variants.map(v => v.size))).map(sz => (
                                      <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setCurItems(curItems.filter((_, i) => i !== idx))}
                              className="p-1 rounded-full hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-all border border-border-main cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Subtitle & Form fields */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (curItems.length < 2) {
                    alert('Please select at least 2 garments to curate an outfit.');
                    return;
                  }
                  if (!curName.trim() || !curDesc.trim()) {
                    alert('Please enter lookbook name and description.');
                    return;
                  }

                  const isBrandOfficial = currentUser?.role === 'seller' && currentUser?.storeId === store.id;
                  const creatorNickname = currentUser?.name || 'Shopper Stylist';
                  
                  addLookbook(store.id, curName.trim(), curDesc.trim(), curItems, creatorNickname, isBrandOfficial);
                  
                  setIsCurateOpen(false);
                  setCurItems([]);
                  setCurName('');
                  setCurDesc('');
                  alert('Lookbook successfully saved!');
                }}
                className="mt-6 pt-4 border-t border-border-main space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Lookbook Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Linen Cruise Layering"
                      value={curName}
                      onChange={(e) => setCurName(e.target.value)}
                      className="w-full p-2 bg-bg-secondary border border-border-main rounded-xl text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Aesthetic Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Soft warm tones pairing structural elements with breathable fibers..."
                      value={curDesc}
                      onChange={(e) => setCurDesc(e.target.value)}
                      className="w-full p-2 bg-bg-secondary border border-border-main rounded-xl text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-text-tertiary block">Bundle subtotal (5% off applied)</span>
                    <span className="text-sm font-bold text-text-primary">
                      Rs. {Math.round(
                        curItems.reduce((sum, item) => {
                          const p = products.find(prod => prod.id === item.productId);
                          return sum + (p ? p.price : 0);
                        }, 0) * 0.95
                      ).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                  >
                    Save Lookbook Look
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
