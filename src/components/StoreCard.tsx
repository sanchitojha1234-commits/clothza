import React from 'react';
import { type Store, useMarketplace } from '../context/MarketplaceContext';
import { MapPin, Heart, ArrowUpRight, Eye, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { navigateToStore, favorites, toggleFavoriteStore, trackClick } = useMarketplace();

  const isFavorited = favorites.stores.includes(store.id);

  const handleCardClick = () => {
    trackClick('store', store.id);
    navigateToStore(store.slug);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteStore(store.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-card-main border border-border-main flex flex-col h-full card-hover-effect"
    >
      {/* Banner */}
      <div className="h-32 sm:h-36 w-full overflow-hidden relative bg-bg-tertiary">
        <img
          src={store.banner}
          alt={store.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        
        {/* Promotion Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {store.isFeatured && (
            <span className="text-[10px] tracking-wider uppercase font-bold bg-white text-black px-2 py-0.5 rounded-full border border-black/10 shadow-sm">
              Featured Store
            </span>
          )}
          {store.isSponsored && (
            <span className="text-[10px] tracking-wider uppercase font-semibold bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-full shadow-sm">
              Sponsored
            </span>
          )}
        </div>

        {/* Favorite Icon */}
        <button
          onClick={handleFavClick}
          className="absolute top-3 right-3 p-2 rounded-full glassmorphism text-white hover:text-red-500 hover:scale-105 transition-all shadow-sm z-10"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between relative">
        
        {/* Logo overlay on banner */}
        <div className="absolute -top-8 left-5 w-16 h-16 rounded-2xl overflow-hidden border-2 border-card-main bg-card-main shadow-md">
          <img
            src={store.logo}
            alt={`${store.name} logo`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Space for logo */}
        <div className="h-8" />

        {/* Store Title & Location */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-text-primary group-hover:text-text-secondary transition-colors duration-200">
              {store.name}
            </h3>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight className="w-4 h-4 text-text-secondary" />
            </span>
          </div>

          {store.location && (
            <div className="flex items-center space-x-1 mt-1 text-xs text-text-tertiary">
              <MapPin className="w-3.5 h-3.5" />
              <span>{store.location}</span>
            </div>
          )}

          <p className="mt-3 text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {store.description}
          </p>
        </div>

        {/* Stats and Analytics Footer */}
        <div className="mt-5 pt-3 border-t border-border-main flex items-center justify-between text-[11px] text-text-tertiary font-medium">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{store.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>{store.clicks.toLocaleString()} clicks</span>
            </div>
          </div>
          <span className="text-text-secondary font-semibold uppercase tracking-wider text-[9px] group-hover:underline">
            Explore
          </span>
        </div>

      </div>
    </motion.div>
  );
};
