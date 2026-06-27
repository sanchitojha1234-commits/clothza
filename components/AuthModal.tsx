import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle } = useMarketplace();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    const res = await signInWithGoogle();
    if (res.success) {
      onClose();
      resetForm();
    } else {
      setError(res.error || 'Failed to sign in with Google.');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('customer');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      
      const res = await signUp(name.trim(), email.trim(), password.trim(), role);
      if (res.success) {
        onClose();
        resetForm();
      } else {
        setError(res.error || 'Failed to sign up.');
      }
    } else {
      const res = await signIn(email.trim(), password.trim());
      if (res.success) {
        onClose();
        resetForm();
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl p-8 shadow-2xl text-left font-sans"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-bg-tertiary transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="mb-6 space-y-1">
              <span className="text-[10px] tracking-wider uppercase font-bold text-accent-main">
                {isSignUp ? 'Elite Access Registry' : 'Boutique Gate Portal'}
              </span>
              <h2 className="font-serif text-2xl font-bold text-text-primary">
                {isSignUp ? 'Create Platform Profile' : 'Authenticate User'}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 text-xs bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 font-medium"
                >
                  {error}
                </motion.div>
              )}

              {isSignUp && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-text-secondary">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                      type="text"
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-bg-secondary/40 border border-border-main rounded-xl text-xs focus:outline-none focus:border-accent-main transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-text-secondary">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="email"
                    placeholder="alex@clothza.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-bg-secondary/40 border border-border-main rounded-xl text-xs focus:outline-none focus:border-accent-main transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-text-secondary">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-bg-secondary/40 border border-border-main rounded-xl text-xs focus:outline-none focus:border-accent-main transition-colors"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Select Profile Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        role === 'customer'
                          ? 'bg-text-primary text-bg-primary border-text-primary shadow-sm'
                          : 'bg-bg-secondary/20 border-border-main text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Boutique Shopper
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        role === 'seller'
                          ? 'bg-text-primary text-bg-primary border-text-primary shadow-sm'
                          : 'bg-bg-secondary/20 border-border-main text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Brand Seller
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-accent-main text-accent-fg hover:opacity-90 transition-opacity font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                {isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register Account</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Access Panel</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-main/60"></div>
              </div>
              <span className="relative px-3 text-[10px] uppercase font-bold tracking-wider text-text-tertiary bg-glass-bg backdrop-blur-xl">
                Or Continue With
              </span>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl border border-border-main bg-card-main hover:bg-bg-secondary/45 transition-colors font-bold text-xs flex items-center justify-center space-x-2 text-text-primary shadow-sm hover:shadow cursor-pointer mb-2"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google Account</span>
            </button>

            {/* Quick Demo Assist */}
            {!isSignUp && (
              <div className="mt-4 p-3 bg-bg-secondary/50 rounded-2xl border border-border-main text-[10px] text-text-secondary space-y-1">
                <span className="font-bold text-accent-main uppercase block">Developer Demo Credentials:</span>
                <p>• Shopper: <strong className="text-text-primary">alex@clothza.com</strong> / password123</p>
                <p>• Merchant: <strong className="text-text-primary">noir@clothza.com</strong> / password123</p>
                <p>• Administrator: <strong className="text-text-primary">admin@clothza.com</strong> / adminpassword</p>
              </div>
            )}

            {/* Toggle Sign Up / Sign In link */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-[11px] font-bold text-text-secondary hover:text-accent-main transition-colors underline decoration-dotted cursor-pointer"
              >
                {isSignUp ? 'Already own an account? Sign In' : 'Do not have an account? Sign Up'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
