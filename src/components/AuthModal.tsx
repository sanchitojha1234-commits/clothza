import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { unlockAdminAccess, navigateToAdmin } = useMarketplace();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passcode.trim()) {
      setError('Please enter the admin passcode.');
      return;
    }

    const success = unlockAdminAccess(passcode.trim());
    if (success) {
      onClose();
      setPasscode('');
      alert("Super Admin console unlocked successfully!");
      navigateToAdmin();
    } else {
      setError('Invalid passcode key. Access denied.');
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
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl p-8 shadow-2xl text-left font-sans"
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
              <span className="text-[10px] tracking-wider uppercase font-bold text-accent-main flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Super Admin Console</span>
              </span>
              <h2 className="font-serif text-xl font-bold text-text-primary">
                Enter Admin Passcode
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

              <div className="space-y-2">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Please enter the administrative credentials key to unlock Super Admin privileges.
                </p>
                <div className="relative pt-1">
                  <input
                    type="password"
                    placeholder="Enter Admin Passcode"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-4 py-2.5 bg-bg-secondary/40 border border-border-main rounded-xl text-xs focus:outline-none focus:border-accent-main transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-accent-main text-accent-fg hover:opacity-90 transition-opacity font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <span>Unlock Console</span>
              </button>
            </form>

            <div className="mt-4 p-3 bg-bg-secondary/50 rounded-2xl border border-border-main text-[10px] text-text-secondary space-y-1">
              <span className="font-bold text-accent-main uppercase block">Tip:</span>
              <p>Type the passcode <strong className="text-text-primary">clothzaadmin2026</strong> to enter Super Admin mode directly without database accounts!</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
