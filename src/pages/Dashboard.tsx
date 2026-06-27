import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  BarChart3, Plus, Trash2, Eye, MousePointerClick, 
  ShoppingBag, Edit, Check, Settings, Image as ImageIcon, 
  Sparkles, Megaphone, DollarSign, Calendar, Tag, MessageCircle,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoutiqueWizard } from '../components/BoutiqueWizard';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { ImageUploader } from '../components/ImageUploader';

export const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    stores, 
    products, 
    updateStore,
    addProduct, 
    updateProduct, 
    deleteProduct,
    promoteStore,
    orders,
    updateOrderStatus,
    coupons,
    addCoupon,
    deleteCoupon,
    toggleCouponStatus,
    messages,
    sendChatMessage,
    lookbooks,
    addLookbook,
    deleteLookbook,
    updateUserSubscription,
    updateStoreSubscription
  } = useMarketplace();

  // Find store owned by user
  const store = stores.find((s) => s.ownerId === currentUser?.id || s.id === currentUser?.storeId);

  // Live Chat state & calculations
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const storeMessages = messages ? messages.filter((msg) => msg.storeId === store?.id) : [];
  const uniqueCustomerIds = Array.from(new Set(storeMessages.map((msg) => msg.customerId)));

  const activeSessions = uniqueCustomerIds.map((custValidId) => {
    const custMessages = storeMessages.filter((m) => m.customerId === custValidId);
    const lastMsg = custMessages[custMessages.length - 1];
    const customerName = custMessages.find(m => m.senderId === custValidId)?.senderName || 'Valued Client';

    return {
      customerId: custValidId,
      customerName,
      lastMessageText: lastMsg?.text || '',
      lastMessageAt: lastMsg?.createdAt || new Date().toISOString(),
      lastMessageSenderId: lastMsg?.senderId || ''
    };
  }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const pendingRepliesCount = activeSessions.filter(s => s.lastMessageSenderId !== store?.id).length;

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !activeCustomerId || !replyText.trim()) return;

    sendChatMessage(
      store.id,
      activeCustomerId,
      replyText.trim(),
      store.id,
      store.name
    );
    setReplyText('');
  };

  // Store Editor Form state
  const [storeName, setStoreName] = useState(store?.name || '');
  const [storeDesc, setStoreDesc] = useState(store?.description || '');
  const [storeLogo, setStoreLogo] = useState(store?.logo || '');
  const [storeBanner, setStoreBanner] = useState(store?.banner || '');
  const [storeLocation, setStoreLocation] = useState(store?.location || '');
  const [storeInsta, setStoreInsta] = useState(store?.instagram || '');
  const [storeWA, setStoreWA] = useState(store?.whatsapp || '');
  const [storeTheme, setStoreTheme] = useState(store?.theme || 'minimalist');

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(15000);
  const [newProdCategory, setNewProdCategory] = useState<'Men' | 'Women' | 'Kids' | 'Accessories'>('Women');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdSizes, setNewProdSizes] = useState<string[]>(['S', 'M', 'L']);
  const [newProdColors, setNewProdColors] = useState<string[]>(['Neutral']);
  const [newProdStock, setNewProdStock] = useState(15);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Editing state for products
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'inbox' | 'orders' | 'inventory' | 'coupons' | 'lookbooks' | 'settings'>('analytics');

  // Analytics states
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'clicks' | 'ctr' | 'revenue'>('revenue');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Create Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(0);

  // Lookbook Form States
  const [newLbName, setNewLbName] = useState('');
  const [newLbDesc, setNewLbDesc] = useState('');
  const [newLbItems, setNewLbItems] = useState<any[]>([]);
  const [newLbImage, setNewLbImage] = useState('');
  const [newLbPins, setNewLbPins] = useState<any[]>([]);
  const [activePinProduct, setActivePinProduct] = useState('');
  const [tempPinCoords, setTempPinCoords] = useState<{ x: number; y: number } | null>(null);

  // Subscription States & Helpers
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const currentTier = store?.subscriptionTier || 'bronze';
  
  const isTabLocked = (tabName: string) => {
    if (!store) return false;
    const tier = store.subscriptionTier || 'bronze';
    if (tier === 'bronze') {
      return ['inbox', 'coupons', 'lookbooks'].includes(tabName);
    }
    if (tier === 'silver') {
      return tabName === 'lookbooks';
    }
    return false;
  };

  const LockedTabScreen = ({ requiredTier, currentTier }: { requiredTier: string; currentTier: string }) => (
    <div className="py-16 text-center border border-border-main bg-card-main/80 backdrop-blur-xl rounded-3xl max-w-md mx-auto space-y-6 shadow-xl animate-scale-in">
      <div className="w-16 h-16 bg-amber-600/10 rounded-full flex items-center justify-center mx-auto text-amber-600">
        <Lock className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h3 className="font-serif text-xl font-bold text-text-primary">Feature Locked</h3>
        <p className="text-xs text-text-secondary px-6 leading-relaxed">
          The <span className="capitalize font-bold text-text-primary">{activeTab}</span> panel is only available on the <strong className="text-text-primary capitalize">{requiredTier}</strong> tier. You are currently on the <span className="capitalize text-text-primary font-semibold">{currentTier}</span> tier.
        </p>
      </div>
      <button
        onClick={() => {
          setActiveTab('settings');
          setTimeout(() => {
            const billingEl = document.getElementById('billing-manager');
            if (billingEl) {
              billingEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }}
        className="px-6 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold hover:opacity-90 transition-opacity shadow-lg cursor-pointer animate-pulse-glow"
      >
        Upgrade Subscription Plan
      </button>
    </div>
  );

  if (isChangingPlan && store) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-scale-in text-left">
        <div className="flex justify-between items-center bg-card-main border border-border-main p-6 rounded-3xl">
          <div>
            <h3 className="font-serif text-xl font-bold text-text-primary">Change Subscription Plan</h3>
            <p className="text-xs text-text-secondary mt-1">Upgrade or downgrade your current {store.subscriptionTier} plan.</p>
          </div>
          <button 
            onClick={() => setIsChangingPlan(false)}
            className="px-4 py-2 rounded-xl bg-bg-secondary text-text-primary hover:bg-border-main text-xs font-semibold cursor-pointer animate-fade-in"
          >
            Back to settings
          </button>
        </div>
        <SubscriptionPlans onSuccess={() => {
          setIsChangingPlan(false);
          alert('Subscription updated!');
        }} />
      </div>
    );
  }

  if (!store) {
    const hasActiveSubscription = currentUser?.subscriptionStatus === 'active' && currentUser?.subscriptionTier !== 'none';
    if (!hasActiveSubscription) {
      return (
        <SubscriptionPlans onSuccess={() => {
          // Success callback
        }} />
      );
    }
    return <BoutiqueWizard />;
  }

  // Get store products
  const storeProducts = products.filter((p) => p.storeId === store.id);
  const storeCoupons = coupons.filter((c) => c.storeId === store.id);

  // 1. Calculate Analytics
  // Aggregated Views = Store Views + Sum of Product Views
  const aggregatedViews = store.views + storeProducts.reduce((sum, p) => sum + p.views, 0);
  const aggregatedClicks = store.clicks + storeProducts.reduce((sum, p) => sum + p.clicks, 0);
  const ctr = aggregatedViews > 0 ? ((aggregatedClicks / aggregatedViews) * 100).toFixed(1) : '0';

  // 1.2 Calculate Order Metrics
  const storeOrders = orders.filter(o => o.storeId === store.id);
  const totalOrdersCount = storeOrders.length;
  const completedOrders = storeOrders.filter(o => o.status === 'completed');
  const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = storeOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedCount = completedOrders.length;
  const processingCount = storeOrders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const shippedCount = storeOrders.filter(o => o.status === 'shipped').length;
  const cancelledCount = storeOrders.filter(o => o.status === 'cancelled').length;

  // 1.3 Generate Trend Data
  const getTrendData = () => {
    let daysCount = 7;
    if (timeframe === '30d') daysCount = 30;
    if (timeframe === 'all') daysCount = 90;

    const dataPoints: { date: string; value: number }[] = [];
    const now = new Date();
    
    let baseValue = 0;
    if (selectedMetric === 'views') {
      baseValue = aggregatedViews;
    } else if (selectedMetric === 'clicks') {
      baseValue = aggregatedClicks;
    } else if (selectedMetric === 'ctr') {
      baseValue = parseFloat(ctr);
    } else {
      baseValue = revenue;
    }

    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const avgDailyValue = baseValue / (daysCount * 0.7);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      
      const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const wave = Math.sin(i * 0.4) * 0.25 + 0.75;
      const noise = pseudoRandom(i + store.views) * 0.3 - 0.15;
      
      let val = avgDailyValue * wave * (1 + noise);
      
      if (selectedMetric === 'ctr') {
        val = Math.max(1, Math.min(45, val));
      } else {
        val = Math.max(0, Math.round(val));
      }

      dataPoints.push({
        date: dateString,
        value: val
      });
    }

    return dataPoints;
  };

  const trendData = getTrendData();
  const maxVal = Math.max(...trendData.map(d => d.value), 1);
  const points = trendData.map((d, i) => {
    const x = (i / (trendData.length - 1)) * 500;
    const y = 170 - (d.value / maxVal) * 140;
    return { x, y, data: d, index: i };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z` 
    : '';

  // 2. Add Product Submission
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tier = store.subscriptionTier || 'bronze';
    const productLimit = tier === 'bronze' ? 5 : tier === 'silver' ? 20 : Infinity;
    if (storeProducts.length >= productLimit) {
      alert(`Product listing limit reached! Your current ${tier.toUpperCase()} plan only allows up to ${productLimit} products. Please upgrade your subscription plan under Settings.`);
      return;
    }

    const imgUrl = newProdImg || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80';
    
    // Generate variants array
    const variantsList = newProdSizes.flatMap(size => 
      newProdColors.map(color => ({
        size,
        color,
        stock: newProdStock
      }))
    );

    addProduct(store.id, {
      name: newProdName,
      description: newProdDesc,
      price: newProdPrice,
      category: newProdCategory,
      images: [imgUrl],
      variants: variantsList,
      isBestSeller: false,
      isTrending: false,
      isSponsored: false,
    });

    // Reset Form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice(120);
    setNewProdImg('');
    setIsAddingProduct(false);
    alert('Product successfully added to your boutique catalog!');
  };

  // 3. Save Product Edits
  const handleSaveProductEdit = (productId: string) => {
    // Update price and stock for simplicity
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const updatedVariants = prod.variants.map(v => ({ ...v, stock: editStock }));
    updateProduct(productId, {
      price: editPrice,
      variants: updatedVariants
    });
    setEditingProductId(null);
  };

  // 4. Update Store settings
  const handleUpdateStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore(store.id, {
      name: storeName,
      description: storeDesc,
      logo: storeLogo,
      banner: storeBanner,
      location: storeLocation,
      instagram: storeInsta,
      whatsapp: storeWA,
      theme: storeTheme,
    });
    alert('Boutique profile settings updated successfully!');
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) {
      alert('Coupon code is required.');
      return;
    }
    const cleanCode = newCouponCode.trim().toUpperCase().replace(/\s+/g, '');
    if (cleanCode.length < 3) {
      alert('Coupon code must be at least 3 characters.');
      return;
    }

    addCoupon(store.id, {
      code: cleanCode,
      discountType: newCouponType,
      discountValue: newCouponValue,
      minOrderAmount: newCouponMinOrder,
      isActive: true
    });

    setNewCouponCode('');
    setNewCouponValue(newCouponType === 'percentage' ? 10 : 1000);
    setNewCouponMinOrder(0);
    alert('Coupon successfully created!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-left">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-main pb-6 gap-4">
        <div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-text-tertiary">Boutique Owner Hub</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mt-1">
            {store.name} Portal
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-1 bg-bg-secondary p-1 rounded-2xl border border-border-main self-start sm:self-auto overflow-x-auto scrollbar-none">
          {(['analytics', 'inbox', 'orders', 'inventory', 'coupons', 'lookbooks', 'settings'] as const).map((tab) => {
            const locked = isTabLocked(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-text-primary text-bg-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab === 'analytics' ? 'Dashboard' : tab === 'inbox' ? 'Inbox' : tab === 'lookbooks' ? 'Lookbooks' : tab}
                  {tab === 'inbox' && pendingRepliesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-red-500 text-white leading-none">
                      {pendingRepliesCount}
                    </span>
                  )}
                </span>
                {locked && <Lock className="w-3 h-3 text-text-tertiary" />}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* KPI Counter Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              <div 
                onClick={() => setSelectedMetric('views')}
                className={`p-6 rounded-3xl border space-y-3 cursor-pointer transition-all text-left ${
                  selectedMetric === 'views' 
                    ? 'bg-bg-secondary/60 border-text-primary ring-1 ring-text-primary/10 shadow-sm' 
                    : 'bg-card-main border-border-main hover:bg-bg-secondary/15'
                }`}
              >
                <div className="flex justify-between items-center text-text-tertiary">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Views</span>
                  <Eye className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-text-primary">{aggregatedViews.toLocaleString()}</p>
                <p className="text-[9px] text-text-tertiary">Store + items combined</p>
              </div>

              <div 
                onClick={() => setSelectedMetric('clicks')}
                className={`p-6 rounded-3xl border space-y-3 cursor-pointer transition-all text-left ${
                  selectedMetric === 'clicks' 
                    ? 'bg-bg-secondary/60 border-text-primary ring-1 ring-text-primary/10 shadow-sm' 
                    : 'bg-card-main border-border-main hover:bg-bg-secondary/15'
                }`}
              >
                <div className="flex justify-between items-center text-text-tertiary">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Clicks</span>
                  <MousePointerClick className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-text-primary">{aggregatedClicks.toLocaleString()}</p>
                <p className="text-[9px] text-text-tertiary">CTR redirects to checkout</p>
              </div>

              <div 
                onClick={() => setSelectedMetric('ctr')}
                className={`p-6 rounded-3xl border space-y-3 cursor-pointer transition-all text-left ${
                  selectedMetric === 'ctr' 
                    ? 'bg-bg-secondary/60 border-text-primary ring-1 ring-text-primary/10 shadow-sm' 
                    : 'bg-card-main border-border-main hover:bg-bg-secondary/15'
                }`}
              >
                <div className="flex justify-between items-center text-text-tertiary">
                  <span className="text-[10px] font-bold uppercase tracking-wider">CTR</span>
                  <BarChart3 className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-text-primary">{ctr}%</p>
                <p className="text-[9px] text-text-tertiary">Shopper conversion rate</p>
              </div>

              <div 
                onClick={() => setSelectedMetric('revenue')}
                className={`p-6 rounded-3xl border space-y-3 cursor-pointer transition-all text-left ${
                  selectedMetric === 'revenue' 
                    ? 'bg-bg-secondary/60 border-text-primary ring-1 ring-text-primary/10 shadow-sm' 
                    : 'bg-card-main border-border-main hover:bg-bg-secondary/15'
                }`}
              >
                <div className="flex justify-between items-center text-text-tertiary">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Revenue</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-text-primary">Rs. {revenue.toLocaleString()}</p>
                <p className="text-[9px] text-text-tertiary">Completed orders total</p>
              </div>

              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-3 col-span-2 lg:col-span-1 text-left">
                <div className="flex justify-between items-center text-text-tertiary">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {pendingOrdersCount} <span className="text-xs font-normal text-text-secondary">active / {totalOrdersCount}</span>
                </p>
                <p className="text-[9px] text-text-tertiary">Pending or processing orders</p>
              </div>
            </div>

            {/* Smart Feature: Interactive Dashboard Analytics Chart */}
            <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                    Boutique {selectedMetric === 'views' ? 'Traffic Views' : 
                              selectedMetric === 'clicks' ? 'Conversion Clicks' : 
                              selectedMetric === 'ctr' ? 'Click-Through Rate (CTR)' : 'Gross Revenue'}
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    {timeframe === '7d' ? 'Weekly report' : timeframe === '30d' ? 'Monthly report' : '90-day report'} with daily organic trends
                  </p>
                </div>
                
                <div className="flex items-center space-x-1 bg-bg-secondary border border-border-main p-1 rounded-xl">
                  {(['7d', '30d', 'all'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1 text-[9px] font-bold uppercase rounded-lg transition-all ${
                        timeframe === t 
                          ? 'bg-text-primary text-bg-primary shadow-sm' 
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '90 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Responsive SVG Chart */}
              <div className="h-56 w-full bg-bg-secondary/40 border border-border-main rounded-2xl relative p-6 flex flex-col justify-between overflow-visible">
                <div className="absolute inset-0 p-6 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Fill Area under curve */}
                    {areaPath && <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-300" />}

                    {/* Chart Line */}
                    {linePath && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="var(--text-primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Hover grid lines */}
                    {hoveredPoint !== null && points[hoveredPoint] && (
                      <line
                        x1={points[hoveredPoint].x}
                        y1="10"
                        x2={points[hoveredPoint].x}
                        y2="190"
                        stroke="var(--text-tertiary)"
                        strokeWidth="0.8"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Interactive dots */}
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint === idx ? 6 : 3.5}
                        className={`transition-all duration-150 cursor-pointer ${
                          hoveredPoint === idx 
                            ? 'fill-accent-gold stroke-bg-primary stroke-2' 
                            : 'fill-text-primary stroke-bg-primary stroke-1 hover:fill-accent-gold'
                        }`}
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </svg>
                </div>

                {/* Floating Tooltip */}
                {hoveredPoint !== null && points[hoveredPoint] && (
                  <div 
                    className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-md shadow-lg text-left text-[10px] space-y-0.5 -translate-x-1/2 -translate-y-[calc(100%+14px)] transition-all duration-100"
                    style={{ 
                      left: `${(points[hoveredPoint].x / 500) * 100}%`, 
                      top: `${(points[hoveredPoint].y / 200) * 100}%` 
                    }}
                  >
                    <p className="font-semibold text-text-tertiary">{points[hoveredPoint].data.date}</p>
                    <p className="text-xs font-bold text-text-primary">
                      {selectedMetric === 'revenue' ? 'Rs. ' : ''}
                      {points[hoveredPoint].data.value.toLocaleString()}
                      {selectedMetric === 'ctr' ? '%' : ''}
                      <span className="text-[9px] font-normal text-text-secondary ml-1">
                        {selectedMetric === 'views' ? 'views' : 
                         selectedMetric === 'clicks' ? 'clicks' : 
                         selectedMetric === 'ctr' ? 'CTR' : 'revenue'}
                      </span>
                    </p>
                  </div>
                )}
                
                {/* Horizontal X-Axis Labels */}
                <div className="w-full flex justify-between text-[9px] text-text-tertiary mt-auto pt-2 border-t border-border-main/40 relative z-10">
                  {trendData.map((d, idx) => {
                    const modulo = trendData.length > 15 ? 5 : trendData.length > 8 ? 2 : 1;
                    if (idx % modulo !== 0 && idx !== trendData.length - 1) {
                      return <span key={idx} className="invisible w-0">{d.date}</span>;
                    }
                    return <span key={idx} className="font-medium">{d.date}</span>;
                  })}
                </div>
              </div>
            </div>

            {/* Smart Feature: Bottom Analytics Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Most Visited Products */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4">
                <h3 className="text-sm font-bold text-text-primary text-left">Most Visited Products</h3>
                <div className="divide-y divide-border-main">
                  {storeProducts
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 3)
                    .map((prod) => (
                      <div key={prod.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div className="flex items-center space-x-3">
                          <img src={prod.images[0]} alt={prod.name} className="w-9 h-11 object-cover rounded-lg border border-border-main" />
                          <div className="text-left">
                            <p className="text-xs font-semibold text-text-primary line-clamp-1">{prod.name}</p>
                            <p className="text-[10px] text-text-tertiary">{prod.category} &bull; Rs. {prod.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-2">
                          <Eye className="w-3.5 h-3.5 text-text-tertiary" />
                          <span className="text-xs font-bold text-text-primary">{prod.views}</span>
                        </div>
                      </div>
                    ))}
                  {storeProducts.length === 0 && (
                    <p className="text-xs text-text-secondary text-center py-4">No products listed to show analytics</p>
                  )}
                </div>
              </div>

              {/* Card 2: Order Status Donut Chart Breakdown */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-text-primary text-left">Order Status Summary</h3>
                {totalOrdersCount === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-6 text-center text-xs text-text-secondary">
                    No orders placed yet to calculate status breakdown.
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6 py-2 flex-grow">
                    {/* SVG Donut */}
                    <div className="relative w-28 h-28 shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 140 140">
                        {/* Background grey ring */}
                        <circle
                          cx="70"
                          cy="70"
                          r="50"
                          fill="transparent"
                          className="stroke-bg-secondary"
                          strokeWidth="10"
                        />
                        {/* Status segments */}
                        {(() => {
                          const r = 50;
                          const circ = 2 * Math.PI * r;
                          let accumulatedPercentage = 0;
                          
                          const statuses = [
                            { count: completedCount, color: 'stroke-emerald-500' },
                            { count: processingCount, color: 'stroke-blue-500' },
                            { count: shippedCount, color: 'stroke-purple-500' },
                            { count: cancelledCount, color: 'stroke-rose-500' }
                          ].filter(s => s.count > 0);

                          return statuses.map((s, idx) => {
                            const strokeLength = (s.count / totalOrdersCount) * circ;
                            const strokeOffset = circ - (accumulatedPercentage / 100) * circ;
                            accumulatedPercentage += (s.count / totalOrdersCount) * 100;
                            
                            return (
                              <circle
                                key={idx}
                                cx="70"
                                cy="70"
                                r={r}
                                fill="transparent"
                                className={`${s.color} transition-all duration-300`}
                                strokeWidth="10"
                                strokeDasharray={`${strokeLength} ${circ - strokeLength}`}
                                strokeDashoffset={strokeOffset}
                                strokeLinecap="round"
                                transform="rotate(-90 70 70)"
                              />
                            );
                          });
                        })()}
                      </svg>
                      {/* Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-xl font-bold text-text-primary">{totalOrdersCount}</span>
                        <span className="text-[7px] uppercase tracking-wider font-bold text-text-tertiary">Total</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="flex-1 flex flex-col justify-center space-y-1.5 text-left self-stretch">
                      {[
                        { label: 'Completed', count: completedCount, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
                        { label: 'Processing', count: processingCount, color: 'bg-blue-500', textColor: 'text-blue-500' },
                        { label: 'Shipped', count: shippedCount, color: 'bg-purple-500', textColor: 'text-purple-500' },
                        { label: 'Cancelled', count: cancelledCount, color: 'bg-rose-500', textColor: 'text-rose-500' }
                      ].map((item) => {
                        if (item.count === 0) return null;
                        const pct = ((item.count / totalOrdersCount) * 100).toFixed(0);
                        return (
                          <div key={item.label} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center space-x-1.5 font-semibold text-text-secondary">
                              <span className={`w-2 h-2 rounded-full ${item.color}`} />
                              <span>{item.label}</span>
                            </div>
                            <span className={`font-bold ${item.textColor}`}>{item.count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Monetization Upgrades Panel */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary">Store Promotion Level</h3>
                  <Megaphone className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="space-y-4 text-xs text-text-secondary text-left">
                  <p className="leading-relaxed">
                    Improve catalog visibility by unlocking sponsor slots. Toggling features updates your boutique status instantly in search algorithms.
                  </p>
                  
                  <div className="p-4 rounded-2xl bg-bg-secondary border border-border-main space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-text-primary flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                          Homepage Spotlight
                        </span>
                        <p className="text-[10px] text-text-tertiary">Priority slot in "Featured Boutiques"</p>
                      </div>
                      <button
                        onClick={() => promoteStore(store.id, 'featured')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          store.isFeatured 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-bg-tertiary text-text-secondary border-border-main hover:text-text-primary'
                        }`}
                      >
                        {store.isFeatured ? 'Active' : 'Enable'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-border-main pt-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-text-primary">Sponsored Flag</span>
                        <p className="text-[10px] text-text-tertiary">Displays sponsored tag on catalog card</p>
                      </div>
                      <button
                        onClick={() => promoteStore(store.id, 'sponsored')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          store.isSponsored 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-bg-tertiary text-text-secondary border-border-main hover:text-text-primary'
                        }`}
                      >
                        {store.isSponsored ? 'Active' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 2: Inventory & Catalog Management */}
        {activeTab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Inventory header controls */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary">Store Apparel Items</h3>
              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="px-4 py-2 rounded-xl bg-text-primary text-bg-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center space-x-1.5 shadow-sm"
              >
                {isAddingProduct ? (
                  <span>Close Form</span>
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5" />
                    <span>Add New Apparel</span>
                  </>
                )}
              </button>
            </div>

            {/* Add Product Form Toggle */}
            <AnimatePresence>
              {isAddingProduct && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddProductSubmit}
                  className="p-6 rounded-3xl bg-bg-secondary border border-border-main space-y-4 overflow-hidden"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2">Register New Fashion Piece</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Product Name</label>
                        <input
                          type="text"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full p-2 bg-card-main border border-border-main rounded-xl text-xs"
                          placeholder="e.g. Silk Oversized Shirt"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Description</label>
                        <textarea
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          className="w-full p-2 bg-card-main border border-border-main rounded-xl text-xs h-20"
                          placeholder="Fabric details, fits, sewing details..."
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Price (NPR)</label>
                          <input
                            type="number"
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(Number(e.target.value))}
                            className="w-full p-2 bg-card-main border border-border-main rounded-xl text-xs"
                            min="10"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Category</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value as any)}
                            className="w-full p-2 bg-card-main border border-border-main rounded-xl text-xs"
                          >
                            <option value="Women">Women</option>
                            <option value="Men">Men</option>
                            <option value="Kids">Kids</option>
                            <option value="Accessories">Accessories</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <ImageUploader
                          label="Product Cover Photo"
                          aspectRatio="square"
                          folder="products"
                          initialPreview={newProdImg}
                          onUploadSuccess={(url) => setNewProdImg(url)}
                        />
                        <span className="text-[9px] text-text-tertiary block mt-1">Leave empty to use a random premium fashion template image automatically.</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Default Stock Count</label>
                          <input
                            type="number"
                            value={newProdStock}
                            onChange={(e) => setNewProdStock(Number(e.target.value))}
                            className="w-full p-2 bg-card-main border border-border-main rounded-xl text-xs"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Standard Sizes</label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['XS', 'S', 'M', 'L', 'XL', 'One Size'].map(sz => {
                              const isSel = newProdSizes.includes(sz);
                              return (
                                <button
                                  type="button"
                                  key={sz}
                                  onClick={() => {
                                    setNewProdSizes(prev => 
                                      prev.includes(sz) ? prev.filter(x => x !== sz) : [...prev, sz]
                                    );
                                  }}
                                  className={`px-2 py-0.5 text-[9px] font-bold rounded-lg border transition-all ${
                                    isSel ? 'bg-text-primary text-bg-primary border-text-primary' : 'bg-card-main border-border-main text-text-secondary'
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Colors (Comma separated)</label>
                        <input
                          type="text"
                          value={newProdColors.join(', ')}
                          onChange={(e) => setNewProdColors(e.target.value.split(',').map(s => s.trim()))}
                          className="w-full p-2 bg-card-main border border-border-main rounded-xl text-xs"
                          placeholder="Charcoal, Off-White, Sage"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold shadow-md"
                    >
                      Save and Publish Apparel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Inventory Product List */}
            <div className="bg-card-main border border-border-main rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary text-left border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                      <th className="p-4">Apparel Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Total Stock</th>
                      <th className="p-4">Views/Clicks</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {storeProducts.map((prod) => {
                      const isEditing = editingProductId === prod.id;
                      const totalStock = prod.variants.reduce((sum, v) => sum + v.stock, 0);

                      return (
                        <tr key={prod.id} className="hover:bg-bg-secondary/40 transition-colors">
                          <td className="p-4 flex items-center space-x-3">
                            <div className="w-10 h-12 rounded-lg overflow-hidden border border-border-main shrink-0">
                              <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left max-w-xs sm:max-w-md">
                              <p className="font-semibold text-text-primary truncate">{prod.name}</p>
                              <p className="text-[10px] text-text-tertiary line-clamp-1">{prod.description}</p>
                            </div>
                          </td>
                          <td className="p-4 text-text-secondary font-medium">{prod.category}</td>
                          <td className="p-4 font-bold text-text-primary">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                className="w-16 p-1 bg-bg-secondary border border-border-main rounded text-xs"
                                min="1"
                              />
                            ) : (
                              `Rs. ${prod.price.toLocaleString()}`
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editStock}
                                onChange={(e) => setEditStock(Number(e.target.value))}
                                className="w-16 p-1 bg-bg-secondary border border-border-main rounded text-xs"
                                min="0"
                              />
                            ) : (
                              <span className={`font-semibold ${totalStock === 0 ? 'text-red-500' : 'text-text-primary'}`}>
                                {totalStock} items
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-text-tertiary">
                            <span className="flex items-center space-x-1.5">
                              <span>{prod.views} views</span>
                              <span>&bull;</span>
                              <span>{prod.clicks} clicks</span>
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {isEditing ? (
                                <button
                                  onClick={() => handleSaveProductEdit(prod.id)}
                                  className="p-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                                  title="Save Changes"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingProductId(prod.id);
                                    setEditPrice(prod.price);
                                    setEditStock(prod.variants[0]?.stock || 0);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-secondary transition-all border border-border-main"
                                  title="Quick Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                                    deleteProduct(prod.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-all border border-border-main"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {storeProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-secondary font-medium">
                          No products listed in catalog yet. Click "Add New Apparel" to post your first item.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 3: Store Settings */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Settings Form */}
            <form onSubmit={handleUpdateStoreSettings} className="lg:col-span-2 p-6 rounded-3xl bg-card-main border border-border-main space-y-4">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center space-x-1.5">
                <Settings className="w-4 h-4" />
                <span>Configure Boutique Branding</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Description / Bio</label>
                  <textarea
                    value={storeDesc}
                    onChange={(e) => setStoreDesc(e.target.value)}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Location Address</label>
                  <input
                    type="text"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs"
                    placeholder="Milano, Italy"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Instagram Tag</label>
                  <input
                    type="text"
                    value={storeInsta}
                    onChange={(e) => setStoreInsta(e.target.value)}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs"
                    placeholder="insta.handle"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">WhatsApp Mobile Contact</label>
                  <input
                    type="text"
                    value={storeWA}
                    onChange={(e) => setStoreWA(e.target.value)}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs"
                    placeholder="+39..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Boutique Theme Preset</label>
                  <select
                    value={storeTheme}
                    onChange={(e) => {
                      const val = e.target.value;
                      const tier = store.subscriptionTier || 'bronze';
                      if (tier === 'bronze' && ['streetwear', 'linen', 'leather'].includes(val)) {
                        alert('Streetwear, Linen, and Leather themes are only available on Silver and Gold tiers. Please upgrade your subscription plan.');
                        return;
                      }
                      if (tier === 'silver' && val === 'leather') {
                        alert('Classic Leather theme is only available on the Gold subscription tier. Please upgrade your subscription plan.');
                        return;
                      }
                      setStoreTheme(val as any);
                    }}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs font-semibold focus:outline-none focus:border-text-primary"
                  >
                    <option value="minimalist">Minimalist (Monochrome, Serif)</option>
                    <option value="streetwear">Streetwear (Bold, Geometric, High-contrast)</option>
                    <option value="linen">Linen (Beige, Warm sand, Soft organic)</option>
                    <option value="leather">Leather (Amber-brown focus, Rich contrast)</option>
                    <option value="custom">Custom (Standard theme)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold shadow-md"
                >
                  Save Store Profile Changes
                </button>
              </div>
            </form>

            {/* Logo and Banner Previews */}
            <div className="space-y-6">
              
              {/* Media configurations */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Branding Assets</span>
                </h3>
                
                <div className="space-y-4">
                  <ImageUploader
                    label="Boutique Logo"
                    aspectRatio="square"
                    folder="boutique-logos"
                    initialPreview={storeLogo}
                    onUploadSuccess={(url) => setStoreLogo(url)}
                  />
                  <ImageUploader
                    label="Boutique Cover Banner"
                    aspectRatio="banner"
                    folder="boutique-banners"
                    initialPreview={storeBanner}
                    onUploadSuccess={(url) => setStoreBanner(url)}
                  />
                </div>
              </div>

              {/* Layout Preview */}
              <div className="p-4 rounded-3xl bg-card-main border border-border-main space-y-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Quick Preview</span>
                <div className="h-28 rounded-2xl overflow-hidden relative bg-bg-tertiary">
                  <img src={storeBanner} alt="Banner Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute bottom-2 left-3 flex items-center space-x-2 text-white text-left">
                    <img src={storeLogo} alt="Logo" className="w-8 h-8 rounded-lg border border-white bg-white" />
                    <div>
                      <p className="text-xs font-bold leading-tight truncate w-28">{storeName}</p>
                      <p className="text-[9px] text-white/80 leading-none">{storeLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Billing & Subscriptions Manager */}
            <div id="billing-manager" className="p-6 rounded-3xl bg-card-main border border-border-main space-y-6">
              <div className="border-b border-border-main pb-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-text-secondary" />
                  <span>Billing & Subscriptions</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Manage your digital storefront subscription and past invoices.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Plan details */}
                <div className="space-y-4">
                  <div className="p-4 bg-bg-secondary/40 border border-border-main rounded-2xl space-y-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">Active Plan</span>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-serif text-lg font-bold text-text-primary capitalize">{store.subscriptionTier || 'bronze'} Tier</h4>
                      <span className="text-xs font-semibold text-text-secondary font-mono">
                        Rs. {store.subscriptionTier === 'gold' ? '7,500' : store.subscriptionTier === 'silver' ? '3,500' : '1,500'} / mo
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border-main text-text-secondary">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-text-tertiary">Status</span>
                        <span className="inline-flex items-center gap-1.5 mt-0.5 text-emerald-500 font-bold capitalize">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {store.subscriptionStatus || 'active'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-text-tertiary">Next Renewal</span>
                        <span className="block font-semibold text-text-primary mt-0.5">
                          {store.subscriptionExpiresAt 
                            ? new Date(store.subscriptionExpiresAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsChangingPlan(true)}
                      className="px-4 py-2 bg-text-primary text-bg-primary text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                    >
                      Change Subscription Tier
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel your boutique subscription membership? Your storefront will be locked and hidden from catalog discovery.')) {
                          if (currentUser) {
                            updateUserSubscription(currentUser.id, 'none', 'inactive', '');
                            updateStoreSubscription(store.id, store.subscriptionTier || 'bronze', 'inactive', '');
                            alert('Boutique subscription cancelled successfully.');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel Membership
                    </button>
                  </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">Past Billing Statements</span>
                  
                  <div className="overflow-hidden border border-border-main rounded-2xl bg-bg-secondary/15">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                          <th className="p-3">Statement Date</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3 text-right">Invoicing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main text-text-primary">
                        {[
                          { id: 'CLZ-INV-01', date: '2026-06-01', desc: `${(store.subscriptionTier || 'bronze').toUpperCase()} Plan`, amt: store.subscriptionTier === 'gold' ? 7500 : store.subscriptionTier === 'silver' ? 3500 : 1500 },
                          { id: 'CLZ-INV-02', date: '2026-05-01', desc: `${(store.subscriptionTier || 'bronze').toUpperCase()} Plan`, amt: store.subscriptionTier === 'gold' ? 7500 : store.subscriptionTier === 'silver' ? 3500 : 1500 }
                        ].map((inv) => (
                          <tr key={inv.id} className="hover:bg-bg-secondary/20 transition-colors">
                            <td className="p-3 font-semibold">
                              {new Date(inv.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="p-3 capitalize">{inv.desc}</td>
                            <td className="p-3 font-bold">Rs. {inv.amt.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 uppercase">
                                Paid
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 5: Coupons Management */}
        {activeTab === 'coupons' && (
          isTabLocked('coupons') ? (
            <LockedTabScreen requiredTier="silver" currentTier={currentTier} />
          ) : (
            <motion.div
              key="coupons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
            {/* Create Coupon Form */}
            <form onSubmit={handleCreateCouponSubmit} className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4 h-fit">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-text-secondary" />
                <span>Create Promo Coupon</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER10"
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs uppercase"
                    required
                  />
                  <p className="text-[9px] text-text-tertiary mt-1">Uppercase letters and numbers only, no spaces.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => {
                      const type = e.target.value as 'percentage' | 'fixed';
                      setNewCouponType(type);
                      setNewCouponValue(type === 'percentage' ? 10 : 1000);
                    }}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed Amount Off (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                    Discount Value {newCouponType === 'percentage' ? '(%)' : '(Rs.)'}
                  </label>
                  <input
                    type="number"
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    min="1"
                    max={newCouponType === 'percentage' ? 100 : 50000}
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Minimum Order Value (Rs.)</label>
                  <input
                    type="number"
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                    min="0"
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs"
                    required
                  />
                  <p className="text-[9px] text-text-tertiary mt-1">Minimum boutique subtotal to apply this coupon.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold shadow-md cursor-pointer"
                >
                  Create & Activate Coupon
                </button>
              </div>
            </form>

            {/* Coupons List */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-card-main border border-border-main space-y-4">
              <h3 className="text-sm font-bold text-text-primary">Boutique Promo Codes</h3>
              <p className="text-xs text-text-secondary">Active coupons available for customer checkout validations.</p>

              {storeCoupons.length === 0 ? (
                <div className="text-center py-16 bg-bg-secondary/40 border border-border-main border-dashed rounded-2xl">
                  <Tag className="w-8 h-8 text-text-tertiary mx-auto animate-pulse" />
                  <p className="text-xs font-semibold text-text-primary mt-2">No coupons created yet</p>
                  <p className="text-[10px] text-text-secondary max-w-xs mx-auto mt-1">
                    Fill the form on the left to offer custom discounts to your store customers.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border-main rounded-2xl bg-card-main">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                        <th className="p-4">Coupon Code</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4">Min Order</th>
                        <th className="p-4">Redemptions</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main text-xs text-text-primary">
                      {storeCoupons.map((c) => (
                        <tr key={c.id} className="hover:bg-bg-secondary/35 transition-all">
                          <td className="p-4 font-bold tracking-wider">{c.code}</td>
                          <td className="p-4">
                            {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `Rs. ${c.discountValue.toLocaleString()} Off`}
                          </td>
                          <td className="p-4">
                            {c.minOrderAmount > 0 ? `Rs. ${c.minOrderAmount.toLocaleString()}` : 'None'}
                          </td>
                          <td className="p-4 font-semibold text-text-secondary">{c.usageCount} checkouts</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                              c.isActive 
                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => toggleCouponStatus(c.id)}
                              className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                                c.isActive 
                                  ? 'bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' 
                                  : 'bg-green-500/5 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                              }`}
                            >
                              {c.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete coupon "${c.code}"?`)) {
                                  deleteCoupon(c.id);
                                }
                              }}
                              className="px-2 py-1 rounded text-[9px] font-bold bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
          )
        )}

        {/* Tab: Lookbooks Management */}
        {activeTab === 'lookbooks' && (
          isTabLocked('lookbooks') ? (
            <LockedTabScreen requiredTier="gold" currentTier={currentTier} />
          ) : (
            <motion.div
              key="lookbooks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
            {/* Create Lookbook Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (newLbItems.length < 2) {
                  alert('Please select at least 2 garments to curate an outfit.');
                  return;
                }
                if (!newLbName.trim() || !newLbDesc.trim()) {
                  alert('Please enter lookbook name and description.');
                  return;
                }

                // Filter pins to ensure we only publish tags that exist in selected inventory items
                const finalPins = newLbPins.filter(pin => newLbItems.some(item => item.productId === pin.productId));

                addLookbook(
                  store.id, 
                  newLbName.trim(), 
                  newLbDesc.trim(), 
                  newLbItems, 
                  store.name + " (Merchant)", 
                  true,
                  newLbImage,
                  finalPins
                );
                
                setNewLbName('');
                setNewLbDesc('');
                setNewLbItems([]);
                setNewLbImage('');
                setNewLbPins([]);
                setTempPinCoords(null);
                alert('Official Brand Lookbook successfully curated!');
              }}
              className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4 h-fit"
            >
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-text-secondary" />
                <span>Curate Brand Lookbook</span>
              </h3>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Lookbook Name</label>
                  <input
                    type="text"
                    value={newLbName}
                    onChange={(e) => setNewLbName(e.target.value)}
                    placeholder="e.g. Winter Cashmere Layering"
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs focus:outline-none focus:border-text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Aesthetic Description</label>
                  <textarea
                    value={newLbDesc}
                    onChange={(e) => setNewLbDesc(e.target.value)}
                    placeholder="Describe the fit, layers, and visual vibe..."
                    className="w-full p-2.5 bg-bg-secondary border border-border-main rounded-xl text-xs h-20 focus:outline-none focus:border-text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Editorial Cover Image (Optional)</label>
                  <ImageUploader
                    initialPreview={newLbImage}
                    onUploadSuccess={(url) => setNewLbImage(url)}
                    folder="lookbooks"
                    aspectRatio="video"
                    label="Upload high-res outfit look"
                  />
                  {newLbImage && (
                    <button
                      type="button"
                      onClick={() => { setNewLbImage(''); setNewLbPins([]); }}
                      className="mt-1 text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Remove cover image & tags
                    </button>
                  )}
                </div>

                {newLbImage && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-text-secondary">
                      Tag Products on Cover Image (Click to tag)
                    </label>
                    
                    <div className="relative border border-border-main rounded-2xl overflow-hidden bg-bg-secondary cursor-crosshair group">
                      <img
                        src={newLbImage}
                        alt="Lookbook cover tagging canvas"
                        className="w-full h-auto max-h-[300px] object-cover select-none mx-auto"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                          const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                          
                          if (newLbItems.length === 0) {
                            alert('Please select some garments from the inventory checklist below first, so you can tag them.');
                            return;
                          }
                          setTempPinCoords({ x: Math.round(clickX), y: Math.round(clickY) });
                        }}
                      />

                      {/* Placed Hotspot Pins */}
                      {newLbPins.map((pin: any, idx: number) => {
                        const product = products.find(p => p.id === pin.productId);
                        return (
                          <div
                            key={idx}
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setNewLbPins(newLbPins.filter((_, i) => i !== idx));
                              }}
                              className="w-5 h-5 rounded-full bg-accent-main border-2 border-white shadow-lg text-white font-bold text-[9px] flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                              title={`Remove tag: ${product?.name || 'Garment'}`}
                            >
                              {idx + 1}
                            </button>
                          </div>
                        );
                      })}

                      {/* Temporary pin popup prompt */}
                      {tempPinCoords && (
                        <div 
                          className="absolute bg-card-main border border-border-main p-2.5 rounded-xl shadow-lg z-20 space-y-2 max-w-[200px]"
                          style={{ 
                            left: `${tempPinCoords.x > 50 ? tempPinCoords.x - 20 : tempPinCoords.x}%`, 
                            top: `${tempPinCoords.y > 60 ? tempPinCoords.y - 25 : tempPinCoords.y}%` 
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-[9px] font-bold text-text-primary">Tag a garment here:</p>
                          <select
                            value={activePinProduct}
                            onChange={(e) => setActivePinProduct(e.target.value)}
                            className="w-full p-1 bg-bg-secondary border border-border-main rounded text-[10px]"
                          >
                            <option value="">-- Choose Item --</option>
                            {newLbItems.map((item) => {
                              const p = products.find(prod => prod.id === item.productId);
                              const isAlreadyTagged = newLbPins.some(pin => pin.productId === item.productId);
                              if (!p || isAlreadyTagged) return null;
                              return (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              );
                            })}
                          </select>
                          <div className="flex space-x-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setTempPinCoords(null)}
                              className="px-2 py-0.5 rounded bg-bg-secondary text-text-secondary text-[8px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!activePinProduct) {
                                  alert('Please select a product.');
                                  return;
                                }
                                setNewLbPins([...newLbPins, {
                                  x: tempPinCoords.x,
                                  y: tempPinCoords.y,
                                  productId: activePinProduct
                                }]);
                                setTempPinCoords(null);
                                setActivePinProduct('');
                              }}
                              className="px-2 py-0.5 rounded bg-text-primary text-bg-primary text-[8px] font-bold cursor-pointer"
                            >
                              Save Tag
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-text-tertiary">
                      Click the cover image above to tag selected garments. Tap active tags to remove them.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Select Garments from Inventory</label>
                  <div className="max-h-[180px] overflow-y-auto border border-border-main rounded-xl bg-bg-secondary/35 p-2.5 space-y-2">
                    {storeProducts.map((p) => {
                      const isAdded = newLbItems.some(i => i.productId === p.id);
                      return (
                        <div key={p.id} className="flex items-center justify-between text-xs bg-card-main p-2 border border-border-main rounded-lg">
                          <span className="font-medium truncate max-w-[120px]">{p.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                setNewLbItems(newLbItems.filter(i => i.productId !== p.id));
                              } else {
                                const size = p.variants[0]?.size || 'M';
                                const color = p.variants[0]?.color || 'Neutral';
                                setNewLbItems([...newLbItems, { productId: p.id, selectedSize: size, selectedColor: color }]);
                              }
                            }}
                            className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                              isAdded 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                : 'bg-bg-tertiary text-text-secondary border-border-main hover:text-text-primary'
                            }`}
                          >
                            {isAdded ? 'Remove' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Canvas items dropdown edits */}
                {newLbItems.length > 0 && (
                  <div className="space-y-2 border-t border-border-main pt-3">
                    <span className="block text-[9px] font-bold uppercase text-text-tertiary">Selected Options</span>
                    {newLbItems.map((item, idx) => {
                      const p = products.find(prod => prod.id === item.productId);
                      if (!p) return null;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[10px] bg-bg-secondary/40 p-2 rounded-lg border border-border-main">
                          <span className="font-semibold truncate max-w-[100px]">{p.name}</span>
                          <div className="flex space-x-1 shrink-0">
                            {/* Color */}
                            <select
                              value={item.selectedColor}
                              onChange={(e) => {
                                const updated = [...newLbItems];
                                updated[idx].selectedColor = e.target.value;
                                setNewLbItems(updated);
                              }}
                              className="p-0.5 bg-bg-secondary text-[8px] font-bold rounded border border-border-main focus:outline-none"
                            >
                              {Array.from(new Set(p.variants.map(v => v.color))).map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                            {/* Size */}
                            <select
                              value={item.selectedSize}
                              onChange={(e) => {
                                const updated = [...newLbItems];
                                updated[idx].selectedSize = e.target.value;
                                setNewLbItems(updated);
                              }}
                              className="p-0.5 bg-bg-secondary text-[8px] font-bold rounded border border-border-main focus:outline-none"
                            >
                              {Array.from(new Set(p.variants.map(v => v.size))).map(sz => (
                                <option key={sz} value={sz}>{sz}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold shadow-md cursor-pointer"
                >
                  Publish Brand Lookbook
                </button>
              </div>
            </form>

            {/* Lookbooks list */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-card-main border border-border-main space-y-4 text-left">
              <h3 className="text-sm font-bold text-text-primary">Boutique Lookbooks</h3>
              <p className="text-xs text-text-secondary">Official styling lookbooks published by you and customer curated style guides.</p>

              {lookbooks.filter(lb => lb.storeId === store.id).length === 0 ? (
                <div className="text-center py-16 bg-bg-secondary/40 border border-border-main border-dashed rounded-2xl">
                  <Sparkles className="w-8 h-8 text-text-tertiary mx-auto animate-pulse" />
                  <p className="text-xs font-semibold text-text-primary mt-2">No lookbooks curated yet</p>
                  <p className="text-[10px] text-text-secondary max-w-xs mx-auto mt-1">
                    Fill the form on the left to offer styled fashion inspirations to your store clients.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border-main rounded-2xl bg-card-main">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                        <th className="p-4">Lookbook Detail</th>
                        <th className="p-4">Creator Role</th>
                        <th className="p-4">Items Included</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main text-xs text-text-primary">
                      {lookbooks.filter(lb => lb.storeId === store.id).map((lb) => {
                        const firstProduct = products.find(p => lb.items[0] && p.id === lb.items[0].productId);
                        const coverThumbnail = lb.image || (firstProduct?.images[0]) || '';

                        return (
                          <tr key={lb.id} className="hover:bg-bg-secondary/35 transition-all">
                            <td className="p-4 flex items-center space-x-3">
                              {coverThumbnail && (
                                <img 
                                  src={coverThumbnail} 
                                  alt={lb.name} 
                                  className="w-8 h-10 object-cover rounded-lg border border-border-main flex-shrink-0"
                                />
                              )}
                              <div className="space-y-0.5">
                                <p className="font-bold">{lb.name}</p>
                                <p className="text-[10px] text-text-tertiary line-clamp-1">{lb.description}</p>
                              </div>
                            </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                              lb.isOfficial 
                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                : 'bg-bg-tertiary text-text-secondary border-border-main'
                            }`}>
                              {lb.isOfficial ? 'Brand Curator' : 'Shopper'}
                            </span>
                          </td>
                          <td className="p-4 text-text-secondary font-semibold">
                            {lb.items.length} garments
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Remove lookbook styling "${lb.name}"?`)) {
                                  deleteLookbook(lb.id);
                                }
                              }}
                              className="px-2 py-1 rounded text-[9px] font-bold bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
          )
        )}

        {/* Tab 2: Messaging Inbox */}
        {activeTab === 'inbox' && (
          isTabLocked('inbox') ? (
            <LockedTabScreen requiredTier="silver" currentTier={currentTier} />
          ) : (
            <motion.div
              key="inbox"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[580px]"
            >
              {/* Conversations List */}
              <div className="lg:col-span-1 p-6 rounded-3xl bg-card-main border border-border-main flex flex-col h-full overflow-hidden space-y-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-text-primary">Boutique Inbox</h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Manage shopper messaging feeds</p>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-border-main scrollbar-none">
                  {activeSessions.length === 0 ? (
                    <div className="text-center py-24 text-text-tertiary">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-semibold text-text-primary">No conversations yet</p>
                      <p className="text-[10px] text-text-secondary max-w-[180px] mx-auto mt-1">
                        Customer storefront messages show up here.
                      </p>
                    </div>
                  ) : (
                    activeSessions.map((session) => {
                      const isActive = activeCustomerId === session.customerId;
                      const hasPendingReply = session.lastMessageSenderId !== store.id;
                      return (
                        <div
                          key={session.customerId}
                          onClick={() => {
                            setActiveCustomerId(session.customerId);
                            setReplyText('');
                          }}
                          className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-all border-l-2 ${
                            isActive 
                              ? 'bg-bg-tertiary border-text-primary' 
                              : 'hover:bg-bg-secondary/40 border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-accent-main/10 flex items-center justify-center font-bold text-accent-main shrink-0 text-xs relative">
                            {session.customerName.charAt(0)}
                            {hasPendingReply && (
                              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-xs font-bold text-text-primary truncate">{session.customerName}</h4>
                              <span className="text-[8px] text-text-tertiary font-medium">
                                {new Date(session.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-[10px] truncate mt-0.5 ${hasPendingReply ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                              {session.lastMessageText}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Conversation Active Pane */}
              <div className={`rounded-3xl bg-card-main border border-border-main flex flex-col h-full overflow-hidden ${
                activeCustomerId ? 'lg:col-span-2' : 'lg:col-span-3'
              }`}>
                {activeCustomerId ? (() => {
                  const activeSession = activeSessions.find(s => s.customerId === activeCustomerId);
                  const activeMessages = storeMessages.filter(m => m.customerId === activeCustomerId);
                  
                  const quickReplies = [
                    "We have this in stock! Let me know if you need help with sizing.",
                    "Garment is true to size. I recommend checking the size guide.",
                    "Yes, shipping is completely free for this outfit bundle.",
                    "I have updated your order status. Tracking details are available."
                  ];

                  return (
                    <>
                      {/* Active Conversation Header */}
                      <div className="p-4 border-b border-border-main flex justify-between items-center bg-bg-secondary/20">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-accent-main/10 flex items-center justify-center font-bold text-accent-main text-xs">
                            {activeSession?.customerName.charAt(0)}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-bold text-text-primary">{activeSession?.customerName}</h4>
                            <p className="text-[9px] text-text-tertiary">Client ID: {activeCustomerId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Messages Scroll Area */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none bg-bg-primary/20">
                        {activeMessages.map((msg) => {
                          const isMerchant = msg.senderId === store.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}
                            >
                              <div className="text-[9px] text-text-tertiary mb-1 font-semibold">{msg.senderName}</div>
                              <div
                                className={`max-w-[70%] p-3 text-xs leading-relaxed text-left ${
                                  isMerchant
                                    ? 'bg-text-primary text-bg-primary rounded-2xl rounded-tr-none shadow-sm'
                                    : 'bg-bg-secondary border border-border-main text-text-primary rounded-2xl rounded-tl-none'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[8px] text-text-tertiary mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(msg.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Replies Strip */}
                      <div className="p-3 border-t border-border-main/50 bg-bg-secondary/10 flex flex-wrap gap-1.5 justify-start">
                        {quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReplyText(reply)}
                            className="px-2.5 py-1 text-[8px] font-bold border border-border-main/80 hover:border-text-primary rounded-lg bg-card-main text-text-secondary hover:text-text-primary transition-all cursor-pointer truncate max-w-[150px]"
                            title={reply}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>

                      {/* Composer Form */}
                      <form onSubmit={handleReplySubmit} className="p-4 border-t border-border-main flex space-x-2 bg-bg-secondary/20">
                        <input
                          type="text"
                          placeholder={`Write reply to ${activeSession?.customerName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-grow p-2.5 text-xs bg-bg-secondary border border-border-main rounded-xl focus:outline-none focus:border-text-primary"
                          required
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-text-primary text-bg-primary text-xs font-bold rounded-xl hover:opacity-90 shadow-sm transition-opacity cursor-pointer shrink-0"
                        >
                          Reply
                        </button>
                      </form>
                    </>
                  );
                })() : (
                  <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary space-y-2 py-24">
                    <MessageCircle className="w-10 h-10 opacity-30 animate-pulse" />
                    <p className="text-xs font-semibold text-text-primary">Select a Conversation</p>
                    <p className="text-[10px] text-text-secondary max-w-[220px] text-center">
                      Select one of the chats from the inbox feed list on the left to see messaging histories and answer inquiries.
                    </p>
                  </div>
                )}
              </div>

              {/* Shopper CRM Insights Panel */}
              {activeCustomerId && (() => {
                const activeSession = activeSessions.find(s => s.customerId === activeCustomerId);
                const customerOrders = storeOrders.filter(
                  o => o.customerName.toLowerCase() === activeSession?.customerName.toLowerCase()
                );
                const totalSpend = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

                return (
                  <div className="lg:col-span-1 p-6 rounded-3xl bg-card-main border border-border-main flex flex-col h-full overflow-hidden space-y-4 text-left">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">Customer Insights</h3>
                      <p className="text-[10px] text-text-secondary mt-0.5">Styling profile & LTV metrics</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-bg-secondary/40 border border-border-main rounded-2xl">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-text-tertiary block">Lifetime Value</span>
                        <span className="text-xs font-black text-text-primary">Rs. {totalSpend.toLocaleString()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-text-tertiary block">Total Purchases</span>
                        <span className="text-xs font-black text-text-primary">{customerOrders.length} orders</span>
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col overflow-hidden space-y-2 min-h-0">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-text-tertiary">Garment Purchase History</span>
                      <div className="flex-grow overflow-y-auto divide-y divide-border-main scrollbar-none min-h-0">
                        {customerOrders.length === 0 ? (
                          <p className="text-[10px] text-text-tertiary py-8 text-center">No orders from this shopper yet.</p>
                        ) : (
                          customerOrders.flatMap(o => o.items).map((item, idx) => {
                            const product = products.find(p => p.id === item.productId);
                            const imgUrl = product?.images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100';
                            return (
                              <div key={idx} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <img 
                                    src={imgUrl} 
                                    alt={item.productName} 
                                    className="w-7 h-9 object-cover rounded-md border border-border-main"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-text-primary truncate">{item.productName}</p>
                                    <p className="text-[8px] text-text-tertiary">Size: {item.selectedSize} &bull; Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-extrabold text-text-primary shrink-0">
                                  Rs. {item.price.toLocaleString()}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )
        )}

        {/* Tab 4: Orders Management */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Boutique Orders Queue</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Manage purchase requests, shipping notifications, and payments from your clients.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-text-secondary font-medium">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>Pending COD/Inquiry</span>
                </div>
              </div>

              {storeOrders.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-bg-secondary/40 border border-border-main border-dashed rounded-2xl">
                  <ShoppingBag className="w-8 h-8 text-text-tertiary mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-text-primary">No orders placed yet</p>
                    <p className="text-[10px] text-text-secondary max-w-xs mx-auto">
                      As customers purchase items from your boutique on the marketplace, checkout orders will populate here automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border-main rounded-2xl bg-card-main">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                        <th className="p-4">Order ID / Date</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Items Curated</th>
                        <th className="p-4">Total Value</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main text-xs">
                      {storeOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-bg-secondary/35 transition-all">
                          <td className="p-4 space-y-1">
                            <span className="font-serif font-bold text-text-primary tracking-wide">{ord.id}</span>
                            <p className="text-[10px] text-text-tertiary">
                              {new Date(ord.createdAt).toLocaleDateString()} &bull; {new Date(ord.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </td>
                          <td className="p-4 space-y-1">
                            <p className="font-semibold text-text-primary">{ord.customerName}</p>
                            <p className="text-[10px] text-text-tertiary">{ord.customerPhone} &bull; {ord.customerEmail}</p>
                            <p className="text-[10px] text-text-secondary truncate max-w-[200px]" title={ord.shippingAddress}>
                              {ord.shippingAddress}
                            </p>
                          </td>
                          <td className="p-4 space-y-1">
                            {ord.items.map((item, i) => (
                              <p key={i} className="text-text-primary leading-relaxed">
                                <span className="font-semibold">{item.productName}</span>{' '}
                                <span className="text-text-tertiary">({item.selectedSize}, {item.selectedColor})</span>{' '}
                                <span className="font-bold">x{item.quantity}</span>
                              </p>
                            ))}
                          </td>
                          <td className="p-4 font-bold text-text-primary whitespace-nowrap">
                            Rs. {ord.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                              ord.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              ord.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              ord.status === 'shipped' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                              ord.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-orange-500/10 text-orange-500 border-orange-500/20'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                              className="bg-bg-secondary border border-border-main text-text-primary text-[10px] font-semibold rounded-lg p-1.5 focus:outline-none focus:border-text-primary transition-all cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
