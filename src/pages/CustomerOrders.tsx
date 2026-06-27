import React from 'react';
import { useMarketplace, type Order } from '../context/MarketplaceContext';
import { 
  ArrowLeft, ShoppingBag, MessageCircle, FileText, 
  CheckCircle2, Clock, Truck, Tag, XCircle
} from 'lucide-react';
export const CustomerOrders: React.FC = () => {
  const { 
    orders, 
    currentUser, 
    stores, 
    products, 
    navigateToHome 
  } = useMarketplace();

  // Find orders matching current customer's email
  const customerOrders = orders.filter(o => o.customerEmail === currentUser?.email);

  // Calculate stats
  const totalOrders = customerOrders.length;
  const activeOrdersCount = customerOrders.filter(o => 
    o.status !== 'completed' && o.status !== 'cancelled'
  ).length;
  const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Sort orders newest first
  const sortedOrders = [...customerOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleWhatsAppInquiry = (order: Order) => {
    const store = stores.find(s => s.id === order.storeId);
    if (!store || !store.whatsapp) {
      alert("This boutique hasn't set up their WhatsApp line. Please contact support.");
      return;
    }

    const message = 
      `Hello ${store.name}, I am checking on the status of my order!\n\n` +
      `*Order ID:* ${order.id}\n` +
      `*Status:* ${order.status.toUpperCase()}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Total Invoice:* Rs. ${order.totalAmount.toLocaleString()}\n\n` +
      `Please let me know the shipping or payout update. Thank you!`;

    const cleanPhone = store.whatsapp.replace(/\+/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={navigateToHome}
          className="p-2 rounded-xl border border-border-main bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-text-tertiary">Buyer Account</span>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-text-primary mt-0.5">My Purchases</h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Invoices</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-text-primary">{totalOrders}</span>
            <span className="text-xs text-text-secondary font-medium">registered</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Active Shipments</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-text-primary">{activeOrdersCount}</span>
            <span className="text-xs text-text-secondary font-medium">in progress</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Accumulated Spend</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-text-primary">Rs. {totalSpent.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="text-center py-20 bg-card-main border border-border-main rounded-3xl space-y-4 max-w-lg mx-auto">
          <ShoppingBag className="w-12 h-12 text-text-tertiary mx-auto" />
          <div>
            <h3 className="font-semibold text-text-primary">No purchase history found</h3>
            <p className="text-xs text-text-secondary mt-1">
              You haven't checked out any designer pieces yet. Browse stores to make your first buy.
            </p>
          </div>
          <button
            onClick={navigateToHome}
            className="px-6 py-2.5 rounded-xl bg-text-primary text-bg-primary font-semibold text-xs hover:opacity-90 transition-all cursor-pointer"
          >
            Start Discovering
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedOrders.map((ord) => {
            const store = stores.find(s => s.id === ord.storeId);
            const originalSubtotal = ord.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
            const discount = originalSubtotal - ord.totalAmount;

            return (
              <div 
                key={ord.id} 
                className="bg-card-main border border-border-main rounded-3xl p-6 shadow-sm space-y-4 text-left"
              >
                {/* Header block */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-border-main">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-2">
                      <span className="font-serif font-bold text-sm tracking-wide text-text-primary">
                        Invoice ID: {ord.id}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                        ord.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        ord.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        ord.status === 'shipped' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                        ord.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                        {getStatusIcon(ord.status)}
                        <span>{ord.status}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-text-tertiary">
                      Placed on: {new Date(ord.createdAt).toLocaleDateString()} &bull; {new Date(ord.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-text-tertiary">Boutique Wardrobe</p>
                    <span className="font-bold text-xs text-text-primary">{store?.name || 'Independent Store'}</span>
                  </div>
                </div>

                {/* Items layout */}
                <div className="space-y-4">
                  {ord.items.map((item, idx) => {
                    const prodObj = products.find(p => p.id === item.productId);
                    const thumb = prodObj?.images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&auto=format&fit=crop&q=80';
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-3">
                          <img src={thumb} alt={item.productName} className="w-9 h-11 object-cover rounded-lg border border-border-main bg-bg-secondary" />
                          <div className="space-y-0.5">
                            <h4 className="font-semibold text-text-primary">{item.productName}</h4>
                            <p className="text-[10px] text-text-secondary font-medium">
                              Size: {item.selectedSize} | Color: {item.selectedColor}
                            </p>
                            <p className="text-[10px] text-text-tertiary">
                              {item.quantity} x Rs. {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-text-primary">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotals block */}
                <div className="border-t border-border-main border-dashed pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-text-secondary font-medium">
                      <span>Delivery Address:</span>
                      <span className="text-text-primary truncate max-w-[200px]" title={ord.shippingAddress}>
                        {ord.shippingAddress}
                      </span>
                    </div>
                    {discount > 0 && (
                      <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1 uppercase">
                        <Tag className="w-3 h-3" />
                        <span>Promo Code Savings: -Rs. {discount.toLocaleString()}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
                    <div className="text-left sm:text-right col-span-2">
                      <span className="text-[10px] text-text-tertiary">Total Amount Paid</span>
                      <p className="text-base font-bold text-text-primary leading-tight">
                        Rs. {ord.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleWhatsAppInquiry(ord)}
                      className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer group"
                    >
                      <MessageCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>Chat with Seller</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
