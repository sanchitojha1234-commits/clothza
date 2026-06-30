import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  Sparkles, Check, ArrowRight, ShieldCheck, 
  CreditCard, Wallet, Send, Lock, RotateCw 
} from 'lucide-react';

interface SubscriptionPlansProps {
  onSuccess?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSuccess }) => {
  const { currentUser, updateUserSubscription, stores, updateStoreSubscription } = useMarketplace();
  const [selectedPlan, setSelectedPlan] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'card'>('esewa');
  
  // Payment Form State
  const [walletId, setWalletId] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  // Simulated Flow States
  const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'otp' | 'processing' | 'success'>('select');
  const [otpCode, setOtpCode] = useState('');
  const [formError, setFormError] = useState('');

  const plans = [
    {
      id: 'bronze' as const,
      name: 'Bronze (Basic)',
      price: 1500,
      description: 'Perfect for local boutique starters looking to test online cataloging.',
      listings: 'Up to 5 listings',
      themes: 'Minimalist theme only',
      features: [
        'Standard Boutique Analytics',
        'Basic Reviews Panel',
        'WhatsApp direct order click',
      ],
      popular: false,
      color: 'from-amber-700 to-amber-900',
    },
    {
      id: 'silver' as const,
      name: 'Silver (Growth)',
      price: 3500,
      description: 'Unlocks advanced engagement tools to grow your boutique storefront.',
      listings: 'Up to 20 listings',
      themes: 'Minimalist, Linen Boho, Streetwear',
      features: [
        'Customer Live Chat Messenger',
        'Promo Coupons & Discount Manager',
        'Advanced Analytics Dashboards',
        'Featured Boutique Spotlight eligibility',
      ],
      popular: true,
      color: 'from-slate-400 to-slate-600',
    },
    {
      id: 'gold' as const,
      name: 'Gold (Elite)',
      price: 7500,
      description: 'The ultimate showcase experience for high-end fashion design brands.',
      listings: 'Unlimited listings',
      themes: 'All themes (Minimalist, Linen, Streetwear, Leather)',
      features: [
        'Interactive Visual Outfit Builder & Lookbooks',
        'Featured Store Placement priority promotion',
        'Customer Live Chat Inbox with Auto-Greetings',
        'Full Admin-override features',
        'Priority Merchant Support hotline',
      ],
      popular: false,
      color: 'from-yellow-600 to-yellow-800',
    }
  ];

  const handlePlanSelect = (planId: 'bronze' | 'silver' | 'gold') => {
    setSelectedPlan(planId);
    setPaymentStep('details');
    setFormError('');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (paymentMethod === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setFormError('Please fill in all credit card credentials.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setFormError('Please enter a valid 16-digit credit card number.');
        return;
      }
    } else {
      if (!walletId.trim() || !pinCode.trim()) {
        setFormError('Please enter your mobile wallet number and security PIN.');
        return;
      }
      if (walletId.trim().length < 10) {
        setFormError('Wallet number must be 10 digits (e.g. 98xxxxxxxx).');
        return;
      }
    }

    // Go to OTP step to mock 2FA secure checkout
    setPaymentStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setFormError('Please enter a valid 4-digit code.');
      return;
    }

    setPaymentStep('processing');
    
    // Simulate transaction delay
    setTimeout(() => {
      if (currentUser && selectedPlan) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // 30 days validation
        
        updateUserSubscription(
          currentUser.id, 
          selectedPlan, 
          'active', 
          expirationDate.toISOString()
        );

        // Sync store subscription as well so merchant dashboard panels unlock instantly
        const userStore = stores.find(s => s.ownerId === currentUser.id || s.id === currentUser.storeId);
        if (userStore) {
          updateStoreSubscription(
            userStore.id,
            selectedPlan,
            'active',
            expirationDate.toISOString()
          );
        }
      }
      setPaymentStep('success');
    }, 1800);
  };

  const activePlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12 animate-fade-in font-sans text-left">
      
      {/* Step Header */}
      {paymentStep === 'select' && (
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-main/10 text-accent-main text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Store Registration</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-text-primary">
            Choose Your Boutique Subscription
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Establish your digital storefront catalog on Clothza. Select a monthly subscription plan to unlock premium layout themes, listing quotas, lookbooks, and promotional placements.
          </p>
        </div>
      )}

      {/* Select Plan View */}
      {paymentStep === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative border flex flex-col rounded-3xl bg-card-main shadow-xl hover:shadow-2xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-accent-main ring-1 ring-accent-main scale-105 md:translate-y-[-8px]' 
                  : 'border-border-main'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 translate-y-[-50%] bg-accent-main text-bg-primary text-[9px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              {/* Card Header */}
              <div className="p-6 border-b border-border-main space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-text-primary">{plan.name}</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{plan.description}</p>
                </div>
                <div className="pt-2">
                  <span className="font-serif text-3xl font-bold text-text-primary">Rs. {plan.price.toLocaleString()}</span>
                  <span className="text-xs text-text-secondary font-medium"> / month</span>
                </div>
              </div>

              {/* Key Quota Details */}
              <div className="bg-bg-primary/40 px-6 py-4 border-b border-border-main space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-main" />
                  <span>Quota: {plan.listings}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-main" />
                  <span>Theme: {plan.themes}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="p-6 flex-grow space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Includes:</p>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary leading-normal">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-accent-main text-bg-primary shadow-lg shadow-accent-main/20 hover:opacity-90'
                      : 'bg-text-primary text-bg-primary hover:opacity-90'
                  }`}
                >
                  <span>Subscribe & Pay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Processing/Checkout Panels */}
      {paymentStep !== 'select' && activePlanDetails && (
        <div className="max-w-2xl mx-auto border border-border-main bg-card-main/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
          
          {/* Header */}
          <div className="p-6 border-b border-border-main bg-bg-primary/20 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Subscribe: {activePlanDetails.name}</h3>
              <p className="text-xs text-text-secondary">Amount Due: <strong className="text-text-primary">Rs. {activePlanDetails.price.toLocaleString()}</strong></p>
            </div>
            <button 
              onClick={() => setPaymentStep('select')}
              className="text-[10px] font-bold uppercase text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            
            {/* Step: Select payment details */}
            {paymentStep === 'details' && (
              <div className="space-y-6">
                
                {/* Method selector tabs */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('esewa'); setFormError(''); }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer gap-2 ${
                      paymentMethod === 'esewa'
                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500 font-bold'
                        : 'border-border-main hover:bg-bg-primary/40 text-text-secondary'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">eSewa Wallet</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('khalti'); setFormError(''); }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer gap-2 ${
                      paymentMethod === 'khalti'
                        ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500 font-bold'
                        : 'border-border-main hover:bg-bg-primary/40 text-text-secondary'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Khalti Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setFormError(''); }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer gap-2 ${
                      paymentMethod === 'card'
                        ? 'border-amber-600 bg-amber-600/5 text-amber-600 font-bold'
                        : 'border-border-main hover:bg-bg-primary/40 text-text-secondary'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Credit Card</span>
                  </button>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-medium">
                      {formError}
                    </div>
                  )}

                  {paymentMethod !== 'card' ? (
                    /* Wallet inputs */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-text-secondary">
                          {paymentMethod === 'esewa' ? 'eSewa ID (Mobile No)' : 'Khalti ID (Mobile No)'}
                        </label>
                        <input
                          type="tel"
                          value={walletId}
                          onChange={(e) => setWalletId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98XXXXXXXX"
                          className="w-full bg-bg-primary border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-main"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-text-secondary">Security PIN</label>
                        <input
                          type="password"
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="●●●●"
                          className="w-full bg-bg-primary border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-main text-center font-bold tracking-widest"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Card inputs */
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-text-secondary">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="First Last"
                          className="w-full bg-bg-primary border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-main"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-[10px] font-bold uppercase text-text-secondary">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const input = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');
                              setCardNumber(formatted);
                            }}
                            placeholder="4111 2222 3333 4444"
                            className="w-full bg-bg-primary border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-main"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-text-secondary">Expiry</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => {
                                const input = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (input.length > 2) {
                                  setCardExpiry(input.slice(0, 2) + '/' + input.slice(2));
                                } else {
                                  setCardExpiry(input);
                                }
                              }}
                              placeholder="MM/YY"
                              className="w-full bg-bg-primary border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-main text-center"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-text-secondary">CVV</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="123"
                              className="w-full bg-bg-primary border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-main text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border-main flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Secured 256-bit bank encryption</span>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-text-primary text-bg-primary text-xs font-bold hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
                    >
                      Process Payment (Rs. {activePlanDetails.price.toLocaleString()})
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step: OTP Authentication */}
            {paymentStep === 'otp' && (
              <div className="space-y-6 py-4 max-w-sm mx-auto text-center">
                <div className="w-12 h-12 rounded-full bg-accent-main/10 text-accent-main flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-text-primary">OTP Verification Code</h4>
                  <p className="text-xs text-text-secondary leading-normal">
                    We sent a mock 4-digit security code to your register phone line. Enter it to verify the transaction.
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-medium">
                      {formError}
                    </div>
                  )}

                  <div className="flex justify-center">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                        setFormError('');
                      }}
                      placeholder="1234"
                      className="w-36 bg-bg-primary border border-border-main rounded-xl px-4 py-3 text-lg font-bold tracking-[0.7em] text-center focus:outline-none focus:border-accent-main text-text-primary"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-text-primary text-bg-primary text-xs font-bold hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
                    >
                      Verify & Complete Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step: Processing Spinner */}
            {paymentStep === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <RotateCw className="w-8 h-8 text-accent-main animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text-primary">Processing Payment...</p>
                  <p className="text-[10px] text-text-secondary">Simulating transaction gateway verification</p>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {paymentStep === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center animate-pulse">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-text-primary">Subscription Payment Confirmed!</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Rs. {activePlanDetails.price.toLocaleString()} was successfully paid. Your account is upgraded to <strong>{activePlanDetails.name}</strong> until next month.
                  </p>
                </div>

                {(() => {
                  const hasStore = stores.some(s => s.ownerId === currentUser?.id || s.id === currentUser?.storeId);
                  return (
                    <button
                      onClick={() => {
                        if (onSuccess) onSuccess();
                      }}
                      className="px-8 py-3 bg-text-primary text-bg-primary text-xs font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer mx-auto"
                    >
                      <span>{hasStore ? 'Return to Dashboard' : 'Unlock Boutique Wizard'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  );
                })()}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
