import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    products, 
    stores, 
    updateCartQuantity, 
    removeFromCart, 
    navigateToCheckout 
  } = useMarketplace();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Compute product details and subtotal
  const cartWithDetails = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    const store = product ? stores.find(s => s.id === product.storeId) : null;
    return {
      ...item,
      product,
      store,
    };
  }).filter(item => item.product !== undefined);

  const subtotal = cartWithDetails.reduce((acc, item) => {
    return acc + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  const handleCheckoutClick = () => {
    onClose();
    navigateToCheckout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Sliding Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card-main border-l border-border-main shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-border-main flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-5 h-5 text-text-secondary" />
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">Shopping Bag</h2>
                {totalItems > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-tertiary text-text-secondary border border-border-main">
                    {totalItems}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cartWithDetails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-16 h-16 rounded-full bg-bg-secondary border border-border-main flex items-center justify-center text-text-secondary">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="font-semibold text-text-primary">Your bag is empty</h3>
                    <p className="text-xs text-text-secondary">
                      Explore boutique collections and add hand-picked items to your bag.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl border border-border-main bg-bg-secondary hover:bg-bg-tertiary text-text-primary transition-all cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border-main space-y-4">
                  {cartWithDetails.map((item, idx) => {
                    const prod = item.product!;
                    const store = item.store;
                    return (
                      <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="pt-4 first:pt-0 flex space-x-4">
                        {/* Thumbnail Image */}
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-bg-tertiary border border-border-main flex-shrink-0">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info & Actions */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-semibold text-text-primary line-clamp-1 pr-2">
                                {prod.name}
                              </h4>
                              <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                                Rs. {prod.price.toLocaleString()}
                              </span>
                            </div>
                            
                            {store && (
                              <p className="text-[11px] text-text-secondary font-medium">
                                Boutique: <span className="underline">{store.name}</span>
                              </p>
                            )}

                            <div className="flex items-center space-x-2 pt-1">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-bg-secondary text-[10px] text-text-secondary border border-border-main font-medium">
                                Size: {item.selectedSize}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded-md bg-bg-secondary text-[10px] text-text-secondary border border-border-main font-medium">
                                Color: {item.selectedColor}
                              </span>
                            </div>
                          </div>

                          {/* Action Bar */}
                          <div className="flex justify-between items-center pt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-border-main rounded-lg overflow-hidden bg-bg-secondary">
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                className="p-1 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-text-primary select-none min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                className="p-1 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Trash Button */}
                            <button
                              onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                              className="text-text-secondary hover:text-red-500 p-1 rounded-lg hover:bg-red-50/10 transition-all cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {cartWithDetails.length > 0 && (
              <div className="p-6 border-t border-border-main bg-bg-secondary space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary font-medium">Total Items</span>
                    <span className="text-xs text-text-primary font-semibold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-primary">Subtotal</span>
                    <span className="text-base font-bold text-text-primary">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-normal">
                    Shipping costs and boutique handling fees will be calculated at checkout based on individual store policies.
                  </p>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 rounded-2xl bg-text-primary text-bg-primary hover:bg-text-secondary font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow-md cursor-pointer group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
