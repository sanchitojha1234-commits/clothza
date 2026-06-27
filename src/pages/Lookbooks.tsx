import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import type { Lookbook, Product } from '../context/MarketplaceContext';
import { 
  Search, ShoppingBag, X, Check, 
  Store, User, Eye, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Lookbooks: React.FC = () => {
  const { 
    lookbooks, 
    products, 
    stores, 
    addToCart, 
    navigateToStore, 
    navigateToProduct 
  } = useMarketplace();

  const [selectedLookbook, setSelectedLookbook] = useState<Lookbook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'official' | 'designer'>('all');
  
  // State inside modal
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [itemSelections, setItemSelections] = useState<{ [productId: string]: { size: string; color: string } }>({});
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Helper to find store details
  const getStoreForLookbook = (storeId: string) => {
    return stores.find(s => s.id === storeId);
  };

  // Helper to resolve product
  const getProduct = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  // Filter lookbooks based on query and active filter tab
  const filteredLookbooks = lookbooks.filter(lb => {
    const store = getStoreForLookbook(lb.storeId);
    const storeName = store?.name || '';
    
    // Check if lookbook has valid products in database
    const hasValidProducts = lb.items.some(item => getProduct(item.productId) !== undefined);
    if (!hasValidProducts) return false;

    const matchesSearch = 
      lb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lb.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = 
      filterTab === 'all' ||
      (filterTab === 'official' && lb.isOfficial) ||
      (filterTab === 'designer' && !lb.isOfficial);

    return matchesSearch && matchesTab;
  });

  // Open modal and initialize bundle state
  const handleOpenLookbook = (lb: Lookbook) => {
    setSelectedLookbook(lb);
    setIsAddedSuccess(false);

    // Filter to products that actually exist in catalog
    const validProductIds = lb.items
      .filter(item => getProduct(item.productId) !== undefined)
      .map(item => item.productId);

    setSelectedProductIds(validProductIds);

    // Initialize selections to lookbook defaults
    const initialSelections: typeof itemSelections = {};
    lb.items.forEach(item => {
      const product = getProduct(item.productId);
      if (product) {
        // Validate if default lookbook variant exists in stock, otherwise fallback
        const hasDefaultVariant = product.variants.some(
          v => v.color.toLowerCase() === item.selectedColor.toLowerCase() && 
               v.size.toLowerCase() === item.selectedSize.toLowerCase() && 
               v.stock > 0
        );

        if (hasDefaultVariant) {
          initialSelections[item.productId] = {
            size: item.selectedSize,
            color: item.selectedColor
          };
        } else {
          // Fallback to first in-stock variant
          const inStockVariant = product.variants.find(v => v.stock > 0);
          initialSelections[item.productId] = {
            size: inStockVariant?.size || product.variants[0]?.size || 'One Size',
            color: inStockVariant?.color || product.variants[0]?.color || 'Default'
          };
        }
      }
    });
    setItemSelections(initialSelections);
  };

  // Toggle selection of product in bundle
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle color change and select a valid size for that color
  const handleColorChange = (productId: string, color: string, product: Product) => {
    const currentSize = itemSelections[productId]?.size;
    
    // Find all sizes in stock for this new color
    const inStockSizesForColor = product.variants
      .filter(v => v.color === color && v.stock > 0)
      .map(v => v.size);

    // If current size is available in new color, keep it. Otherwise pick first available size
    const newSize = inStockSizesForColor.includes(currentSize)
      ? currentSize
      : inStockSizesForColor[0] || product.variants.find(v => v.color === color)?.size || 'One Size';

    setItemSelections(prev => ({
      ...prev,
      [productId]: {
        color,
        size: newSize
      }
    }));
  };

  // Handle size change
  const handleSizeChange = (productId: string, size: string) => {
    setItemSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        size
      }
    }));
  };

  // Add all selected lookbook items to the cart
  const handleAddBundleToCart = () => {
    if (selectedProductIds.length === 0) return;

    selectedProductIds.forEach(productId => {
      const selection = itemSelections[productId];
      if (selection) {
        addToCart(productId, selection.size, selection.color, 1);
      }
    });

    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
      setSelectedLookbook(null);
    }, 2000);
  };

  // Calculate sum of selected items in modal
  const calculateBundleTotal = () => {
    return selectedProductIds.reduce((sum, productId) => {
      const p = getProduct(productId);
      return sum + (p?.price || 0);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans">
      
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="text-[10px] uppercase font-bold tracking-widest bg-accent-main/10 text-accent-color px-3 py-1 rounded-full border border-accent-main/20 inline-block">
          Style Portfolios
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-text-primary">
          Shoppable Lookbooks
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Explore curated style directions crafted directly by our platform's boutique designers. 
          Discover matching aesthetics, choose your sizes, and purchase entire lookbook sets as a single bundle.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-main pb-6 mb-8">
        
        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search outfits, styles, or designers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs bg-bg-secondary text-text-primary border border-border-main focus:outline-none focus:border-accent-main focus:ring-1 focus:ring-accent-main transition-all duration-200"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto self-start md:self-auto py-1">
          {[
            { id: 'all', label: 'All Portfolios' },
            { id: 'official', label: 'Boutique Official' },
            { id: 'designer', label: 'Community Edits' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-text-primary text-bg-primary shadow-sm'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lookbooks Grid */}
      {filteredLookbooks.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl border border-border-main bg-card-main max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 bg-bg-secondary rounded-full flex items-center justify-center mx-auto text-text-tertiary">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-text-primary">No Lookbooks Found</h3>
            <p className="text-xs text-text-secondary">
              Try adjusting your filters or search keywords to explore alternative styling concepts.
            </p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setFilterTab('all'); }}
            className="px-4 py-1.5 rounded-xl border border-border-main text-xs font-bold hover:bg-bg-secondary transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLookbooks.map(lb => {
            const store = getStoreForLookbook(lb.storeId);
            const validItems = lb.items.filter(item => getProduct(item.productId) !== undefined);
            const coverProduct = getProduct(validItems[0]?.productId);
            const coverImage = lb.image || coverProduct?.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800';

            return (
              <motion.div
                key={lb.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative h-[420px] rounded-3xl overflow-hidden border border-border-main bg-bg-secondary card-hover-effect cursor-pointer flex flex-col justify-end"
                onClick={() => handleOpenLookbook(lb)}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={coverImage} 
                    alt={lb.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300" />
                </div>

                {/* Boutique Tag */}
                {store && (
                  <div className="absolute top-4 left-4 z-10 glassmorphism px-3 py-1 rounded-full flex items-center space-x-1.5 text-white text-[10px] font-semibold border-white/10 shadow-sm">
                    <Store className="w-3 h-3" />
                    <span>{store.name}</span>
                  </div>
                )}

                {/* Lookbook Info */}
                <div className="relative z-10 p-6 space-y-3 text-white">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-color/90">
                      {validItems.length} {validItems.length === 1 ? 'Garment' : 'Garments'} Bundle
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                      {lb.name}
                    </h2>
                    <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                      {lb.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center space-x-1.5 text-xs text-stone-300">
                      <User className="w-3.5 h-3.5 text-accent-color" />
                      <span>{lb.creatorName}</span>
                      {lb.isOfficial && (
                        <span className="text-[8px] bg-accent-color/20 text-accent-color px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-accent-color/30">
                          Official
                        </span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:bg-accent-color group-hover:text-white transition-colors duration-300">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lookbook Detail Modal */}
      <AnimatePresence>
        {selectedLookbook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedLookbook(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-bg-primary rounded-3xl border border-border-main shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
              
              {/* Left Column: Image Collage / Banner */}
              <div className="w-full md:w-1/2 bg-bg-secondary relative h-64 md:h-auto overflow-hidden min-h-[300px]">
                {(() => {
                  const validItems = selectedLookbook.items.filter(item => getProduct(item.productId) !== undefined);
                  const firstProduct = getProduct(validItems[0]?.productId);
                  const firstImage = selectedLookbook.image || firstProduct?.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800';
                  
                  return (
                    <div className="relative w-full h-full">
                      <img 
                        src={firstImage} 
                        alt={selectedLookbook.name} 
                        className="w-full h-full object-cover"
                      />

                      {/* Glowing Hotspot Pins */}
                      {selectedLookbook.pins && selectedLookbook.pins.map((pin, idx) => {
                        const product = getProduct(pin.productId);
                        if (!product) return null;
                        const isHovered = hoveredPinId === pin.productId;

                        return (
                          <div
                            key={idx}
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                            onMouseEnter={() => setHoveredPinId(pin.productId)}
                            onMouseLeave={() => setHoveredPinId(null)}
                          >
                            {/* Glowing Background Ripple */}
                            <span className="absolute inline-flex h-6 w-6 rounded-full bg-accent-main/40 animate-ping -left-0.5 -top-0.5"></span>

                            <button
                              type="button"
                              onClick={() => {
                                setHighlightedProductId(pin.productId);
                                if (!selectedProductIds.includes(pin.productId)) {
                                  setSelectedProductIds(prev => [...prev, pin.productId]);
                                }
                                // Scroll the product into view in the sidebar list
                                const sidebarEl = document.getElementById(`lb-item-${pin.productId}`);
                                if (sidebarEl) {
                                  sidebarEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }
                                setTimeout(() => {
                                  setHighlightedProductId(null);
                                }, 1500);
                              }}
                              className="relative w-5 h-5 rounded-full bg-accent-main border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-[9px] cursor-pointer hover:bg-white hover:text-accent-color hover:scale-110 transition-all"
                            >
                              {idx + 1}
                            </button>

                            {/* Hover Tooltip */}
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute left-1/2 -translate-x-1/2 bottom-7 bg-card-main border border-border-main p-2.5 rounded-xl shadow-xl z-30 min-w-[150px] text-left text-text-primary"
                                >
                                  <p className="text-[10px] font-bold truncate leading-tight">{product.name}</p>
                                  <p className="text-[9px] text-text-tertiary mt-0.5 capitalize">{product.category}</p>
                                  <p className="text-[10px] font-bold text-accent-color mt-1">Rs. {product.price.toLocaleString()}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                      
                      {/* Store overlay detail */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-6 text-white pointer-events-none">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-accent-color">
                          Outfit Presentation
                        </span>
                        <h2 className="font-serif text-2xl font-bold mt-1">{selectedLookbook.name}</h2>
                        <p className="text-xs text-stone-300 mt-2 leading-relaxed line-clamp-3">
                          {selectedLookbook.description}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-white/10">
                          <div className="w-8 h-8 rounded-full bg-accent-color/20 border border-accent-color text-accent-color flex items-center justify-center font-bold text-xs">
                            {selectedLookbook.creatorName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{selectedLookbook.creatorName}</p>
                            <p className="text-[9px] text-stone-400">Styling Director</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Close Button on mobile */}
                <button
                  onClick={() => setSelectedLookbook(null)}
                  className="absolute top-4 right-4 md:hidden w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-black/75 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Right Column: Interactive Bundle List */}
              <div className="w-full md:w-1/2 flex flex-col p-6 sm:p-8 max-h-[60vh] md:max-h-[90vh]">
                
                {/* Header for Desktop */}
                <div className="hidden md:flex items-center justify-between border-b border-border-main pb-4 mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-text-primary">Outfit Garments</h3>
                    <p className="text-[10px] text-text-secondary">Configure your individual sizes and shades below</p>
                  </div>
                  <button
                    onClick={() => setSelectedLookbook(null)}
                    className="w-8 h-8 rounded-full hover:bg-bg-tertiary flex items-center justify-center text-text-secondary transition-all cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Items List scrollbox */}
                <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  {selectedLookbook.items
                    .filter(item => getProduct(item.productId) !== undefined)
                    .map(item => {
                      const product = getProduct(item.productId)!;
                      const store = getStoreForLookbook(product.storeId);
                      const isChecked = selectedProductIds.includes(product.id);
                      
                      const selectedColor = itemSelections[product.id]?.color;
                      const selectedSize = itemSelections[product.id]?.size;

                      // Extract options from product variants
                      const colors = Array.from(new Set(product.variants.map(v => v.color)));
                      const sizesForColor = product.variants
                        .filter(v => v.color === selectedColor && v.stock > 0)
                        .map(v => v.size);

                      // Check total stock for this color to flag availability
                      const isColorAvailable = product.variants.some(v => v.color === selectedColor && v.stock > 0);

                      const isHighlighted = product.id === highlightedProductId;

                      return (
                        <div 
                          id={`lb-item-${product.id}`}
                          key={product.id}
                          className={`p-3 rounded-2xl border flex items-start space-x-3 transition-all duration-500 ${
                            isHighlighted
                              ? 'border-accent-color ring-2 ring-accent-color/30 scale-[1.02] bg-accent-color/10 shadow-md'
                              : isChecked 
                                ? 'border-accent-main/45 bg-accent-main/5' 
                                : 'border-border-main bg-bg-secondary opacity-60'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className="pt-1.5">
                            <button
                              onClick={() => toggleProductSelection(product.id)}
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-accent-color border-accent-color text-white' 
                                  : 'border-text-tertiary hover:border-text-primary'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Image */}
                          <div className="w-16 h-20 rounded-xl overflow-hidden bg-bg-primary border border-border-main flex-shrink-0 cursor-pointer"
                            onClick={() => navigateToProduct(product.id)}
                          >
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-grow space-y-1.5 min-w-0">
                            <div>
                              <p className="text-xs font-bold text-text-primary truncate">{product.name}</p>
                              {store && (
                                <button 
                                  onClick={() => navigateToStore(store.slug)}
                                  className="text-[10px] text-text-tertiary hover:text-accent-color flex items-center space-x-1 mt-0.5"
                                >
                                  <Store className="w-2.5 h-2.5" />
                                  <span>{store.name}</span>
                                </button>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-accent-color">
                              Rs. {product.price.toLocaleString()}
                            </p>

                            {/* Dropdowns */}
                            {isChecked && (
                              <div className="flex items-center space-x-2 pt-1">
                                
                                {/* Color selector */}
                                <div className="space-y-0.5">
                                  <label className="text-[9px] uppercase font-bold text-text-tertiary block">Color</label>
                                  <select
                                    value={selectedColor}
                                    onChange={(e) => handleColorChange(product.id, e.target.value, product)}
                                    className="px-2 py-0.5 rounded border border-border-main bg-bg-primary text-[10px] focus:outline-none focus:border-accent-main"
                                  >
                                    {colors.map(col => {
                                      const hasStock = product.variants.some(v => v.color === col && v.stock > 0);
                                      return (
                                        <option key={col} value={col}>
                                          {col} {!hasStock ? '(Sold Out)' : ''}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>

                                {/* Size selector */}
                                <div className="space-y-0.5">
                                  <label className="text-[9px] uppercase font-bold text-text-tertiary block">Size</label>
                                  <select
                                    value={selectedSize}
                                    onChange={(e) => handleSizeChange(product.id, e.target.value)}
                                    className="px-2 py-0.5 rounded border border-border-main bg-bg-primary text-[10px] focus:outline-none focus:border-accent-main"
                                    disabled={!isColorAvailable}
                                  >
                                    {sizesForColor.length === 0 ? (
                                      <option>Sold Out</option>
                                    ) : (
                                      sizesForColor.map(sz => (
                                        <option key={sz} value={sz}>{sz}</option>
                                      ))
                                    )}
                                  </select>
                                </div>

                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Bundle Checkout Box */}
                <div className="border-t border-border-main pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-secondary font-medium">
                        Selected items: <strong className="text-text-primary">{selectedProductIds.length}</strong>
                      </p>
                      <p className="text-[10px] text-text-tertiary">All items packed in separate garment covers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">Total Bundle Price</p>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                        Rs. {calculateBundleTotal().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Add bundle to cart action */}
                  <button
                    onClick={handleAddBundleToCart}
                    disabled={selectedProductIds.length === 0 || isAddedSuccess}
                    className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 ${
                      isAddedSuccess
                        ? 'bg-green-600 text-white shadow-sm'
                        : selectedProductIds.length === 0
                          ? 'bg-bg-tertiary text-text-tertiary border border-border-main cursor-not-allowed'
                          : 'bg-accent-main text-accent-fg hover:opacity-95 cursor-pointer shadow-md'
                    }`}
                  >
                    {isAddedSuccess ? (
                      <>
                        <Check className="w-4 h-4 animate-bounce" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add Outfit Bundle to Cart</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
