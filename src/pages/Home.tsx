import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { StoreCard } from '../components/StoreCard';
import { ProductCard } from '../components/ProductCard';
import { 
  Sparkles, Search, TrendingUp, Filter, 
  ArrowRight, Heart, AlertCircle, Volume2 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Home: React.FC<HomeProps> = ({ searchQuery, setSearchQuery }) => {
  const { 
    stores, 
    products, 
    favorites, 
    promoteStore
  } = useMarketplace();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoStoreId, setPromoStoreId] = useState('');

  // 1. Filter Products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesPrice = product.price <= maxPrice;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // 2. Filter Stores
  const filteredStores = stores.filter((store) => {
    return store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (store.location && store.location.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // 3. Smart Feature: Calculate Trending Stores dynamically based on Views + Clicks
  // Formula: Weight views (30%) and clicks (70%)
  const trendingStores = [...stores]
    .sort((a, b) => (b.views * 0.3 + b.clicks * 0.7) - (a.views * 0.3 + a.clicks * 0.7))
    .slice(0, 3);

  // 4. Featured Stores (Mock Sponsored Placements)
  const featuredStores = stores.filter(s => s.isFeatured);

  // 5. Best Selling Products
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  // 6. User Favorites list
  const favoriteStoreItems = stores.filter(s => favorites.stores.includes(s.id));
  const favoriteProductItems = products.filter(p => favorites.products.includes(p.id));

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoStoreId) {
      promoteStore(promoStoreId, 'featured');
      setShowPromoModal(false);
      alert("Store successfully promoted! It now has premium placement in 'Featured Stores'.");
    }
  };

  return (
    <div className="space-y-16 pb-20 animate-fade-in">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-bg-secondary border-b border-border-main py-20 px-4 sm:px-6 lg:px-8">
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-main/3 dark:bg-accent-main/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-main/3 dark:bg-accent-main/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-tertiary text-text-secondary border border-border-main"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Curated Multi-Vendor Fashion</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-text-primary leading-tight"
          >
            Discover Fashion <br />
            <span className="italic font-normal text-text-secondary">in One Place.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed"
          >
            A refined, editorial fashion marketplace bridging independent design houses with discerning tastemakers. Explore bespoke apparel, promote boutiques, and discover unique style.
          </motion.p>

          {/* Search bar inside Hero (Syncs with Navigation) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-md mx-auto pt-4"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search boutiques, blazers, sneakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm bg-card-main text-text-primary border border-border-main focus:outline-none focus:border-accent-main focus:ring-1 focus:ring-accent-main shadow-md hover:shadow-lg transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Monetization Placement Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-card-main border border-border-main p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm card-hover-effect glow-active relative overflow-hidden">
          <div className="space-y-2 max-w-xl text-left relative z-10">
            <span className="text-[10px] tracking-wider uppercase font-bold text-text-secondary flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-accent-main" />
              Clothza Ads Engine
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
              Boost your store's visibility to thousands of shoppers
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Rent premium placement spaces. Test our monetization simulator by toggle-promoting any store to see how it moves immediately to the "Featured Stores" spotlight.
            </p>
          </div>
          <button 
            onClick={() => setShowPromoModal(true)}
            className="premium-btn px-6 py-3 rounded-2xl bg-text-primary text-bg-primary text-xs font-semibold shadow-md hover:opacity-90 flex items-center space-x-1.5 shrink-0 z-10 cursor-pointer"
          >
            <span>Promote A Boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. Search Results or Main Layout */}
      {searchQuery ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center space-x-2 border-b border-border-main pb-4">
            <Search className="w-5 h-5 text-text-secondary" />
            <h2 className="font-serif text-xl font-bold text-text-primary">
              Search Results for "{searchQuery}"
            </h2>
            <span className="text-xs font-semibold bg-bg-tertiary text-text-secondary px-2.5 py-0.5 rounded-full">
              {filteredProducts.length + filteredStores.length} matches
            </span>
          </div>

          {/* Stores Matches */}
          {filteredStores.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Boutiques Found</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredStores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            </div>
          )}

          {/* Products Matches */}
          {filteredProducts.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Products Found</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            filteredStores.length === 0 && (
              <div className="text-center py-20 border border-dashed border-border-main rounded-3xl space-y-2">
                <AlertCircle className="w-8 h-8 text-text-tertiary mx-auto" />
                <p className="text-sm font-semibold text-text-primary">No stores or products found matching your search</p>
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="text-xs underline text-text-secondary"
                >
                  Clear search
                </button>
              </div>
            )
          )}
        </section>
      ) : (
        <>
          {/* 4. Featured Stores (SaaS Sponsor Spotlight) */}
          {featuredStores.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border-main pb-4">
                <div className="text-left">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                    Featured Boutiques
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">Premium placements registered in our marketplace.</p>
                </div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-text-tertiary">
                  Sponsored Slot
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredStores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            </section>
          )}

          {/* 5. Trending Stores Carousel (Smart Rank Engine) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-left border-b border-border-main pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-text-primary" />
                  Trending Stores
                </h2>
                <p className="text-xs text-text-secondary mt-1">Ranked dynamically by total user views and page clicks.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingStores.map((store, idx) => (
                <div key={store.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center border border-white/20 shadow-md z-10">
                    {idx + 1}
                  </div>
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          </section>

          {/* 6. Favorite Stores & Products Hub */}
          {(favoriteStoreItems.length > 0 || favoriteProductItems.length > 0) && (
            <section id="favorites-section" className="bg-bg-secondary border-y border-border-main py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-left">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    Your Curated Collection
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">Your favorited boutiques and fashion pieces in one collection.</p>
                </div>

                {favoriteStoreItems.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary text-left">Favorited Boutiques</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {favoriteStoreItems.map((store) => (
                        <StoreCard key={store.id} store={store} />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteProductItems.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary text-left">Favorited Pieces</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {favoriteProductItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 7. Best Selling Products (Highlight System) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-left border-b border-border-main pb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                Best-Selling Pieces
              </h2>
              <p className="text-xs text-text-secondary mt-1">Signature apparel recommended by Clothza buyers.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* 8. Comprehensive Discovery catalog */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-main pb-4 gap-4 text-left">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                  Explore Platform Catalog
                </h2>
                <p className="text-xs text-text-secondary mt-1">Browse and filter products across all registered tenants.</p>
              </div>

              {/* Filters Panel */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1 bg-bg-tertiary px-3 py-1.5 rounded-full border border-border-main text-xs text-text-secondary">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="font-medium">Filter By Price:</span>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-20 accent-text-primary"
                  />
                  <span className="font-bold text-text-primary">Rs. {maxPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Category Selectors */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {['All', 'Men', 'Women', 'Kids', 'Accessories'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-text-primary text-bg-primary'
                      : 'bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-border-main rounded-3xl space-y-2">
                <p className="text-sm font-semibold text-text-primary">No items match your filter criteria</p>
                <button 
                  onClick={() => {
                    setActiveCategory('All');
                    setMaxPrice(100000);
                  }}
                  className="text-xs underline text-text-secondary"
                >
                  Reset filters
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {/* Promoted Placement Simulation Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowPromoModal(false)} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-card-main border border-border-main p-6 rounded-3xl shadow-xl relative z-10 text-left space-y-4"
          >
            <div>
              <h3 className="font-serif text-lg font-bold text-text-primary">
                SaaS Paid Placement Engine
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Select a boutique below to toggle its featured status. Featured stores are granted priority visibility in the premium slot at the top of the homepage.
              </p>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Select Boutique to Promote:
                </label>
                <select
                  value={promoStoreId}
                  onChange={(e) => setPromoStoreId(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-bg-secondary text-text-primary border border-border-main focus:outline-none focus:border-text-primary"
                  required
                >
                  <option value="">-- Choose Store --</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name} {store.isFeatured ? '(Currently Featured)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-bg-tertiary text-text-secondary border border-border-main hover:text-text-primary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs bg-text-primary text-bg-primary font-semibold hover:opacity-90 transition-all"
                >
                  Toggle Placement
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
