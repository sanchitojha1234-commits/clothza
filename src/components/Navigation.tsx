import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  Search, Sun, Moon, Heart, ShoppingBag,
  LayoutDashboard, Store as StoreIcon, ChevronDown, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartDrawer } from './CartDrawer';

interface NavigationProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSignInClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ searchQuery, setSearchQuery, onSignInClick }) => {
  const { 
    currentUser, 
    currentPage, 
    activeStoreSlug,
    navigateToHome, 
    navigateToDashboard, 
    navigateToStore, 
    navigateToAdmin,
    navigateToCustomerOrders,
    navigateToLookbooks,
    signOut,
    favorites,
    stores,
    cart,
    messages,
    submitAdminRequest
  } = useMarketplace();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync local search when global changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Dark/Light Theme Manager
  useEffect(() => {
    const savedTheme = localStorage.getItem('clothza_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
      localStorage.setItem('clothza_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
      localStorage.setItem('clothza_theme', 'light');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    navigateToHome();
  };



  const myStore = stores.find(s => s.id === currentUser?.storeId);

  // Calculate unread/pending message threads for the store owner
  const pendingInquiriesCount = (() => {
    if (currentUser?.role !== 'seller' || !myStore) return 0;
    
    // Group messages by customerId
    const storeMessages = messages.filter(m => m.storeId === myStore.id);
    const customerIds = Array.from(new Set(storeMessages.map(m => m.customerId)));
    
    let count = 0;
    for (const cId of customerIds) {
      const thread = storeMessages.filter(m => m.customerId === cId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (thread.length > 0) {
        const lastMsg = thread[thread.length - 1];
        if (lastMsg.senderId !== myStore.id) {
          count++;
        }
      }
    }
    return count;
  })();

  return (
    <header className="sticky top-0 z-50 w-full glassmorphism transition-all duration-300 border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Desktop Nav Links */}
        <div className="flex items-center space-x-6">
          <div 
            onClick={navigateToHome} 
            className="flex items-center space-x-2 cursor-pointer group select-none"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-text-primary transition-all duration-300 group-hover:opacity-85">
              Clothza<span className="text-text-tertiary">.</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-wider uppercase font-semibold bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded-full border border-border-main">
              SaaS
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={navigateToHome}
              className={`text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                currentPage === 'home' 
                  ? 'text-text-primary border-b-2 border-accent-main pb-0.5' 
                  : 'text-text-secondary hover:text-text-primary pb-0.5'
              }`}
            >
              Browse
            </button>
            <button
              onClick={navigateToLookbooks}
              className={`text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                currentPage === 'lookbooks' 
                  ? 'text-text-primary border-b-2 border-accent-main pb-0.5' 
                  : 'text-text-secondary hover:text-text-primary pb-0.5'
              }`}
            >
              Lookbooks
            </button>
          </nav>
        </div>

        {/* Global Search */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-md relative hidden md:block"
        >
          <input
            type="text"
            placeholder="Search stores, designer apparel, categories..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-full text-sm bg-bg-secondary text-text-primary border border-border-main focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-ring-color transition-all duration-200"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        </form>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          
          {/* Mobile Lookbooks button */}
          <button
            onClick={navigateToLookbooks}
            className={`md:hidden px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
              currentPage === 'lookbooks' 
                ? 'bg-text-primary text-bg-primary border-text-primary' 
                : 'bg-bg-secondary text-text-secondary border-border-main hover:text-text-primary'
            }`}
          >
            Lookbooks
          </button>
          
          {/* Mobile Search Button */}
          <div className="md:hidden">
            <button 
              onClick={() => {
                const query = prompt("Search Clothza:") || "";
                setSearchQuery(query);
                navigateToHome();
              }}
              className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-[18px] h-[18px] text-text-secondary" />
            ) : (
              <Sun className="w-[18px] h-[18px] text-text-secondary" />
            )}
          </button>

          {/* Favorites (Customer Mode only) */}
          {currentUser?.role === 'customer' && (
            <button 
              onClick={() => {
                setSearchQuery(""); // clear search to show favorites
                navigateToHome();
                // We'll filter the home screen in app layout when viewing favorites
                setTimeout(() => {
                  const favSection = document.getElementById('favorites-section');
                  if (favSection) {
                    favSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary relative transition-all"
            >
              <Heart className="w-[18px] h-[18px]" />
              {(favorites.products.length > 0 || favorites.stores.length > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-text-primary rounded-full" />
              )}
            </button>
          )}

          {/* My Orders Button (Customer Mode only) */}
          {currentUser?.role === 'customer' && (
            <button 
              onClick={navigateToCustomerOrders}
              className={`p-2 rounded-full hover:bg-bg-tertiary relative transition-all cursor-pointer ${
                currentPage === 'customer-orders' ? 'text-text-primary bg-bg-tertiary' : 'text-text-secondary'
              }`}
              aria-label="View My Orders"
              title="My Orders"
            >
              <FileText className="w-[18px] h-[18px]" />
            </button>
          )}

          {/* Shopping Bag Button (Customer Mode only) */}
          {currentUser?.role === 'customer' && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary relative transition-all cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cart.length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold bg-text-primary text-bg-primary border border-border-main flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          )}

          {/* Navigation links based on role */}
          {currentUser?.role === 'seller' && (
            <>
              <button
                onClick={navigateToDashboard}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentPage === 'dashboard'
                    ? 'bg-text-primary text-bg-primary'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border-main'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Seller Dashboard</span>
                {pendingInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>

              {myStore && (
                <button
                  onClick={() => navigateToStore(myStore.slug)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    currentPage === 'store' && activeStoreSlug === myStore.slug
                      ? 'bg-text-primary text-bg-primary'
                      : 'bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border-main'
                  }`}
                >
                  <StoreIcon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">My Store</span>
                </button>
              )}
            </>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={navigateToAdmin}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentPage === 'admin'
                  ? 'bg-text-primary text-bg-primary'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border-main'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Sign In Button / Profile Dropdown */}
          {!currentUser ? (
            <button
              onClick={onSignInClick}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-accent-main text-accent-fg hover:opacity-90 transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
            >
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-1 p-1 sm:p-1.5 rounded-full hover:bg-bg-tertiary transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-text-primary text-bg-primary flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className="w-3 h-3 text-text-tertiary hidden sm:block" />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-card-main border border-border-main shadow-lg p-2 z-50 text-left"
                    >
                      <div className="px-3 py-2 border-b border-border-main mb-1">
                        <p className="text-xs font-medium text-text-tertiary">Signed in as</p>
                        <p className="text-sm font-semibold text-text-primary truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-text-tertiary truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-semibold bg-bg-tertiary text-text-primary border border-border-main px-1.5 py-0.5 rounded uppercase">
                          {currentUser.role} mode
                        </span>
                      </div>

                      {/* Dropdown Options */}
                      <div className="p-1 space-y-0.5">
                        {currentUser.role === 'customer' && (
                          <button
                            onClick={() => {
                              navigateToCustomerOrders();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-text-secondary" />
                            <span>My Purchases</span>
                          </button>
                        )}

                        {currentUser.role === 'seller' && (
                          <>
                            <button
                              onClick={() => {
                                navigateToDashboard();
                                setShowProfileDropdown(false);
                              }}
                              className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-text-secondary" />
                              <span>Store Analytics</span>
                            </button>

                            {myStore && (
                              <button
                                onClick={() => {
                                  navigateToStore(myStore.slug);
                                  setShowProfileDropdown(false);
                                }}
                                className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
                              >
                                <StoreIcon className="w-3.5 h-3.5 text-text-secondary" />
                                <span>My Store Page</span>
                              </button>
                            )}
                          </>
                        )}

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              navigateToAdmin();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-text-secondary" />
                            <span>Global Moderation</span>
                          </button>
                        )}

                        {currentUser && currentUser.role !== 'admin' && (
                          <button
                            onClick={() => {
                              onSignInClick();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-bold text-accent-main hover:bg-accent-main/10 transition-all cursor-pointer border border-accent-main/20"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Unlock Admin Panel</span>
                          </button>
                        )}

                        {currentUser && currentUser.role !== 'admin' && (
                          <button
                            onClick={async () => {
                              if (currentUser.adminRequest === 'pending') {
                                alert("Your admin promotion request is already pending review.");
                              } else {
                                await submitAdminRequest(currentUser.id);
                                alert("Admin promotion request submitted. The Super Admin has been notified.");
                              }
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-text-secondary" />
                            <span>
                              {currentUser.adminRequest === 'pending'
                                ? 'Admin Request Pending'
                                : 'Request Admin Access'}
                            </span>
                          </button>
                        )}

                        <div className="border-t border-border-main mt-1 pt-1">
                          <button
                            onClick={() => {
                              signOut();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          >
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

    </header>
  );
};
