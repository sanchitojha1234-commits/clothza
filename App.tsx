import { useState, useEffect } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { StorePage } from './pages/StorePage';
import { ProductPage } from './pages/ProductPage';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { Checkout } from './pages/Checkout';
import { CustomerOrders } from './pages/CustomerOrders';
import { Lookbooks } from './pages/Lookbooks';
import { AuthModal } from './components/AuthModal';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

function RestrictedAccess({ requiredRole, onLogin }: { requiredRole: string; onLogin: () => void }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in font-sans">
      <div className="p-8 rounded-3xl border border-border-main bg-card-main shadow-xl space-y-6">
        <div className="w-16 h-16 bg-accent-main/10 rounded-full flex items-center justify-center mx-auto text-accent-main animate-pulse">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Authentication is required to view the <strong className="text-text-primary">{requiredRole}</strong>. Please sign in with an authorized account profile.
          </p>
        </div>
        <button
          onClick={onLogin}
          className="px-6 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer mx-auto block"
        >
          Sign In to Account
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentPage, activeStoreSlug, activeProductId, stores, products, currentUser } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    let title = 'Clothza | Premium Fashion Boutique Marketplace';
    let metaDescription = 'Discover premium independent clothing stores, browse designer apparel, and contact sellers directly on Clothza.';
    
    if (currentPage === 'store' && activeStoreSlug) {
      const store = stores.find(s => s.slug === activeStoreSlug);
      if (store) {
        title = `${store.name} | Clothza Boutique`;
        metaDescription = `Browse organic wools, accessories, and designer wear at ${store.name} on Clothza.`;
      }
    } else if (currentPage === 'product' && activeProductId) {
      const product = products.find(p => p.id === activeProductId);
      if (product) {
        title = `${product.name} - Rs. ${product.price.toLocaleString()} | Clothza`;
        metaDescription = `Shop "${product.name}" for Rs. ${product.price.toLocaleString()} at independent designer stores on Clothza.`;
      }
    } else if (currentPage === 'dashboard') {
      title = 'Seller Dashboard | Clothza';
      metaDescription = 'Manage your store details, list fashion pieces, track views/clicks analytics on your seller hub.';
    } else if (currentPage === 'admin') {
      title = 'Platform Control Console | Clothza';
      metaDescription = 'Super administrative controls for Clothza. Manage boutiques, moderate products, and toggle promotional placements.';
    } else if (currentPage === 'checkout') {
      title = 'Secure Checkout | Clothza';
      metaDescription = 'Finalize shipping information and place orders directly with premium independent boutiques.';
    } else if (currentPage === 'customer-orders') {
      title = 'My Purchases | Clothza History';
      metaDescription = 'Review your split boutique invoices, transaction details, and order shipping status logs.';
    } else if (currentPage === 'lookbooks') {
      title = 'Shoppable Lookbooks | Clothza';
      metaDescription = 'Explore curated fashion edits and styling lookbooks by independent boutique designers on Clothza.';
    } else if (currentPage === 'privacy') {
      title = 'Privacy Policy | Clothza';
      metaDescription = 'Read the Clothza Privacy Policy regarding user accounts, boutique data, and transactional security.';
    } else if (currentPage === 'terms') {
      title = 'Terms & Conditions | Clothza';
      metaDescription = 'Read the Clothza Terms and Conditions governing SaaS subscriptions, boutique hosting, and catalog moderation.';
    }

    document.title = title;
    
    // Update Meta Description
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement('meta');
      metaDescEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescEl);
    }
    metaDescEl.setAttribute('content', metaDescription);
  }, [currentPage, activeStoreSlug, activeProductId, stores, products]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col transition-all duration-300">
      
      {/* Sticky Global Navigation */}
      <Navigation 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSignInClick={() => setIsAuthModalOpen(true)}
      />
      
      {/* Dynamic Main App Section */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}
        {currentPage === 'lookbooks' && <Lookbooks />}
        {currentPage === 'store' && <StorePage />}
        {currentPage === 'product' && <ProductPage />}
        {currentPage === 'privacy' && <PrivacyPolicy />}
        {currentPage === 'terms' && <TermsOfService />}
        
        {currentPage === 'dashboard' && (
          currentUser?.role === 'seller' ? (
            <Dashboard />
          ) : (
            <RestrictedAccess 
              requiredRole="Seller Hub Dashboard" 
              onLogin={() => setIsAuthModalOpen(true)} 
            />
          )
        )}

        {currentPage === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminPanel />
          ) : (
            <RestrictedAccess 
              requiredRole="Super Admin Control Panel" 
              onLogin={() => setIsAuthModalOpen(true)} 
            />
          )
        )}

        {currentPage === 'checkout' && (
          currentUser?.role === 'customer' ? (
            <Checkout />
          ) : (
            <RestrictedAccess 
              requiredRole="Secure Checkout" 
              onLogin={() => setIsAuthModalOpen(true)} 
            />
          )
        )}

        {currentPage === 'customer-orders' && (
          currentUser?.role === 'customer' ? (
            <CustomerOrders />
          ) : (
            <RestrictedAccess 
              requiredRole="Purchases History Portal" 
              onLogin={() => setIsAuthModalOpen(true)} 
            />
          )
        )}
      </main>

      {/* Global Minimal Footer */}
      <Footer />

      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <AppContent />
    </MarketplaceProvider>
  );
}
