import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  Building2, ShoppingBag, Eye, MousePointerClick, 
  Trash2, Star, Megaphone, Search, AlertTriangle,
  FileText, Tag, BarChart3, PieChart, TrendingUp, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminPanel: React.FC = () => {
  const { 
    stores, 
    products, 
    promoteStore, 
    promoteProduct, 
    deleteStoreGlobal, 
    deleteProductGlobal,
    orders,
    deleteOrderGlobal,
    updateOrderStatus,
    reviews,
    deleteReviewGlobal,
    coupons,
    deleteCoupon,
    toggleCouponStatus,
    updateUserSubscription,
    updateStoreSubscription,
    users
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'analytics' | 'stores' | 'products' | 'orders' | 'reviews' | 'coupons' | 'subscriptions'>('analytics');
  const [storeQuery, setStoreQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
  const [reviewQuery, setReviewQuery] = useState('');
  const [couponQuery, setCouponQuery] = useState('');

  // 1. Calculate Aggregated Stats
  const totalStores = stores.length;
  const totalProducts = products.length;
  const totalViews = stores.reduce((sum, s) => sum + s.views, 0) + products.reduce((sum, p) => sum + p.views, 0);
  const totalClicks = stores.reduce((sum, s) => sum + s.clicks, 0) + products.reduce((sum, p) => sum + p.clicks, 0);

  // 2. Filter Stores
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(storeQuery.toLowerCase()) ||
    store.description.toLowerCase().includes(storeQuery.toLowerCase()) ||
    (store.location && store.location.toLowerCase().includes(storeQuery.toLowerCase()))
  );

  // 3. Filter Products
  const filteredProducts = products.filter(product => {
    const storeObj = stores.find(s => s.id === product.storeId);
    const storeName = storeObj ? storeObj.name.toLowerCase() : '';
    
    return product.name.toLowerCase().includes(productQuery.toLowerCase()) ||
           product.category.toLowerCase().includes(productQuery.toLowerCase()) ||
           storeName.includes(productQuery.toLowerCase());
  });

  // 4. Filter Orders
  const filteredOrders = orders.filter(order => {
    const storeObj = stores.find(s => s.id === order.storeId);
    const storeName = storeObj ? storeObj.name.toLowerCase() : '';
    return order.id.toLowerCase().includes(orderQuery.toLowerCase()) ||
           order.customerName.toLowerCase().includes(orderQuery.toLowerCase()) ||
           storeName.includes(orderQuery.toLowerCase());
  });

  // 5. Filter Reviews
  const filteredReviews = reviews.filter(rev => {
    const prodObj = products.find(p => p.id === rev.productId);
    const prodName = prodObj ? prodObj.name.toLowerCase() : '';
    return rev.customerName.toLowerCase().includes(reviewQuery.toLowerCase()) ||
           rev.comment.toLowerCase().includes(reviewQuery.toLowerCase()) ||
           prodName.includes(reviewQuery.toLowerCase());
  });

  // 6. Filter Coupons
  const filteredCoupons = coupons.filter(coupon => {
    const storeObj = stores.find(s => s.id === coupon.storeId);
    const storeName = storeObj ? storeObj.name.toLowerCase() : '';
    return coupon.code.toLowerCase().includes(couponQuery.toLowerCase()) ||
           storeName.includes(couponQuery.toLowerCase()) ||
           coupon.discountType.toLowerCase().includes(couponQuery.toLowerCase());
  });

  // Calculate detailed analytics for visual charts
  const getStoreRevenue = (storeId: string) => {
    return orders
      .filter(o => o.storeId === storeId && o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const getStoreProductCount = (storeId: string) => {
    return products.filter(p => p.storeId === storeId).length;
  };

  const totalPlatformRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const averageStarRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const categoryCounts = {
    Men: products.filter(p => p.category === 'Men').length,
    Women: products.filter(p => p.category === 'Women').length,
    Kids: products.filter(p => p.category === 'Kids').length,
    Accessories: products.filter(p => p.category === 'Accessories').length,
  };

  const totalCats = products.length || 1;
  const menPct = (categoryCounts.Men / totalCats) * 100;
  const womenPct = (categoryCounts.Women / totalCats) * 100;
  const kidsPct = (categoryCounts.Kids / totalCats) * 100;
  const accPct = (categoryCounts.Accessories / totalCats) * 100;

  const storeStats = stores.map(store => {
    const revenue = getStoreRevenue(store.id);
    const productCount = getStoreProductCount(store.id);
    const storeProducts = products.filter(p => p.storeId === store.id);
    const views = store.views + storeProducts.reduce((sum, p) => sum + p.views, 0);
    const clicks = store.clicks + storeProducts.reduce((sum, p) => sum + p.clicks, 0);
    const ctr = views > 0 ? ((clicks / views) * 100) : 0;
    const completedOrdersCount = orders.filter(o => o.storeId === store.id && o.status === 'completed').length;

    return {
      ...store,
      revenue,
      productCount,
      views,
      clicks,
      ctr,
      completedOrdersCount
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-main pb-6 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] tracking-wider uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
            Platform Master Console
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mt-1.5">
            Super Admin Hub
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-1 bg-bg-secondary p-1 rounded-2xl border border-border-main self-start sm:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-text-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'stores'
                ? 'bg-text-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Boutiques ({stores.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'bg-text-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Global Catalog ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'bg-text-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Global Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'reviews'
                ? 'bg-text-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Global Reviews ({reviews.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'coupons'
                ? 'bg-text-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promo Coupons ({coupons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-text-primary text-bg-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Subscriptions</span>
          </button>
        </div>
      </div>

      {/* Global Platforms Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
          <span className="text-xs text-text-tertiary font-semibold block">Total Boutiques</span>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-text-primary">{totalStores}</span>
            <Building2 className="w-5 h-5 text-text-tertiary" />
          </div>
        </div>
        
        <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
          <span className="text-xs text-text-tertiary font-semibold block">Active Products</span>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-text-primary">{totalProducts}</span>
            <ShoppingBag className="w-5 h-5 text-text-tertiary" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
          <span className="text-xs text-text-tertiary font-semibold block">Accumulated Views</span>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-text-primary">{totalViews.toLocaleString()}</span>
            <Eye className="w-5 h-5 text-text-tertiary" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
          <span className="text-xs text-text-tertiary font-semibold block">Accumulated Clicks</span>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-text-primary">{totalClicks.toLocaleString()}</span>
            <MousePointerClick className="w-5 h-5 text-text-tertiary" />
          </div>
        </div>
      </div>

      {/* Main Admin Panels */}
      <AnimatePresence mode="wait">
        
        {/* Tab 0: Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Top Row Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Gross Sales */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main flex items-center justify-between shadow-sm card-hover-effect relative overflow-hidden">
                <div className="space-y-2">
                  <span className="text-xs text-text-tertiary font-bold uppercase tracking-wider block">Completed Gross Revenue</span>
                  <p className="text-2xl font-black text-text-primary font-serif">Rs. {totalPlatformRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-text-secondary">Earned across all boutiques</p>
                </div>
                <Coins className="w-8 h-8 text-accent-main/20" />
              </div>

              {/* Card 2: Average CTR */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main flex items-center justify-between shadow-sm card-hover-effect relative overflow-hidden">
                <div className="space-y-2">
                  <span className="text-xs text-text-tertiary font-bold uppercase tracking-wider block">Average Platform CTR</span>
                  <p className="text-2xl font-black text-text-primary font-sans">
                    {(totalViews > 0 ? (totalClicks / totalViews * 100) : 0).toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-text-secondary">Views to click conversion rate</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent-main/20" />
              </div>

              {/* Card 3: Quality Index */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main flex items-center justify-between shadow-sm card-hover-effect relative overflow-hidden">
                <div className="space-y-2">
                  <span className="text-xs text-text-tertiary font-bold uppercase tracking-wider block">Platform Rating Index</span>
                  <p className="text-2xl font-black text-text-primary font-sans flex items-center space-x-1">
                    <span>★ {averageStarRating}</span>
                  </p>
                  <p className="text-[10px] text-text-secondary">From {reviews.length} product reviews</p>
                </div>
                <Star className="w-8 h-8 text-accent-main/20" />
              </div>
            </div>

            {/* Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Leaderboard */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main lg:col-span-2 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-text-primary flex items-center space-x-1.5 border-b border-border-main pb-2">
                  <BarChart3 className="w-4 h-4 text-text-secondary" />
                  <span>Boutique Revenue Share (NPR)</span>
                </h3>
                <div className="pt-2">
                  {storeStats.length === 0 ? (
                    <p className="text-xs text-text-secondary text-center py-10">No store sales data available yet.</p>
                  ) : (
                    <div className="space-y-5">
                      {storeStats.map((stat, idx) => {
                        const maxRevenue = Math.max(...storeStats.map(s => s.revenue), 1);
                        const percent = (stat.revenue / maxRevenue) * 100;
                        return (
                          <div key={stat.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-text-primary flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded bg-accent-main inline-block" />
                                <span>{stat.name}</span>
                              </span>
                              <span className="font-bold text-text-primary">Rs. {stat.revenue.toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-full bg-bg-secondary border border-border-main rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className="h-full bg-accent-main rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Shares Donut */}
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4 shadow-sm flex flex-col justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center space-x-1.5 border-b border-border-main pb-2">
                  <PieChart className="w-4 h-4 text-text-secondary" />
                  <span>Category Breakdown</span>
                </h3>
                <div className="py-4">
                  {totalProducts === 0 ? (
                    <p className="text-xs text-text-secondary text-center py-10">No products inside catalog.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* SVG Donut */}
                      <div className="relative">
                        <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto transform -rotate-90">
                          <circle cx="80" cy="80" r="50" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="16" />
                          <circle
                            cx="80"
                            cy="80"
                            r="50"
                            fill="transparent"
                            stroke="#6366f1" /* Indigo for Men */
                            strokeWidth="16"
                            strokeDasharray={`${menPct * 3.14} 314`}
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="50"
                            fill="transparent"
                            stroke="#ec4899" /* Pink for Women */
                            strokeWidth="16"
                            strokeDasharray={`${womenPct * 3.14} 314`}
                            strokeDashoffset={`-${menPct * 3.14}`}
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="50"
                            fill="transparent"
                            stroke="#f59e0b" /* Amber for Kids */
                            strokeWidth="16"
                            strokeDasharray={`${kidsPct * 3.14} 314`}
                            strokeDashoffset={`-${(menPct + womenPct) * 3.14}`}
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="50"
                            fill="transparent"
                            stroke="#10b981" /* Emerald for Accessories */
                            strokeWidth="16"
                            strokeDasharray={`${accPct * 3.14} 314`}
                            strokeDashoffset={`-${(menPct + womenPct + kidsPct) * 3.14}`}
                          />
                          <g transform="rotate(90 80 80)">
                            <text x="80" y="76" textAnchor="middle" className="text-base font-bold fill-text-primary font-sans">
                              {totalProducts}
                            </text>
                            <text x="80" y="90" textAnchor="middle" className="text-[8px] fill-text-secondary font-bold uppercase tracking-wider">
                              Items
                            </text>
                          </g>
                        </svg>
                      </div>
                      
                      {/* Legends */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-[#6366f1] inline-block" />
                          <span className="text-text-secondary">Men ({categoryCounts.Men})</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-[#ec4899] inline-block" />
                          <span className="text-text-secondary">Women ({categoryCounts.Women})</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-[#f59e0b] inline-block" />
                          <span className="text-text-secondary">Kids ({categoryCounts.Kids})</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-[#10b981] inline-block" />
                          <span className="text-text-secondary">Accs ({categoryCounts.Accessories})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Rankings Table */}
            <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-text-primary flex items-center space-x-1.5 border-b border-border-main pb-2">
                <TrendingUp className="w-4 h-4 text-text-secondary" />
                <span>Boutique Leaderboard Performance</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-text-primary">
                  <thead>
                    <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-tertiary border-b border-border-main">
                      <th className="p-4">Boutique</th>
                      <th className="p-4">Active Listings</th>
                      <th className="p-4">Traffic (Views / Clicks)</th>
                      <th className="p-4">CTR Conversion</th>
                      <th className="p-4">Completed Sales</th>
                      <th className="p-4 text-right">Gross Revenues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {storeStats.map((stat) => (
                      <tr key={stat.id} className="hover:bg-bg-secondary/35 transition-all">
                        <td className="p-4 font-bold flex items-center space-x-2.5">
                          <img src={stat.logo} alt={stat.name} className="w-7 h-7 rounded-lg border border-border-main object-cover" />
                          <span>{stat.name}</span>
                        </td>
                        <td className="p-4 font-semibold text-text-secondary">{stat.productCount} items</td>
                        <td className="p-4 text-text-secondary">
                          {stat.views} views / {stat.clicks} clicks
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            stat.ctr > 25 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            stat.ctr > 10 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
                          }`}>
                            {stat.ctr.toFixed(1)}% CTR
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-text-secondary">{stat.completedOrdersCount} orders</td>
                        <td className="p-4 text-right font-bold text-accent-main">
                          Rs. {stat.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 1: Manage Boutiques */}
        {activeTab === 'stores' && (
          <motion.div
            key="stores-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search filter bar */}
            <div className="max-w-md relative">
              <input
                type="text"
                placeholder="Search boutiques by name, bio, or location..."
                value={storeQuery}
                onChange={(e) => setStoreQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs bg-bg-secondary text-text-primary border border-border-main focus:outline-none focus:border-text-primary transition-all duration-200"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            </div>

            {/* Boutiques Management Table */}
            <div className="bg-card-main border border-border-main rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-tertiary text-left">
                      <th className="p-4">Boutique Details</th>
                      <th className="p-4">Owner ID</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Analytics</th>
                      <th className="p-4">Placement Status</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {filteredStores.map((st) => (
                      <tr key={st.id} className="hover:bg-bg-secondary/40 transition-all">
                        {/* Logo & Name */}
                        <td className="p-4 flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-border-main shrink-0">
                            <img src={st.logo} alt={st.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">{st.name}</p>
                            <p className="text-[10px] text-text-tertiary line-clamp-1 max-w-[200px]">{st.description}</p>
                          </div>
                        </td>
                        {/* Owner */}
                        <td className="p-4 text-text-secondary font-mono text-[10px]">{st.ownerId}</td>
                        {/* Location */}
                        <td className="p-4 text-text-secondary">{st.location || 'Not Specified'}</td>
                        {/* Stats */}
                        <td className="p-4 text-text-tertiary font-medium">
                          <div className="space-y-0.5">
                            <p>{st.views} views</p>
                            <p>{st.clicks} clicks</p>
                          </div>
                        </td>
                        {/* Featured/Sponsored Placement Status */}
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => promoteStore(st.id, 'featured')}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all flex items-center space-x-1 ${
                                st.isFeatured 
                                  ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
                                  : 'bg-bg-tertiary text-text-secondary border-border-main hover:text-text-primary'
                              }`}
                            >
                              <Star className={`w-3 h-3 ${st.isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                              <span>Featured</span>
                            </button>
                            
                            <button
                              onClick={() => promoteStore(st.id, 'sponsored')}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all flex items-center space-x-1 ${
                                st.isSponsored 
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                                  : 'bg-bg-tertiary text-text-secondary border-border-main hover:text-text-primary'
                              }`}
                            >
                              <Megaphone className="w-3 h-3" />
                              <span>Sponsored</span>
                            </button>
                          </div>
                        </td>
                        {/* Global Delete Boutique */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`CRITICAL WARNING: Are you sure you want to delete "${st.name}"? This will permanently remove the store and all of its associated products.`)) {
                                deleteStoreGlobal(st.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 transition-all border border-red-500/10"
                            title="Delete Store & Catalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredStores.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-secondary font-medium">
                          No boutiques match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Manage Products */}
        {activeTab === 'products' && (
          <motion.div
            key="products-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search filter bar */}
            <div className="max-w-md relative">
              <input
                type="text"
                placeholder="Search products by name, category, or boutique origin..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs bg-bg-secondary text-text-primary border border-border-main focus:outline-none focus:border-text-primary transition-all duration-200"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            </div>

            {/* Products Moderation Table */}
            <div className="bg-card-main border border-border-main rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-tertiary text-left">
                      <th className="p-4">Product Details</th>
                      <th className="p-4">Origin Boutique</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Total Views/Clicks</th>
                      <th className="p-4">Sponsored Status</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {filteredProducts.map((p) => {
                      const originStore = stores.find(s => s.id === p.storeId);
                      return (
                        <tr key={p.id} className="hover:bg-bg-secondary/40 transition-all">
                          {/* Image & Title */}
                          <td className="p-4 flex items-center space-x-3">
                            <div className="w-9 h-11 rounded-lg overflow-hidden border border-border-main shrink-0">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-text-primary">{p.name}</p>
                              <p className="text-[10px] text-text-tertiary line-clamp-1 max-w-[180px]">{p.description}</p>
                            </div>
                          </td>
                          {/* Boutique */}
                          <td className="p-4 font-serif font-bold text-text-primary">
                            {originStore ? originStore.name : 'Unknown Store'}
                          </td>
                          {/* Category */}
                          <td className="p-4 text-text-secondary">{p.category}</td>
                          {/* Price */}
                          <td className="p-4 font-bold text-text-primary">
                            Rs. {p.price.toLocaleString()}
                          </td>
                          {/* Analytics */}
                          <td className="p-4 text-text-tertiary">
                            <div className="space-y-0.5">
                              <p>{p.views} views</p>
                              <p>{p.clicks} clicks</p>
                            </div>
                          </td>
                          {/* Sponsored Status Toggle */}
                          <td className="p-4">
                            <button
                              onClick={() => promoteProduct(p.id)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all flex items-center space-x-1 ${
                                p.isSponsored 
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                                  : 'bg-bg-tertiary text-text-secondary border-border-main hover:text-text-primary'
                              }`}
                            >
                              <Megaphone className="w-3 h-3" />
                              <span>{p.isSponsored ? 'Sponsored Ads' : 'Standard Placement'}</span>
                            </button>
                          </td>
                          {/* Delete Action */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${p.name}"? This removes the item globally across the marketplace catalog.`)) {
                                  deleteProductGlobal(p.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 transition-all border border-red-500/10"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-secondary font-medium">
                          No products match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Global Orders Queue */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-6">
              {/* Header search bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Global Orders Moderation</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Cancel or delete order records across the platform boutiques.</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search by ID, customer, store..."
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-bg-secondary text-text-primary border border-border-main focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-ring-color transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-border-main rounded-2xl bg-card-main">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                      <th className="p-4">Order ID / Date</th>
                      <th className="p-4">Boutique</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Items Curated</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {filteredOrders.map((ord) => {
                      const boutique = stores.find(s => s.id === ord.storeId);
                      return (
                        <tr key={ord.id} className="hover:bg-bg-secondary/35 transition-all">
                          <td className="p-4 space-y-1">
                            <span className="font-serif font-bold text-text-primary tracking-wide">{ord.id}</span>
                            <p className="text-[10px] text-text-tertiary">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-text-primary">{boutique?.name || 'Deleted Boutique'}</span>
                          </td>
                          <td className="p-4 space-y-1">
                            <p className="font-semibold text-text-primary">{ord.customerName}</p>
                            <p className="text-[10px] text-text-tertiary">{ord.customerPhone} &bull; {ord.customerEmail}</p>
                            <p className="text-[10px] text-text-secondary truncate max-w-[150px]" title={ord.shippingAddress}>
                              {ord.shippingAddress}
                            </p>
                          </td>
                          <td className="p-4 space-y-1">
                            {ord.items.map((item, i) => (
                              <p key={i} className="text-text-primary">
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
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete order "${ord.id}" from the platform archives?`)) {
                                  deleteOrderGlobal(ord.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 transition-all border border-red-500/10"
                              title="Delete Order Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-secondary font-medium">
                          No order records match your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Global Reviews Moderation */}
        {activeTab === 'reviews' && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-6">
              {/* Header search bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Global Reviews Moderation</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Moderate customer star feedback and comment logs across the platform.</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search comments, customers, products..."
                    value={reviewQuery}
                    onChange={(e) => setReviewQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-bg-secondary text-text-primary border border-border-main focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-ring-color transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-border-main rounded-2xl bg-card-main">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {filteredReviews.map((rev) => {
                      const product = products.find(p => p.id === rev.productId);
                      return (
                        <tr key={rev.id} className="hover:bg-bg-secondary/35 transition-all">
                          <td className="p-4 font-semibold text-text-primary">
                            {rev.customerName}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-text-primary">{product?.name || 'Deleted Product'}</span>
                          </td>
                          <td className="p-4 text-amber-500 font-bold">
                            {rev.rating} ★
                          </td>
                          <td className="p-4 text-text-secondary max-w-[250px] truncate" title={rev.comment}>
                            {rev.comment}
                          </td>
                          <td className="p-4 text-text-tertiary whitespace-nowrap">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this review by "${rev.customerName}"?`)) {
                                  deleteReviewGlobal(rev.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 transition-all border border-red-500/10"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredReviews.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-secondary font-medium">
                          No review records match your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Coupons Moderation Queue */}
        {activeTab === 'coupons' && (
          <motion.div
            key="coupons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Promo Coupons Moderation Queue</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Search and moderate active discount codes globally across the platform.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search code, boutique, type..."
                    value={couponQuery}
                    onChange={(e) => setCouponQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border-main rounded-xl text-xs text-text-primary focus:outline-none focus:border-text-primary transition-all"
                  />
                  <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Coupons List Table */}
              <div className="overflow-x-auto border border-border-main rounded-2xl bg-card-main">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                      <th className="p-4">Boutique</th>
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Min Order Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Redemptions</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs text-text-primary">
                    {filteredCoupons.map((c) => {
                      const store = stores.find(s => s.id === c.storeId);
                      return (
                        <tr key={c.id} className="hover:bg-bg-secondary/35 transition-all">
                          <td className="p-4 space-y-0.5">
                            <span className="font-semibold text-text-primary">{store?.name || 'Unknown Store'}</span>
                            <p className="text-[10px] text-text-tertiary">ID: {c.storeId}</p>
                          </td>
                          <td className="p-4 font-bold tracking-wider">{c.code}</td>
                          <td className="p-4">
                            {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `Rs. ${c.discountValue.toLocaleString()} Off`}
                          </td>
                          <td className="p-4">
                            {c.minOrderAmount > 0 ? `Rs. ${c.minOrderAmount.toLocaleString()}` : 'None'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                              c.isActive 
                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-text-secondary">{c.usageCount} redemptions</td>
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
                                if (confirm(`Moderate delete coupon "${c.code}"?`)) {
                                  deleteCoupon(c.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 transition-all border border-red-500/10 inline-flex items-center justify-center cursor-pointer"
                              title="Force Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredCoupons.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-secondary font-medium">
                          No coupon records match your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 7: Subscriptions Management */}
        {activeTab === 'subscriptions' && (
          <motion.div
            key="subscriptions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Subscription stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
                <span className="text-xs text-text-tertiary font-semibold block">Monthly Recurring Revenue</span>
                <p className="font-serif text-2xl font-bold text-text-primary">
                  Rs. {((stores.filter(s => s.subscriptionStatus === 'active' && s.subscriptionTier === 'gold').length * 7500) +
                       (stores.filter(s => s.subscriptionStatus === 'active' && s.subscriptionTier === 'silver').length * 3500) +
                       (stores.filter(s => s.subscriptionStatus === 'active' && s.subscriptionTier === 'bronze').length * 1500)).toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-500 font-medium">Estimated Platform Revenue</span>
              </div>
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
                <span className="text-xs text-text-tertiary font-semibold block">Gold Subscribers</span>
                <p className="font-serif text-2xl font-bold text-text-primary">
                  {stores.filter(s => s.subscriptionTier === 'gold').length} Active
                </p>
                <span className="text-[10px] text-text-secondary font-medium">Rs. 7,500 / mo plan</span>
              </div>
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
                <span className="text-xs text-text-tertiary font-semibold block">Silver Subscribers</span>
                <p className="font-serif text-2xl font-bold text-text-primary">
                  {stores.filter(s => s.subscriptionTier === 'silver').length} Active
                </p>
                <span className="text-[10px] text-text-secondary font-medium">Rs. 3,500 / mo plan</span>
              </div>
              <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-2">
                <span className="text-xs text-text-tertiary font-semibold block">Bronze Subscribers</span>
                <p className="font-serif text-2xl font-bold text-text-primary">
                  {stores.filter(s => s.subscriptionTier === 'bronze').length} Active
                </p>
                <span className="text-[10px] text-text-secondary font-medium">Rs. 1,500 / mo plan</span>
              </div>
            </div>

            {/* List */}
            <div className="p-6 rounded-3xl bg-card-main border border-border-main space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Boutique Subscription Registry</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Monitor and override active storefront subscription tiers and statuses.</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-border-main rounded-2xl bg-card-main">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary border-b border-border-main">
                      <th className="p-4">Boutique</th>
                      <th className="p-4">Merchant Owner</th>
                      <th className="p-4">Active Tier</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Expires On</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs text-text-primary">
                    {stores.map((store) => {
                      const owner = users.find(u => u.storeId === store.id || u.id === store.ownerId);
                      return (
                        <tr key={store.id} className="hover:bg-bg-secondary/35 transition-colors">
                          <td className="p-4 flex items-center space-x-3">
                            <img src={store.logo} alt="Logo" className="w-8 h-8 rounded-lg border border-border-main bg-white" />
                            <div>
                              <p className="font-bold">{store.name}</p>
                              <p className="text-[10px] text-text-secondary">/{store.slug}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold">{owner?.name || 'Curator Owner'}</p>
                            <p className="text-[10px] text-text-secondary">{owner?.email || 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                              store.subscriptionTier === 'gold' 
                                ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
                                : store.subscriptionTier === 'silver' 
                                ? 'bg-slate-400/10 text-slate-600 border-slate-400/20'
                                : 'bg-amber-700/10 text-amber-700 border-amber-700/20'
                            }`}>
                              {store.subscriptionTier || 'bronze'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                              store.subscriptionStatus === 'active' 
                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${store.subscriptionStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                              {store.subscriptionStatus || 'inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-text-secondary">
                            {store.subscriptionExpiresAt 
                              ? new Date(store.subscriptionExpiresAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
                              : 'Never'}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <select
                              value={store.subscriptionTier || 'bronze'}
                              onChange={(e) => {
                                const newTier = e.target.value as any;
                                updateStoreSubscription(store.id, newTier, store.subscriptionStatus || 'active', store.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                                if (owner) {
                                  updateUserSubscription(owner.id, newTier, store.subscriptionStatus || 'active', store.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                                }
                                alert(`Tier updated to ${newTier.toUpperCase()} for ${store.name}`);
                              }}
                              className="p-1.5 bg-bg-secondary border border-border-main rounded-xl text-xs cursor-pointer focus:outline-none text-text-primary"
                            >
                              <option value="bronze">Bronze</option>
                              <option value="silver">Silver</option>
                              <option value="gold">Gold</option>
                            </select>

                            <button
                              onClick={() => {
                                const nextStatus = store.subscriptionStatus === 'active' ? 'inactive' : 'active';
                                updateStoreSubscription(store.id, store.subscriptionTier || 'bronze', nextStatus, store.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                                if (owner) {
                                  updateUserSubscription(owner.id, store.subscriptionTier || 'bronze', nextStatus, store.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                                }
                                alert(`Boutique subscription status set to ${nextStatus.toUpperCase()}`);
                              }}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase transition-all cursor-pointer ${
                                store.subscriptionStatus === 'active'
                                  ? 'bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                                  : 'bg-green-500/5 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                              }`}
                            >
                              {store.subscriptionStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Safety Instructions Card */}
      <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-start space-x-3 text-xs text-red-600/90 leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-red-700">Administrative Safeguards Policy:</span>
          <p className="mt-0.5">
            Any boutique deletion will execute a cascading drop, immediately removing all listed items, variant stock settings, and views metrics linked to that boutique. Changes sync instantly to local storage. Use with care.
          </p>
        </div>
      </div>

    </div>
  );
};
