import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';
import { 
  Heart, Share2, MessageCircle, 
  ChevronRight, ShieldCheck, Truck, RotateCcw,
  Star, ShoppingBag
} from 'lucide-react';

export const ProductPage: React.FC = () => {
  const { 
    activeProductId, 
    products, 
    stores, 
    favorites, 
    toggleFavoriteProduct, 
    trackView,
    trackClick,
    navigateToStore,
    navigateToHome,
    recentlyViewed,
    reviews,
    addProductReview,
    currentUser,
    addToCart
  } = useMarketplace();

  const product = products.find((p) => p.id === activeProductId);
  const store = product ? stores.find((s) => s.id === product.storeId) : null;

  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Review submission state
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [starHover, setStarHover] = useState<number | null>(null);

  // Set default states on product change
  useEffect(() => {
    if (product) {
      trackView('product', product.id);
      setActiveImage(product.images[0]);
      
      // Auto-select first unique sizes/colors
      if (product.variants.length > 0) {
        setSelectedSize(product.variants[0].size);
        setSelectedColor(product.variants[0].color);
      }
    }
  }, [activeProductId]);

  if (!product || !store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-text-primary">Product Not Found</h2>
        <p className="text-xs text-text-secondary">The apparel you are looking for does not exist or has been removed.</p>
        <button onClick={navigateToHome} className="text-xs underline text-text-primary">
          Return to homepage
        </button>
      </div>
    );
  }

  const isFavorited = favorites.products.includes(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Extract unique sizes and colors
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  // Calculate selected variant stock
  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const stockCount = currentVariant ? currentVariant.stock : 0;

  // Filter recently viewed items (excluding current product)
  const recentProducts = products.filter(
    (p) => recentlyViewed.includes(p.id) && p.id !== product.id
  );

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pre-filled WhatsApp link message
  const waMessage = encodeURIComponent(
    `Hello ${store.name}, I am interested in purchasing your "${product.name}" listed on Clothza for Rs. ${product.price.toLocaleString()}. \n` +
    `Details - Size: ${selectedSize}, Color: ${selectedColor}. \n` +
    `Please let me know if it is available!`
  );
  const waLink = `https://wa.me/${store.whatsapp?.replace(/\+/g, '')}?text=${waMessage}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-fade-in text-left">
      
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-text-tertiary">
        <span onClick={navigateToHome} className="hover:text-text-primary cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3 h-3" />
        <span onClick={() => navigateToStore(store.slug)} className="hover:text-text-primary cursor-pointer transition-colors">{store.name}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-text-primary font-semibold">{product.name}</span>
      </div>

      {/* Main product display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-bg-tertiary border border-border-main relative">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 text-[10px] tracking-wider uppercase font-bold bg-white text-black px-2.5 py-1 rounded-full border border-black/10 shadow-md">
                Best Seller
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-text-primary' : 'border-border-main opacity-70'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span 
                onClick={() => navigateToStore(store.slug)}
                className="text-xs font-semibold tracking-wider uppercase bg-bg-tertiary text-text-secondary border border-border-main px-3 py-1 rounded-full cursor-pointer hover:text-text-primary transition-all"
              >
                {store.name}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full hover:bg-bg-tertiary text-text-secondary transition-all border border-border-main relative"
                  title="Share Link"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] bg-black text-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
                <button
                  onClick={() => toggleFavoriteProduct(product.id)}
                  className="p-2.5 rounded-full hover:bg-bg-tertiary text-text-secondary transition-all border border-border-main"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500 border-red-500' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {product.name}
            </h1>
            
            <p className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
              Rs. {product.price.toLocaleString()}
            </p>
          </div>

          <hr className="border-border-main" />

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Product Description</h4>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{product.description}</p>
          </div>

          {/* Dynamic Variant Selectors */}
          <div className="space-y-4 pt-2">
            
            {/* Colors */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Color: {selectedColor}</span>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedColor === color
                          ? 'border-text-primary bg-text-primary text-bg-primary font-semibold'
                          : 'border-border-main text-text-secondary hover:text-text-primary bg-bg-secondary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Size: {selectedSize}</span>
                <div className="flex space-x-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-xl text-xs font-semibold border flex items-center justify-center transition-all ${
                        selectedSize === size
                          ? 'border-text-primary bg-text-primary text-bg-primary'
                          : 'border-border-main text-text-secondary hover:text-text-primary bg-bg-secondary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Level Indicator */}
            <div className="text-xs font-medium text-text-secondary flex items-center space-x-1.5 pt-1">
              <span className={`w-2 h-2 rounded-full ${stockCount > 5 ? 'bg-green-500' : stockCount > 0 ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`} />
              <span>
                {stockCount > 5 
                  ? `In Stock (${stockCount} items remaining)` 
                  : stockCount > 0 
                  ? `Low Stock Only (${stockCount} items left)` 
                  : 'Out of Stock (restocking soon)'
                }
              </span>
            </div>

          </div>

          <hr className="border-border-main" />

          {/* Action Buttons - Cart & WhatsApp */}
          <div className="pt-2 space-y-3">
            {stockCount > 0 ? (
              <>
                {currentUser?.role === 'customer' && (
                  <button
                    onClick={() => {
                      addToCart(product.id, selectedSize, selectedColor);
                      alert(`Successfully added 1x "${product.name}" (Size: ${selectedSize}, Color: ${selectedColor}) to your Shopping Bag!`);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-text-primary text-bg-primary py-3 px-6 rounded-2xl font-semibold text-xs shadow-sm hover:opacity-90 hover:shadow-md transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4.5 h-4.5" />
                    <span>Add to Shopping Bag</span>
                  </button>
                )}

                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackClick('product', product.id)}
                  className="w-full flex items-center justify-center space-x-2 border border-border-main hover:bg-bg-tertiary text-text-secondary hover:text-text-primary py-3 px-6 rounded-2xl font-semibold text-xs transition-all"
                >
                  <MessageCircle className="w-4.5 h-4.5 text-text-tertiary" />
                  <span>Inquire via WhatsApp</span>
                </a>
              </>
            ) : (
              <button
                disabled
                className="w-full bg-bg-tertiary text-text-tertiary border border-border-main py-3 px-6 rounded-2xl font-semibold text-xs cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            )}

            {/* Instagram Link */}
            {store.instagram && (
              <a
                href={`https://instagram.com/${store.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full flex items-center justify-center space-x-2 border border-border-main hover:bg-bg-tertiary py-3 px-6 rounded-2xl font-semibold text-xs text-text-secondary hover:text-text-primary transition-all"
              >
                <svg className="w-4 h-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <span>Browse @{store.instagram} on Instagram</span>
              </a>
            )}
          </div>

          {/* Delivery & Returns Details */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-left">
            <div className="space-y-1 text-center sm:text-left">
              <Truck className="w-4 h-4 text-text-secondary mx-auto sm:mx-0" />
              <h5 className="text-[10px] font-bold uppercase text-text-primary">Free Shipping</h5>
              <p className="text-[10px] text-text-tertiary">On orders over Rs. 15,000</p>
            </div>
            <div className="space-y-1 text-center sm:text-left border-x border-border-main px-2">
              <RotateCcw className="w-4 h-4 text-text-secondary mx-auto sm:mx-0" />
              <h5 className="text-[10px] font-bold uppercase text-text-primary">14-Day Returns</h5>
              <p className="text-[10px] text-text-tertiary">Easy hassle-free returns</p>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 text-text-secondary mx-auto sm:mx-0" />
              <h5 className="text-[10px] font-bold uppercase text-text-primary">Authentic Wear</h5>
              <p className="text-[10px] text-text-tertiary">Verified store sellers</p>
            </div>
          </div>

        </div>

      </div>

      {/* Boutique Mini Profile */}
      <div className="rounded-3xl bg-bg-secondary border border-border-main p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border-main bg-white">
            <img
              src={store.logo}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left space-y-1">
            <h4 className="font-serif text-base font-bold text-text-primary">{store.name}</h4>
            <p className="text-xs text-text-secondary line-clamp-1">{store.description}</p>
          </div>
        </div>
        <button
          onClick={() => navigateToStore(store.slug)}
          className="px-4 py-2 rounded-2xl bg-bg-tertiary hover:bg-border-main border border-border-main text-xs font-semibold text-text-primary transition-all shrink-0"
        >
          Visit Boutique Profile
        </button>
      </div>

      {/* Customer Reviews Section */}
      <section className="space-y-8 border-t border-border-main pt-10">
        <div>
          <h3 className="font-serif text-xl font-bold text-text-primary">Customer Reviews</h3>
          <p className="text-xs text-text-secondary mt-0.5">Read feedback or share your shopping experience with this piece.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Summary Ratings Column */}
          <div className="lg:col-span-4 bg-bg-secondary border border-border-main rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Ratings Overview</h4>
            
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-text-primary">
                {productReviews.length > 0 ? (productReviews.reduce((sum: number, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) : '0.0'}
              </span>
              <span className="text-sm text-text-tertiary">out of 5</span>
            </div>

            <div className="flex items-center space-x-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => {
                const avg = productReviews.length > 0 ? (productReviews.reduce((sum: number, r) => sum + r.rating, 0) / productReviews.length) : 0;
                return (
                  <Star 
                    key={s} 
                    className={`w-4 h-4 ${s <= Math.round(avg) ? 'fill-amber-500 text-amber-500' : 'text-text-tertiary'}`} 
                  />
                );
              })}
              <span className="text-xs text-text-tertiary pl-1.5 font-medium">({productReviews.length} reviews)</span>
            </div>

            {/* Histogram Progress Bars */}
            <div className="space-y-2 pt-2 border-t border-border-main border-dashed">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = productReviews.filter(r => r.rating === stars).length;
                const pct = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center text-xs text-text-secondary">
                    <span className="w-12 font-medium">{stars} Star</span>
                    <div className="flex-grow mx-3 h-2 rounded-full bg-bg-tertiary overflow-hidden border border-border-main">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-text-tertiary font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card-main border border-border-main rounded-3xl p-6 space-y-6">
              <h4 className="text-sm font-semibold text-text-primary border-b border-border-main pb-3">
                Shoppers Feedback ({productReviews.length})
              </h4>
              
              <div className="divide-y divide-border-main space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2 text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-xs text-text-primary">{rev.customerName}</p>
                        <p className="text-[10px] text-text-tertiary">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-text-tertiary'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed bg-bg-secondary/20 p-3 rounded-2xl border border-border-main/50">
                      {rev.comment}
                    </p>
                  </div>
                ))}

                {productReviews.length === 0 && (
                  <div className="text-center py-10 space-y-2 text-text-tertiary">
                    <Star className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-medium">Be the first to review this product</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Submission Form (Visible to customer mode only) */}
            {currentUser?.role === 'customer' && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newReviewName.trim() || !newReviewComment.trim()) {
                    alert("Please write a comment and provide your name.");
                    return;
                  }
                  addProductReview(product.id, {
                    customerName: newReviewName,
                    rating: newReviewRating,
                    comment: newReviewComment
                  });
                  setNewReviewName('');
                  setNewReviewComment('');
                  setNewReviewRating(5);
                  alert("Review submitted successfully! Thank you for your feedback.");
                }}
                className="bg-card-main border border-border-main rounded-3xl p-6 space-y-4 text-left"
              >
                <h4 className="text-sm font-semibold text-text-primary">Share Your Experience</h4>

                {/* Rating selection (stars) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Your Rating</label>
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewReviewRating(s)}
                        onMouseEnter={() => setStarHover(s)}
                        onMouseLeave={() => setStarHover(null)}
                        className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star 
                          className={`w-5 h-5 ${(starHover !== null ? s <= starHover : s <= newReviewRating) ? 'fill-amber-500 text-amber-500' : 'text-text-tertiary'}`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs text-text-tertiary pl-2 font-medium">
                      ({newReviewRating} / 5 stars)
                    </span>
                  </div>
                </div>

                {/* Name & comment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Samprada Shrestha"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-secondary text-xs border border-border-main rounded-xl text-text-primary focus:outline-none focus:border-text-primary transition-all"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Comment Feedback</label>
                    <textarea
                      placeholder="What did you think of the material quality, size fit, or design tailoring?"
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-secondary text-xs border border-border-main rounded-xl text-text-primary focus:outline-none focus:border-text-primary transition-all resize-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-semibold shadow-sm hover:opacity-95 transition-all cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Recently Viewed Carousel */}
      {recentProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border-main pb-3">
            Recently Viewed Pieces
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recentProducts.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
