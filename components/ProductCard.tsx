import React from 'react';
import { type Product, useMarketplace } from '../context/MarketplaceContext';
import { Heart, Eye, ArrowRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const THEME_PRESETS: Record<string, {
  cardGeometry: string;
  cardBg: string;
  titleFont: string;
  priceFont: string;
  storeFont: string;
  categoryFont: string;
  borderStyle: string;
  badgeStyleBestSeller: string;
  badgeStyleTrending: string;
  badgeStyleSponsored: string;
  favoriteBtn: string;
}> = {
  minimalist: {
    cardGeometry: 'rounded-none border border-neutral-200 shadow-none hover:border-neutral-900 transition-all duration-300',
    cardBg: 'bg-white',
    titleFont: 'font-serif text-sm font-medium text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors',
    priceFont: 'font-serif text-sm font-semibold text-neutral-900',
    storeFont: 'font-serif text-[10px] uppercase tracking-wider text-neutral-400 hover:text-neutral-900 hover:underline cursor-pointer',
    categoryFont: 'font-serif text-[10px] text-neutral-400 uppercase tracking-widest',
    borderStyle: 'border-neutral-200',
    badgeStyleBestSeller: 'bg-neutral-900 text-white rounded-none text-[8px] uppercase tracking-wider border-none px-2 py-0.5',
    badgeStyleTrending: 'bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-none text-[8px] uppercase tracking-wider px-2 py-0.5',
    badgeStyleSponsored: 'bg-neutral-50 text-neutral-500 border border-neutral-200 rounded-none text-[8px] uppercase tracking-wider px-2 py-0.5',
    favoriteBtn: 'p-2 rounded-none bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm',
  },
  streetwear: {
    cardGeometry: 'rounded-none border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200',
    cardBg: 'bg-[#181a20]',
    titleFont: 'font-sans font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-yellow-400 text-sm transition-colors',
    priceFont: 'font-mono text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded-none border border-white/20',
    storeFont: 'font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-tighter hover:text-white cursor-pointer',
    categoryFont: 'font-mono text-[9px] text-yellow-400 uppercase font-black',
    borderStyle: 'border-white',
    badgeStyleBestSeller: 'bg-yellow-400 text-black rounded-none border border-black text-[9px] font-black uppercase px-2 py-0.5',
    badgeStyleTrending: 'bg-orange-500 text-white rounded-none border border-white text-[9px] font-black uppercase px-2 py-0.5',
    badgeStyleSponsored: 'bg-white text-black rounded-none border border-black text-[9px] font-black uppercase px-2 py-0.5',
    favoriteBtn: 'p-2 rounded-none bg-white text-black hover:bg-yellow-400 transition-all border border-black shadow-sm',
  },
  linen: {
    cardGeometry: 'rounded-[2rem] border border-[#ebdcb9]/40 bg-[#FAF6EE] shadow-sm hover:shadow-md hover:border-[#5a6b5c]/40 transition-all duration-300',
    cardBg: 'bg-[#FAF6EE]',
    titleFont: 'font-sans font-medium text-[#3c362a] line-clamp-1 group-hover:text-[#5a6b5c] text-sm transition-colors',
    priceFont: 'font-sans text-sm font-bold text-[#5a6b5c]',
    storeFont: 'font-sans text-[11px] text-[#9c8e76] hover:text-[#3c362a] hover:underline cursor-pointer',
    categoryFont: 'font-sans text-[11px] text-[#9c8e76] italic',
    borderStyle: 'border-[#ebdcb9]/40',
    badgeStyleBestSeller: 'bg-[#5a6b5c]/10 text-[#5a6b5c] rounded-full text-[9px] font-semibold px-2.5 py-0.5 border border-[#5a6b5c]/20',
    badgeStyleTrending: 'bg-[#6e6350]/10 text-[#6e6350] rounded-full text-[9px] font-semibold px-2.5 py-0.5 border border-[#6e6350]/20',
    badgeStyleSponsored: 'bg-[#FAF6EE]/80 text-[#9c8e76] rounded-full text-[9px] font-medium px-2.5 py-0.5 border border-[#ebdcb9]/30',
    favoriteBtn: 'p-2.5 rounded-full bg-white/80 hover:bg-[#5a6b5c] text-[#5a6b5c] hover:text-white transition-all shadow-sm',
  },
  leather: {
    cardGeometry: 'rounded-xl border border-[#d6c7b2] bg-white shadow-sm hover:shadow-md hover:border-[#704214] transition-all duration-300',
    cardBg: 'bg-white',
    titleFont: 'font-serif font-bold text-[#331d0b] line-clamp-1 group-hover:text-[#704214] text-sm transition-colors',
    priceFont: 'font-serif text-sm font-bold text-[#704214]',
    storeFont: 'font-serif text-[11px] text-[#927863] hover:text-[#331d0b] hover:underline cursor-pointer',
    categoryFont: 'font-serif text-[11px] text-[#927863] font-semibold uppercase tracking-wider',
    borderStyle: 'border-[#d6c7b2]',
    badgeStyleBestSeller: 'bg-[#704214]/10 text-[#704214] border border-[#704214]/20 rounded-md text-[9px] font-bold uppercase px-2 py-0.5',
    badgeStyleTrending: 'bg-[#614530]/10 text-[#614530] border border-[#614530]/20 rounded-md text-[9px] font-bold uppercase px-2 py-0.5',
    badgeStyleSponsored: 'bg-neutral-100 text-[#927863] border border-[#d6c7b2] rounded-md text-[9px] font-bold uppercase px-2 py-0.5',
    favoriteBtn: 'p-2 rounded-lg bg-[#FAF6EE] text-[#704214] hover:bg-[#704214] hover:text-white transition-all border border-[#d6c7b2]',
  },
  custom: {
    cardGeometry: 'rounded-3xl bg-card-main border border-border-main shadow-sm hover:shadow-md transition-all duration-300',
    cardBg: 'bg-card-main',
    titleFont: 'font-sans text-sm font-semibold text-text-primary group-hover:text-text-secondary line-clamp-1 transition-colors',
    priceFont: 'font-serif text-base font-bold text-text-primary',
    storeFont: 'text-xs text-text-tertiary font-medium hover:text-text-primary hover:underline transition-colors cursor-pointer',
    categoryFont: 'text-xs text-text-tertiary font-medium',
    borderStyle: 'border-border-main',
    badgeStyleBestSeller: 'bg-white text-black px-2 py-0.5 rounded-full border border-black/10 shadow-sm text-[9px] tracking-wider uppercase font-bold',
    badgeStyleTrending: 'bg-black text-white px-2 py-0.5 rounded-full border border-white/10 shadow-sm text-[9px] tracking-wider uppercase font-bold',
    badgeStyleSponsored: 'bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full shadow-sm text-[9px] tracking-wider uppercase font-semibold',
    favoriteBtn: 'p-2 rounded-full glassmorphism text-white hover:text-red-500 hover:scale-105 transition-all shadow-sm',
  }
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    navigateToProduct, 
    navigateToStore, 
    stores, 
    favorites, 
    toggleFavoriteProduct, 
    trackClick,
    reviews
  } = useMarketplace();

  const store = stores.find((s) => s.id === product.storeId);
  const isFavorited = favorites.products.includes(product.id);

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const totalReviews = productReviews.length;
  const averageRating = totalReviews > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : null;

  const handleCardClick = () => {
    trackClick('product', product.id);
    navigateToProduct(product.id);
  };

  const handleStoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (store) {
      trackClick('store', store.id);
      navigateToStore(store.slug);
    }
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteProduct(product.id);
  };

  const theme = store?.theme || 'minimalist';
  const preset = THEME_PRESETS[theme] || THEME_PRESETS.minimalist;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className={`group relative cursor-pointer overflow-hidden flex flex-col h-full ${preset.cardGeometry} ${preset.cardBg}`}
    >
      {/* Product Image */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-bg-tertiary relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-103"
          loading="lazy"
        />
        
        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Promotion Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className={`flex items-center gap-1 ${preset.badgeStyleBestSeller}`}>
              {!preset.badgeStyleBestSeller.includes('rounded-none') && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
              )}
              Best Seller
            </span>
          )}
          {product.isTrending && (
            <span className={`flex items-center gap-1 ${preset.badgeStyleTrending}`}>
              {!preset.badgeStyleTrending.includes('rounded-none') && (
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block animate-pulse"></span>
              )}
              Trending
            </span>
          )}
          {product.isSponsored && (
            <span className={`flex items-center gap-1 ${preset.badgeStyleSponsored}`}>
              <Tag className="w-2.5 h-2.5" />
              Sponsored
            </span>
          )}
        </div>

        {/* Favorite Icon */}
        <button
          onClick={handleFavClick}
          className={`absolute top-3 right-3 z-10 cursor-pointer ${preset.favoriteBtn}`}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 w-[85%]">
          <div className={`py-2 px-3 text-xs font-semibold text-center flex items-center justify-center space-x-1.5 transition-all ${
            theme === 'minimalist' ? 'bg-neutral-900 text-white rounded-none hover:bg-neutral-800' :
            theme === 'streetwear' ? 'bg-white text-black border-2 border-black font-black uppercase rounded-none hover:bg-yellow-400' :
            theme === 'linen' ? 'bg-[#5a6b5c] text-white rounded-full hover:bg-[#4c5c4e]' :
            theme === 'leather' ? 'bg-[#704214] text-[#FAF6EE] rounded-lg hover:opacity-90' :
            'glassmorphism text-white rounded-2xl hover:bg-white hover:text-black'
          }`}>
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Info Details */}
      <div className={`p-4 flex-1 flex flex-col justify-between border-t ${preset.borderStyle}`}>
        
        <div>
          {/* Store Name & Category */}
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            {store ? (
              <span 
                onClick={handleStoreClick} 
                className={preset.storeFont}
              >
                {store.name}
              </span>
            ) : (
              <span className={preset.storeFont}>Clothza Designer</span>
            )}
            <span className={preset.categoryFont}>{product.category}</span>
          </div>

          {/* Product Name */}
          <h4 className={preset.titleFont}>
            {product.name}
          </h4>

          {/* Rating Summary */}
          {averageRating && (
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-amber-500 font-medium">
              <span>★ <span className="text-text-secondary font-semibold">{averageRating}</span></span>
              <span className="text-text-tertiary">({totalReviews})</span>
            </div>
          )}
        </div>

        {/* Price & Views */}
        <div className="mt-3 flex items-center justify-between">
          <span className={preset.priceFont}>
            Rs. {product.price.toLocaleString()}
          </span>
          <div className="flex items-center space-x-1.5 text-[11px] text-text-tertiary font-medium">
            <Eye className="w-3.5 h-3.5" />
            <span>{product.views.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
