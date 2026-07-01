import React, { useState } from 'react';
import { useMarketplace, type Product } from '../context/MarketplaceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Trash2, Layers, ZoomIn, ZoomOut, Move,
  ShoppingBag, Check, Plus, RefreshCw, Bookmark
} from 'lucide-react';

interface CanvasItem {
  id: string; // Unique canvas element ID
  product: Product;
  x: number; // Percent from left (0 - 100)
  y: number; // Percent from top (0 - 100)
  scale: number; // Scale multiplier (e.g. 1.0)
  zIndex: number;
}

export const StyleStudio: React.FC = () => {
  const { products, addToCart, navigateToCheckout, addLookbook, currentUser } = useMarketplace();

  // Page States
  const [activeCategory, setActiveCategory] = useState<'all' | 'tops' | 'bottoms' | 'outerwear' | 'footwear'>('all');
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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
  const handleAddProductToCanvas = (product: Product) => {
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
      x: 50, // center
      y: defaultY,
      scale: 1.0,
      zIndex: defaultZIndex
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

  // Action: Add all outfit items to shopping cart and proceed to Checkout
  const handleBuyOutfit = () => {
    if (canvasItems.length === 0) {
      alert("Please add items to your styling canvas first.");
      return;
    }
    
    canvasItems.forEach(item => {
      // Add items with default size and color from its variants list
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[90vh] space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-main animate-pulse" />
            <span>Style Studio</span>
          </h1>
          <p className="text-xs text-text-secondary">
            Visual Dress-up Room: Mix-and-match apparel overlays from boutiques and bundle checkout
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
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
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
                    className="p-1.5 rounded-xl bg-accent-main text-accent-fg hover:opacity-90 transition-all cursor-pointer"
                    title="Add to Canvas"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Draggable Style Canvas - Center Column (lg:5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative w-full aspect-[3/4] bg-bg-secondary border border-border-main rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
            
            {/* Mannequin Silhouette Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
              <svg className="w-2/3 h-2/3 text-text-primary" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="18" r="7" />
                <path d="M50 26c-10 0-16 4-18 10l-2 15c-1 3 1 5 3 4l4-2v27c0 3 2 5 5 5h16c3 0 5-2 5-5V53l4 2c2 1 4-1 3-4l-2-15c-2-6-8-10-18-10z" />
                <rect x="42" y="80" width="5" height="15" rx="1.5" />
                <rect x="53" y="80" width="5" height="15" rx="1.5" />
              </svg>
            </div>

            {/* Instruction placeholder when empty */}
            {canvasItems.length === 0 && (
              <div className="absolute text-center p-6 space-y-2 pointer-events-none">
                <p className="font-serif text-sm text-text-secondary">Your Canvas is Empty</p>
                <p className="text-[10px] text-text-tertiary max-w-xs mx-auto">
                  Click the "+" buttons on catalog items to place them on the styling room mannequin.
                </p>
              </div>
            )}

            {/* Canvas Items Rendering */}
            <AnimatePresence>
              {canvasItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: item.scale }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: item.zIndex,
                    }}
                    className={`cursor-pointer group transition-shadow ${
                      isSelected 
                        ? 'ring-2 ring-accent-main rounded-2xl shadow-xl' 
                        : 'hover:ring-1 hover:ring-accent-main/40 hover:rounded-2xl'
                    }`}
                  >
                    <img 
                      src={item.product.images?.[0] || 'https://via.placeholder.com/150'} 
                      alt={item.product.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain select-none pointer-events-none"
                    />
                    
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-accent-main text-accent-fg p-1 rounded-full shadow">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Draggable Transformation Control Console */}
          <div className="bg-card-main border border-border-main rounded-3xl p-4 space-y-4">
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
                {/* Movement Coordinates Control Panel */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                    <Move className="w-3 h-3" /> Position Coordinates
                  </span>
                  <div className="grid grid-cols-3 gap-1 max-w-[140px]">
                    <div />
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, y: Math.max(10, it.y - 4) }))}
                      className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ▲
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, x: Math.max(10, it.x - 4) }))}
                      className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ◀
                    </button>
                    <div className="p-1 text-center text-[10px] text-text-tertiary font-bold select-none">XY</div>
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, x: Math.min(90, it.x + 4) }))}
                      className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ▶
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => updateSelectedItem(it => ({ ...it, y: Math.min(90, it.y + 4) }))}
                      className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-[10px] font-bold cursor-pointer text-center"
                    >
                      ▼
                    </button>
                    <div />
                  </div>
                </div>

                {/* Layering & Scale Scaling Slider tools */}
                <div className="space-y-3.5">
                  {/* Scaling Scale */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" /> Size Scale
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, scale: Math.max(0.5, it.scale - 0.1) }))}
                        className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary cursor-pointer"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-text-primary font-bold min-w-[30px] text-center">
                        {Math.round(selectedItem.scale * 100)}%
                      </span>
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, scale: Math.min(2.0, it.scale + 0.1) }))}
                        className="p-1 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary cursor-pointer"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* ZIndex Layering */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Z-Index Layer
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, zIndex: Math.max(1, it.zIndex - 1) }))}
                        className="px-2 py-0.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-[10px] font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <span className="text-[10px] text-text-primary font-bold min-w-[20px] text-center">
                        {selectedItem.zIndex}
                      </span>
                      <button 
                        onClick={() => updateSelectedItem(it => ({ ...it, zIndex: Math.min(20, it.zIndex + 1) }))}
                        className="px-2 py-0.5 rounded bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-[10px] font-bold cursor-pointer"
                      >
                        Front
                      </button>
                    </div>
                  </div>

                  {/* Trash */}
                  <button
                    onClick={() => handleRemoveItem(selectedItem.id)}
                    className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Layer</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-text-tertiary py-4 text-center leading-relaxed">
                Click any item placed on the mannequin canvas above to activate transform, layering, and scale tools.
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
