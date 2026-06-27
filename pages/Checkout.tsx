import React, { useState } from 'react';
import { useMarketplace, type Order } from '../context/MarketplaceContext';
import { 
  ArrowLeft, CheckCircle2, ShoppingBag, 
  MessageCircle, FileText, Truck, User, 
  Mail, Phone, MapPin, ChevronRight, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Checkout: React.FC = () => {
  const { 
    cart, 
    products, 
    stores, 
    checkoutCart, 
    navigateToHome,
    coupons
  } = useMarketplace();

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Checkout Phase: 'form' | 'success'
  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [createdOrders, setCreatedOrders] = useState<Order[]>([]);

  // Coupon State
  const [couponInputs, setCouponInputs] = useState<{ [storeId: string]: string }>({});
  const [appliedCoupons, setAppliedCoupons] = useState<{ [storeId: string]: any }>({});
  const [couponErrors, setCouponErrors] = useState<{ [storeId: string]: string }>({});

  // Compute Cart Items with product details
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

  // Group items by boutique for the order summary view
  const itemsByBoutique = cartWithDetails.reduce((acc, item) => {
    const storeName = item.store?.name || 'Independent Boutique';
    if (!acc[storeName]) {
      acc[storeName] = [];
    }
    acc[storeName].push(item);
    return acc;
  }, {} as { [key: string]: typeof cartWithDetails });

  const handleApplyCoupon = (storeId: string) => {
    const code = couponInputs[storeId]?.trim().toUpperCase();
    if (!code) {
      setCouponErrors(prev => ({ ...prev, [storeId]: 'Please enter a code' }));
      return;
    }

    const foundCoupon = coupons.find(
      c => c.storeId === storeId && c.code.toUpperCase() === code && c.isActive
    );

    if (!foundCoupon) {
      setCouponErrors(prev => ({ ...prev, [storeId]: 'Invalid or inactive code' }));
      setAppliedCoupons(prev => {
        const next = { ...prev };
        delete next[storeId];
        return next;
      });
      return;
    }

    const items = Object.values(itemsByBoutique).find(group => group[0]?.store?.id === storeId) || [];
    const boutiqueSubtotal = items.reduce((acc, item) => {
      return acc + (item.product ? item.product.price * item.quantity : 0);
    }, 0);

    if (boutiqueSubtotal < foundCoupon.minOrderAmount) {
      setCouponErrors(prev => ({ ...prev, [storeId]: `Min order of Rs. ${foundCoupon.minOrderAmount.toLocaleString()} required` }));
      return;
    }

    setAppliedCoupons(prev => ({ ...prev, [storeId]: foundCoupon }));
    setCouponErrors(prev => ({ ...prev, [storeId]: '' }));
  };

  const handleRemoveCoupon = (storeId: string) => {
    setAppliedCoupons(prev => {
      const next = { ...prev };
      delete next[storeId];
      return next;
    });
    setCouponInputs(prev => ({ ...prev, [storeId]: '' }));
    setCouponErrors(prev => ({ ...prev, [storeId]: '' }));
  };

  const getBoutiqueDiscount = (storeId: string, bSubtotal: number) => {
    const coupon = appliedCoupons[storeId];
    if (!coupon) return 0;
    if (coupon.discountType === 'percentage') {
      return Math.round(bSubtotal * (coupon.discountValue / 100));
    } else {
      return coupon.discountValue;
    }
  };

  const totalDiscount = Object.keys(itemsByBoutique).reduce((acc, boutiqueName) => {
    const items = itemsByBoutique[boutiqueName];
    const storeId = items[0]?.store?.id || '';
    const boutiqueSubtotal = items.reduce((sum, item) => sum + (item.product ? item.product.price * item.quantity : 0), 0);
    return acc + getBoutiqueDiscount(storeId, boutiqueSubtotal);
  }, 0);

  const finalTotal = Math.max(0, subtotal - totalDiscount);

  // Validate form fields
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Valid email is required';
    if (!phone.trim() || phone.length < 9) errors.phone = 'Valid phone number is required';
    if (!address.trim()) errors.address = 'Shipping address is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const couponCodesMap: { [storeId: string]: string } = {};
    Object.keys(appliedCoupons).forEach(storeId => {
      couponCodesMap[storeId] = appliedCoupons[storeId].code;
    });

    // Call checkoutCart to split orders, reduce stocks, and clear cart
    const orders = await checkoutCart({
      name,
      email,
      phone,
      shippingAddress: address
    }, couponCodesMap);

    setCreatedOrders(orders);
    setPhase('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = (order: Order) => {
    const store = stores.find(s => s.id === order.storeId);
    if (!store || !store.whatsapp) {
      alert("This store hasn't set up their WhatsApp contact yet. An email confirmation has been logged.");
      return;
    }

    const itemsText = order.items.map(
      item => `- ${item.productName} (Size: ${item.selectedSize}, Color: ${item.selectedColor}) x${item.quantity}`
    ).join('\n');

    const message = 
      `Hello ${store.name}, I just placed an order on Clothza!\n\n` +
      `*Order ID:* ${order.id}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.customerPhone}\n` +
      `*Address:* ${order.shippingAddress}\n\n` +
      `*Items:* \n${itemsText}\n\n` +
      `*Total Amount:* Rs. ${order.totalAmount.toLocaleString()}\n\n` +
      `Please confirm availability. Thank you!`;

    const cleanPhone = store.whatsapp.replace(/\+/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      
      {phase === 'form' ? (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={navigateToHome}
              className="p-2 rounded-xl border border-border-main bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Checkout Details</h1>
              <p className="text-xs text-text-secondary">Complete your details to place orders with the boutiques</p>
            </div>
          </div>

          {/* Form and Summary Columns */}
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-card-main border border-border-main rounded-3xl space-y-4 max-w-lg mx-auto">
              <ShoppingBag className="w-12 h-12 text-text-tertiary mx-auto" />
              <div>
                <h3 className="font-semibold text-text-primary">No items to check out</h3>
                <p className="text-xs text-text-secondary mt-1">Your cart is empty. Go back to browse premium collections.</p>
              </div>
              <button
                onClick={navigateToHome}
                className="px-6 py-2.5 rounded-xl bg-text-primary text-bg-primary font-semibold text-xs hover:opacity-90 transition-all cursor-pointer"
              >
                Back to Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form - Left Column */}
              <div className="lg:col-span-7 bg-card-main border border-border-main rounded-3xl p-6 sm:p-8 space-y-6">
                <h2 className="text-base font-semibold text-text-primary border-b border-border-main pb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-text-secondary" />
                  <span>Shipping & Contact Information</span>
                </h2>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Samir Thapa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm bg-bg-secondary border text-text-primary transition-all focus:outline-none focus:border-text-primary ${
                        formErrors.name ? 'border-red-500/50' : 'border-border-main'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[10px] text-red-500 font-medium">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="samir@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm bg-bg-secondary border text-text-primary transition-all focus:outline-none focus:border-text-primary ${
                        formErrors.email ? 'border-red-500/50' : 'border-border-main'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-[10px] text-red-500 font-medium">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number (Ncell/NTC)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9841234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm bg-bg-secondary border text-text-primary transition-all focus:outline-none focus:border-text-primary ${
                        formErrors.phone ? 'border-red-500/50' : 'border-border-main'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-[10px] text-red-500 font-medium">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Shipping Address
                    </label>
                    <textarea
                      placeholder="e.g. Lazimpat, House #24, Kathmandu"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm bg-bg-secondary border text-text-primary transition-all focus:outline-none focus:border-text-primary resize-none ${
                        formErrors.address ? 'border-red-500/50' : 'border-border-main'
                      }`}
                    />
                    {formErrors.address && (
                      <p className="text-[10px] text-red-500 font-medium">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Payment Simulator Notice */}
                  <div className="p-4 rounded-2xl bg-bg-secondary border border-border-main space-y-2">
                    <h3 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-text-secondary" />
                      Payment Method
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      <strong>Cash on Delivery (COD) / Cash Inquiry</strong>. Since Clothza is a curated multi-tenant marketplace, you will check out and finalize shipping details with boutiques. You can chat directly with vendors via WhatsApp to arrange instant eSewa/Khalti payouts or store pickups.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-4 py-3 rounded-2xl bg-text-primary text-bg-primary hover:bg-text-secondary font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                  >
                    <span>Place Order (Rs. {finalTotal.toLocaleString()})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Order Summary - Right Column */}
              <div className="lg:col-span-5 bg-bg-secondary border border-border-main rounded-3xl p-6 h-fit space-y-6">
                <h2 className="text-sm font-semibold text-text-primary border-b border-border-main pb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-text-secondary" />
                  <span>Order Summary</span>
                </h2>

                <div className="space-y-6 divide-y divide-border-main">
                  {Object.keys(itemsByBoutique).map((boutiqueName) => {
                    const items = itemsByBoutique[boutiqueName];
                    const storeId = items[0]?.store?.id || '';
                    const boutiqueSubtotal = items.reduce((sum, item) => sum + (item.product ? item.product.price * item.quantity : 0), 0);
                    const appliedCoupon = appliedCoupons[storeId];
                    const discount = getBoutiqueDiscount(storeId, boutiqueSubtotal);
                    const currentInput = couponInputs[storeId] || '';
                    const currentError = couponErrors[storeId] || '';

                    return (
                      <div key={boutiqueName} className="space-y-3 pt-4 first:pt-0">
                        <h3 className="text-xs font-bold text-text-secondary tracking-wider uppercase flex justify-between items-center">
                          <span>Boutique: {boutiqueName}</span>
                          {appliedCoupon && (
                            <span className="text-[9px] text-green-500 font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 uppercase">
                              Applied: {appliedCoupon.code}
                            </span>
                          )}
                        </h3>
                        
                        <div className="space-y-3">
                          {items.map((item, index) => (
                            <div key={index} className="flex justify-between items-start text-xs">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-text-primary line-clamp-1">{item.product?.name}</p>
                                <p className="text-[10px] text-text-secondary font-medium">
                                  Size: {item.selectedSize} | Color: {item.selectedColor}
                                </p>
                                <p className="text-[10px] text-text-secondary font-medium">
                                  Qty: {item.quantity} x Rs. {item.product?.price.toLocaleString()}
                                </p>
                              </div>
                              <span className="font-bold text-text-primary whitespace-nowrap pl-4">
                                Rs. {((item.product?.price || 0) * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Coupon Box */}
                        <div className="bg-bg-primary/50 p-3 rounded-2xl border border-border-main/50 space-y-2 mt-3 text-xs">
                          {appliedCoupon ? (
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <p className="font-bold text-green-600 dark:text-green-400">
                                  Saved: -Rs. {discount.toLocaleString()}
                                </p>
                                <p className="text-[9px] text-text-tertiary">
                                  ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `Rs. ${appliedCoupon.discountValue.toLocaleString()}`} off)
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCoupon(storeId)}
                                className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase border border-red-500/20 bg-red-500/5 px-2 py-1 rounded-lg cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Promo Code"
                                  value={currentInput}
                                  onChange={(e) => setCouponInputs(prev => ({ ...prev, [storeId]: e.target.value }))}
                                  className="w-full px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-main text-[11px] focus:outline-none focus:border-text-primary uppercase"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleApplyCoupon(storeId)}
                                  className="px-3.5 py-1.5 rounded-lg bg-text-primary text-bg-primary font-bold text-[10px] hover:opacity-90 transition-all uppercase cursor-pointer"
                                >
                                  Apply
                                </button>
                              </div>
                              {currentError && (
                                <p className="text-[9px] text-red-500 font-semibold">{currentError}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal metrics */}
                <div className="border-t border-border-main pt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-text-secondary font-medium">
                    <span>Shipping Total</span>
                    <span>Calculated by Boutique</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs text-green-500 font-semibold border-t border-border-main border-dashed pt-2 mt-1">
                      <span>Promo Discount</span>
                      <span>-Rs. {totalDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm font-bold text-text-primary border-t border-border-main border-dashed pt-3 mt-1">
                    <span>Est. Total Amount</span>
                    <span>Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Order Success Page */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center space-y-8 py-10"
        >
          {/* Confirmed Animation Headers */}
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 border border-green-500/30 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-text-primary tracking-tight">Order Placed Successfully!</h1>
              <p className="text-sm text-text-secondary mt-1.5 max-w-md mx-auto">
                Thank you for your order, {name}! Your checkout has been successfully registered. Below are the custom boutique receipts.
              </p>
            </div>
          </div>

          {/* Boutique Splitted Invoices */}
          <div className="space-y-4 text-left">
            <h2 className="text-xs font-bold text-text-secondary tracking-wider uppercase px-1">
              Split Invoices ({createdOrders.length})
            </h2>

            {createdOrders.map((order) => {
              const boutique = stores.find(s => s.id === order.storeId);
              return (
                <div 
                  key={order.id} 
                  className="bg-card-main border border-border-main rounded-3xl p-6 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-border-main">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-text-secondary" />
                        Invoice: <span className="font-serif">{order.id}</span>
                      </h3>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Boutique: <span className="font-semibold text-text-primary">{boutique?.name}</span>
                      </p>
                    </div>
                    <div className="text-right sm:text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 capitalize">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Invoice items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs text-text-primary">
                        <div className="flex-1 pr-4 font-medium">
                          {item.productName} <span className="text-text-tertiary">({item.selectedSize}, {item.selectedColor})</span>
                          <span className="text-text-secondary pl-1 font-normal">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Invoice footer details */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-3 border-t border-border-main border-dashed gap-4">
                    <div>
                      <span className="text-xs text-text-secondary">Amount Due:</span>
                      <p className="text-base font-bold text-text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                    </div>
                    
                    {/* WhatsApp Action */}
                    <button
                      onClick={() => handleWhatsAppClick(order)}
                      className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm group"
                    >
                      <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>Confirm via WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global actions */}
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={navigateToHome}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-text-primary text-bg-primary hover:opacity-90 font-semibold text-sm transition-all cursor-pointer shadow-sm"
            >
              Continue Shopping
            </button>
            <p className="text-[10px] text-text-secondary max-w-xs sm:text-left">
              *You can always view your orders and modify statuses by switching user roles using the top-right profile switcher.
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
};
