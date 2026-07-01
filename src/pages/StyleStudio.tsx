import React, { useState } from 'react';
import { useMarketplace, type Product } from '../context/MarketplaceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Trash2, Layers, ZoomIn, ZoomOut, Move,
  ShoppingBag, Check, Plus, RefreshCw, Bookmark,
  RotateCw, FlipHorizontal, Map, Compass
} from 'lucide-react';

interface CanvasItem {
  id: string; // Unique canvas element ID
  product: Product;
  x: number; // Percent from left (0 - 100)
  y: number; // Percent from top (0 - 100)
  scale: number; // Scale multiplier (e.g. 1.0)
  zIndex: number;
  rotate: number; // Rotation degrees (0 - 360)
  isFlipped: boolean; // Horizontal mirror state
}

type SceneBackdrop = 'minimal' | 'cafe' | 'runway' | 'street';

export const StyleStudio: React.FC = () => {
  const { products, addToCart, navigateToCheckout, addLookbook, currentUser } = useMarketplace();

  // Page States
  const [activeCategory, setActiveCategory] = useState<'all' | 'tops' | 'bottoms' | 'outerwear' | 'footwear'>('all');
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Custom Backdrop Environment
  const [scene, setScene] = useState<SceneBackdrop>('minimal');

  // Dragging states
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  // Lookbook creation states
  const [isSavingLookbook, setIsSavingLookbook] = useState(false);
  const [lookbookTitle, setLookbookTitle] = useState('');
  const [lookbookDesc, setLookbookDesc] = useState('');

  // Group real products by category tags for selection sidebar
  const getProductCategory = (p: Product): 'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'other' => {
    const name = p.name.toLowerCase();
    const cat = (p.category || '').toLowerCase();
    
    if (name.includes('shoe') || name.includes('boot') || name.includes('sneaker') || name.includes('heel') || cat.includes('footwear') || cat.includes('shoe')) {
      return 'footwear';
    }
    if (name.includes('pant') || name.includes('jeans') || name.includes('trouser') || name.includes('skirt') || name.includes('shorts') || cat.includes('bottom')) {
      return 'bottoms';
    }
    if (name.includes('jacket') || name.includes('coat') || name.includes('trench') || name.includes('blazer') || name.includes('outerwear') || cat.includes('outer')) {
      return 'outerwear';
    }
    return 'tops'; // Default fallback
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'all') return true;
    return getProductCategory(p) === activeCategory;
  });

  // Action: Add product to canvas
  const handleAddProductToCanvas = (product: Product, customX?: number, customY?: number, customZ?: number) => {
    const category = getProductCategory(product);
    
    // Assign reasonable default layering coordinates depending on item category
    let defaultY = 45; // middle / tops
    let defaultZIndex = 5;
    if (category === 'footwear') {
      defaultY = 80;
      defaultZIndex = 3;
    } else if (category === 'bottoms') {
      defaultY = 60;
      defaultZIndex = 4;
    } else if (category === 'outerwear') {
      defaultY = 43;
      defaultZIndex = 6; // Outer coats layer on top
    }

    const newItem: CanvasItem = {
      id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product,
      x: customX !== undefined ? customX : 50, // center
      y: customY !== undefined ? customY : defaultY,
      scale: 1.0,
      zIndex: customZ !== undefined ? customZ : defaultZIndex,
      rotate: 0,
      isFlipped: false
    };

    setCanvasItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id); // Auto-select new item
  };

  // Action: Modify selected item coordinates / properties
  const updateSelectedItem = (updater: (item: CanvasItem) => CanvasItem) => {
    if (!selectedItemId) return;
    setCanvasItems(prev => prev.map(item => item.id === selectedItemId ? updater(item) : item));
  };

  const handleRemoveItem = (id: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleClearCanvas = () => {
    setCanvasItems([]);
    setSelectedItemId(null);
  };

  // Pointer event handlers for mobile/desktop dragging (Unified Pointer API)
  const handlePointerDown = (e: React.PointerEvent, item: CanvasItem) => {
    e.preventDefault();
    setSelectedItemId(item.id);
    setDraggedItemId(item.id);

    const canvasEl = document.getElementById('style-canvas-container');
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();

    // Convert pointer coordinate to percentage of canvas dimension
    const pointerX = ((e.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((e.clientY - rect.top) / rect.height) * 100;

    // Calculate mouse click offset relative to current item percentage center
    setDragStartOffset({
      x: pointerX - item.x,
      y: pointerY - item.y
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent, item: CanvasItem) => {
    if (draggedItemId !== item.id) return;

    const canvasEl = document.getElementById('style-canvas-container');
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();

    const pointerX = ((e.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((e.clientY - rect.top) / rect.height) * 100;

    let newX = Math.round(pointerX - dragStartOffset.x);
    let newY = Math.round(pointerY - dragStartOffset.y);

    // Keep item within visual boundaries
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));

    updateSelectedItem(it => ({ ...it, x: newX, y: newY }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggedItemId(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Style Presets - Loads pre-composed outfit dynamically searching your catalog!
  const handleApplyPreset = (presetType: 'streetwear' | 'brunch' | 'gala') => {
    handleClearCanvas();

    // Find items matching tags/names in catalog
    const findProduct = (cat: 'tops' | 'bottoms' | 'outerwear' | 'footwear', matchTerms: string[]): Product | undefined => {
      return products.find(p => {
        const pCat = getProductCategory(p);
        if (pCat !== cat) return false;
        const name = p.name.toLowerCase();
        return matchTerms.some(term => name.includes(term));
      }) || products.find(p => getProductCategory(p) === cat); // Fallback to first in category
    };

    if (presetType === 'streetwear') {
      const coat = findProduct('outerwear', ['trench', 'jacket', 'coat']);
      const top = findProduct('tops', ['knit', 'sweater', 'tee', 'hoodie']);
      const bottom = findProduct('bottoms', ['jeans', 'pant', 'cargo']);
      const shoes = findProduct('footwear', ['sneaker', 'boots', 'shoes']);

      if (bottom) handleAddProductToCanvas(bottom, 50, 62, 3);
      if (top) handleAddProductToCanvas(top, 50, 43, 4);
      if (coat) handleAddProductToCanvas(coat, 50, 42, 5);
      if (shoes) handleAddProductToCanvas(shoes, 50, 82, 2);
    } 
    else if (presetType === 'brunch') {
      const top = findProduct('tops', ['blouse', 'shirt', 'linen']);
      const bottom = findProduct('bottoms', ['skirt', 'trousers', 'pants']);
      const shoes = findProduct('footwear', ['heel', 'sandal', 'shoes']);

      if (bottom) handleAddProductToCanvas(bottom, 50, 60, 3);
      if (top) handleAddProductToCanvas(top, 50, 42, 4);
      if (shoes) handleAddProductToCanvas(shoes, 50, 81, 2);
    } 
    else { // gala
      const coat = findProduct('outerwear', ['blazer', 'suit', 'jacket']);
      const top = findProduct('tops', ['shirt', 'knit']);
      const bottom = findProduct('bottoms', ['pants', 'trousers']);
      const shoes = findProduct('footwear', ['boots', 'shoes', 'oxford']);

      if (bottom) handleAddProductToCanvas(bottom, 50, 64, 3);
      if (top) handleAddProductToCanvas(top, 50, 45, 4);
      if (coat) handleAddProductToCanvas(coat, 50, 43, 5);
      if (shoes) handleAddProductToCanvas(shoes, 50, 83, 2);
    }
  };

  // Action: Add all outfit items to shopping cart and proceed to Checkout
  const handleBuyOutfit = () => {
    if (canvasItems.length === 0) {
      alert("Please add items to your styling canvas first.");
      return;
    }
    
    canvasItems.forEach(item => {
      const size = item.product.variants?.[0]?.size || 'M';
      const color = item.product.variants?.[0]?.color || 'Default';
      addToCart(item.product.id, size, color, 1);
    });

    alert("Awesome! All styling items have been added to your shopping bag. Redirecting to Checkout...");
    navigateToCheckout();
  };

  // Action: Save outfit layout as a public Lookbook showcase
  const handleSaveLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (canvasItems.length === 0) return;
    if (!lookbookTitle.trim()) {
      alert("Please enter a title for your lookbook.");
      return;
    }

    const firstItemStoreId = canvasItems[0].product.storeId || 'store-1';
    
    const items = canvasItems.map(item => ({
      productId: item.product.id,
      selectedColor: item.product.variants?.[0]?.color || 'Default',
      selectedSize: item.product.variants?.[0]?.size || 'M'
    }));

    const pins = canvasItems.map(item => ({
      productId: item.product.id,
      x: item.x,
      y: item.y
    }));

    await addLookbook(
      firstItemStoreId,
      lookbookTitle.trim(),
      lookbookDesc.trim() || "A custom ensemble styled in our Visual Wardrobe Canvas.",
      items,
      currentUser?.name || "Independent Stylist",
      false, // Official
      canvasItems[0].product.images?.[0], // Cover image fallback
      pins
    );

    alert("Stylist Lookbook saved successfully! Check the Lookbooks page to view it.");
    setLookbookTitle('');
    setLookbookDesc('');
    setIsSavingLookbook(false);
  };

  // Compute stats
  const totalPrice = canvasItems.reduce((sum, item) => sum + item.product.price, 0);
  const selectedItem = canvasItems.find(item => item.id === selectedItemId);

  // Background CSS styles mapping based on selected scene
  const getSceneBackgroundClass = () => {
    switch(scene) {
      case 'cafe':
        return 'bg-gradient-to-b from-[#4d3227] to-[#1c120c] border-[#ffd5a1]/20';
      case 'runway':
        return 'bg-gradient-to-b from-[#1a1c24] via-[#090b10] to-[#010103] border-cyan-500/20';
      case 'street':
        return 'bg-gradient-to-b from-[#3a3d46] to-[#191a1f] border-red-500/20';
      case 'minimal':
      default:
        return 'bg-bg-secondary border-border-main';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[90vh] space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-main animate-pulse" />
            <span>Advanced Style Studio</span>
          </h1>
          <p className="text-xs text-text-secondary">
            Drag & drop items onto the canvas, rotate, flip, and customize styling environments.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleClearCanvas}
            className="flex-1 md:flex-none px-4 py-2 border border-border-main bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Canvas</span>
          </button>
          <button 
            onClick={() => setIsSavingLookbook(true)}
            disabled={canvasItems.length === 0}
            className="flex-1 md:flex-none px-4 py-2 border border-accent-main/20 bg-accent-main/10 text-accent-main hover:bg-accent-main/25 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Outfit</span>
          </button>
        </div>
      </div>

      {/* Preset Inspirations Row */}
      <div className="p-4 bg-card-main border border-border-main rounded-3xl space-y-3">
        <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-accent-main" />
          <span>Style Preset Templates (Auto-Compose Layouts)</span>
        </h3>
        <div className="flex gap-2.5">
          <button
            onClick={() => handleApplyPreset('streetwear')}
            className="px-3.5 py-1.5 bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold uppercase rounded-xl border border-border-main cursor-pointer"
          >
            😎 Streetwear Vibe
          </button>
          <button
            onClick={() => handleApplyPreset('brunch')}
            className="px-3.5 py-1.5 bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold uppercase rounded-xl border border-border-main cursor-pointer"
          >
            ☕ Summer Brunch
          </button>
          <button
            onClick={() => handleApplyPreset('gala')}
            className="px-3.5 py-1.5 bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold uppercase rounded-xl border border-border-main cursor-pointer"
          >
            ✨ Kathmandu Gala
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Product Catalog Selector - Left Column (lg:4) */}
        <div className="lg:col-span-4 bg-card-main border border-border-main rounded-3xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Apparel Wardrobe</h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-border-main pb-3">
            {(['all', 'tops', 'bottoms', 'outerwear', 'footwear'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-text-primary text-bg-primary font-bold'
                    : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items List */}
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <p className="text-[11px] text-text-tertiary py-8 text-center">No apparel items in this category.</p>
            ) : (
              filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className="flex items-center gap-3 p-2 bg-bg-secondary/40 hover:bg-bg-tertiary border border-border-main/50 rounded-2xl transition-all"
                >
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/80'} 
                    alt={product.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-border-main/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{product.name}</p>
                    <p className="text-[10px] text-text-secondary">Rs. {product.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleAddProductToCanvas(product)}
                    className="px-2.5 py-1.5 rounded-xl bg-accent-main text-accent-fg hover:opacity-90 transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                    title="Add to Canvas"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Add</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visual Styling Canvas - Center Column (lg:5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Backdrop Environment Switcher */}
          <div className="flex items-center justify-between p-3 bg-card-main border border-border-main rounded-2xl text-xs">
            <span className="font-semibold text-text-secondary flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-accent-main" /> Backdrop Scene:
            </span>
            <div className="flex gap-1.5">
              {(['minimal', 'cafe', 'runway', 'street'] as const).map(sc => (
                <button
                  key={sc}
                  onClick={() => setScene(sc)}
                  className={`px-2 py-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    scene === sc
                      ? 'bg-text-primary text-bg-primary font-bold'
                      : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Styling Board */}
          <div 
            id="style-canvas-container"
            onClick={() => setSelectedItemId(null)}
            className={`relative w-full aspect-[3/4] border rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300 ${getSceneBackgroundClass()}`}
          >
            
            {/* Mannequin Silhouette Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none select-none z-0">
              {scene === 'cafe' && (
                <div className="absolute top-4 inset-x-0 flex justify-around text-yellow-300/40 text-[9px] font-bold tracking-widest animate-pulse uppercase">
                  <span>✨ Kathmandu Coffee Lounge ✨</span>
                </div>
              )}
              {scene === 'runway' && (
                <div className="absolute inset-x-0 bottom-4 text-center text-cyan-400/40 text-[9px] font-bold tracking-widest animate-pulse uppercase">
                  <span>⚡ Runway Spotlight On ⚡</span>
                </div>
              )}
              {scene === 'street' && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-red-500/20 text-[9px] font-bold font-mono tracking-widest uppercase">
                  <span>[LAZIMPAT BOULEVARD]</span>
                  <span className="text-right">[STREETSTYLE EDIT]</span>
                </div>
              )}
              <svg className="w-2/3 h-2/3 text-text-primary" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="18" r="7" />
                <path d="M50 26c-10 0-16 4-18 10l-2 15c-1 3 1 5 3 4l4-2v27c0 3 2 5 5 5h16c3 0 5-2 5-5V53l4 2c2 1 4-1 3-4l-2-15c-2-6-8-10-18-10z" />
                <rect x="42" y="80" width="5" height="15" rx="1.5" />
                <rect x="53" y="80" width="5" height="15" rx="1.5" />
              </svg>
            </div>

            {/* Instruction placeholder when empty */}
            {canvasItems.length === 0 && (
              <div className="absolute text-center p-6 space-y-2 pointer-events-none z-10">
                <p className="font-serif text-sm text-text-secondary">Visual Styling Room</p>
                <p className="text-[10px] text-text-tertiary max-w-xs mx-auto">
                  Click "+ Add" on items, then drag them on the canvas directly to style your look!
                </p>
              </div>
            )}

            {/* Interactive Drag/Resize element layers */}
            {canvasItems.map((item) => {
              const isSelected = item.id === selectedItemId;
              return (
                <div
                  key={item.id}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  onPointerMove={(e) => handlePointerMove(e, item)}
                  onPointerUp={(e) => handlePointerUp(e)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: `translate(-50%, -50%) scale(${item.scale}) scaleX(${item.isFlipped ? -1 : 1}) rotate(${item.rotate}deg)`,
                    zIndex: item.zIndex,
                    touchAction: 'none' // Prevent browser scrolling while dragging
                  }}
                  className={`cursor-grab active:cursor-grabbing group select-none transition-shadow ${
                    isSelected 
                      ? 'ring-2 ring-accent-main rounded-2xl shadow-2xl p-1 bg-white/5 backdrop-blur-[1px]' 
                      : 'hover:ring-1 hover:ring-accent-main/40 hover:rounded-2xl'
                  }`}
                >
                  <img 
                    src={item.product.images?.[0] || 'https://via.placeholder.com/150'} 
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain pointer-events-none"
                  />
                  
                  {isSelected && (
                    <div className="absolute -top-2.5 -right-2.5 bg-accent-main text-accent-fg p-1.5 rounded-full shadow border border-bg-primary">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Draggable Transformation Control Console */}
          <div className="bg-card-main border border-border-main rounded-3xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex justify-between items-center">
              <span>Canvas Tool Controls</span>
              {selectedItem && (
                <span className="text-[10px] text-accent-main font-bold truncate max-w-[200px]">
                  Editing: {selectedItem.product.name}
                </span>
              )}
            </h3>

            {selectedItem ? (
              <div className="grid grid-cols-2 gap-4">
                
                {/* Position Controls */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                    <Move className="w-3 h-3" /> Position Coordinates
                  </span>
                  <div className="grid grid-cols-3 gap-1 max-w-[140px]">
                    <div />
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, y: Math.max(5, it.y - 3) }))}
                      className="p-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ▲
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, x: Math.max(5, it.x - 3) }))}
                      className="p-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ◀
                    </button>
                    <div className="p-1.5 text-center text-[10px] text-text-tertiary font-bold select-none">XY</div>
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, x: Math.min(95, it.x + 3) }))}
                      className="p-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ▶
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, y: Math.min(95, it.y + 3) }))}
                      className="p-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ▼
                    </button>
                    <div />
                  </div>
                </div>

                {/* Layering & Scale Scaling Slider tools */}
                <div className="space-y-3.5">
                  {/* Size Scale */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" /> Size Scale
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, scale: Math.max(0.5, it.scale - 0.1) }))}
                        className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary cursor-pointer"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-text-primary font-bold min-w-[30px] text-center">
                        {Math.round(selectedItem.scale * 100)}%
                      </span>
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, scale: Math.min(2.0, it.scale + 0.1) }))}
                        className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rotation Tool */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Rotate Element
                    </span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="360"
                        value={selectedItem.rotate}
                        onChange={(e) => updateSelectedItem(it => ({ ...it, rotate: parseInt(e.target.value) }))}
                        className="w-full accent-accent-main cursor-pointer"
                      />
                      <span className="text-[9px] text-text-primary font-mono min-w-[25px] text-right">{selectedItem.rotate}°</span>
                    </div>
                  </div>

                  {/* Flip / Layer / Trash row */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => updateSelectedItem(it => ({ ...it, isFlipped: !it.isFlipped }))}
                      className="py-1 px-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-main/60 text-text-secondary hover:text-text-primary font-bold text-[9px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Mirror Flip"
                    >
                      <FlipHorizontal className="w-3 h-3" />
                      <span>Flip</span>
                    </button>
                    <button
                      onClick={() => handleRemoveItem(selectedItem.id)}
                      className="py-1 px-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 font-bold text-[9px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* ZIndex Depth */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Layer Depth
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, zIndex: Math.max(1, it.zIndex - 1) }))}
                        className="px-2 py-0.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-[9px] font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <span className="text-[10px] text-text-primary font-bold min-w-[20px] text-center">
                        {selectedItem.zIndex}
                      </span>
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, zIndex: Math.min(20, it.zIndex + 1) }))}
                        className="px-2 py-0.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-[9px] font-bold cursor-pointer"
                      >
                        Front
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <p className="text-[10px] text-text-tertiary py-4 text-center leading-relaxed">
                *Stylist Tip: You can drag clothes directly on the canvas using your mouse or finger! Click any layer to rotate, flip, resize, or delete it.
              </p>
            )}
          </div>
        </div>

        {/* Outfit Summary and Purchase Portal - Right Column (lg:3) */}
        <div className="lg:col-span-3 bg-bg-secondary border border-border-main rounded-3xl p-5 space-y-6">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-main pb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-text-secondary" />
            <span>Outfit Bundle</span>
          </h2>

          {/* Added elements lists */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {canvasItems.length === 0 ? (
              <p className="text-[11px] text-text-tertiary py-4 text-center">No layers styled yet.</p>
            ) : (
              canvasItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-text-primary truncate">{item.product.name}</p>
                    <p className="text-[9px] text-text-secondary">Layer depth: {item.zIndex}</p>
                  </div>
                  <span className="font-bold text-text-primary whitespace-nowrap pl-2">
                    Rs. {item.product.price.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pricing calculations */}
          <div className="border-t border-border-main pt-4 space-y-3">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Styled Items:</span>
              <span className="font-semibold">{canvasItems.length}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-text-primary border-t border-border-main border-dashed pt-3 mt-1">
              <span>Total Bundle Price:</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Checkout Bundle Trigger */}
          <button
            onClick={handleBuyOutfit}
            disabled={canvasItems.length === 0}
            className="w-full py-3 rounded-2xl bg-text-primary text-bg-primary hover:opacity-95 font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy Outfit Bundle</span>
          </button>
        </div>

      </div>

      {/* Save Lookbook Modal Overlay */}
      <AnimatePresence>
        {isSavingLookbook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavingLookbook(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-card-main border border-border-main p-6 rounded-3xl shadow-2xl space-y-4 z-10 text-left font-sans"
            >
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-text-primary">Save Custom Lookbook</h3>
                <p className="text-[10px] text-text-secondary">Publish this styled outfit to public showcases</p>
              </div>

              <form onSubmit={handleSaveLookbook} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-text-secondary">Lookbook Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Layered Minimalist Winter"
                    value={lookbookTitle}
                    onChange={(e) => setLookbookTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-main"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-text-secondary">Outfit Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the aesthetic inspiration behind this styling..."
                    value={lookbookDesc}
                    onChange={(e) => setLookbookDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-main rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-main resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSavingLookbook(false)}
                    className="flex-1 py-2 rounded-xl bg-bg-tertiary text-text-secondary text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-text-primary text-bg-primary text-xs font-bold hover:opacity-90 cursor-pointer"
                  >
                    Publish Look
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
