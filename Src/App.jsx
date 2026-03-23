import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Scissors, 
  Droplets, 
  Sparkles, 
  Minus, 
  Plus, 
  CreditCard,
  Smartphone,
  User,
  Phone,
  MessageSquareLock,
  MessageCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// --- CONFIGURATION ---
// Developer Cousin: Flip this to 'true' and update the URL when your backend is ready.
const USE_REAL_GATEWAY = false; 
const BACKEND_API_URL = 'https://api.paynest.in/v1/auth/send-otp';

// --- MOCK DATA ---
const SALON_NAME = "TONI&GUY";
const LOCATION = "Jubilee Hills, Hyderabad";

const CATEGORIES = [
  { id: 'haircuts', name: 'Cut & Style', icon: <Scissors size={18} /> },
  { id: 'colour', name: 'Colour', icon: <Droplets size={18} /> },
  { id: 'treatments', name: 'Treatments', icon: <Sparkles size={18} /> },
];

const SERVICES = {
  haircuts: [
    { id: 'h1', name: 'Style Director Cut', description: 'Includes consultation, wash, cut and premium blow-dry.', price: 2500, duration: '60 min' },
    { id: 'h2', name: 'Senior Stylist Cut', description: 'Includes consultation, wash, cut and standard blow-dry.', price: 1800, duration: '45 min' },
    { id: 'h3', name: 'Men\'s Classic Fade', description: 'Precision clipper and scissor work.', price: 1200, duration: '30 min' },
  ],
  colour: [
    { id: 'c1', name: 'Balayage / Ombre', description: 'Hand-painted highlights for a natural, sun-kissed look.', price: 6500, duration: '120 min' },
    { id: 'c2', name: 'Root Touch Up', description: 'Conceal regrowth and greys.', price: 2500, duration: '60 min' },
  ],
  treatments: [
    { id: 't1', name: 'Olaplex Bond Builder', description: 'Intensive repair for damaged or coloured hair.', price: 3000, duration: '45 min' },
  ]
};

export default function App() {
  const [view, setView] = useState('welcome'); 
  
  // User Data & Auth State
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [gatewayError, setGatewayError] = useState('');
  
  const [notification, setNotification] = useState({ visible: false, message: '' });
  const [activeCategory, setActiveCategory] = useState('haircuts');
  const [cart, setCart] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => window.scrollTo(0, 0), [view]);

  // --- GATEWAY SERVICE LAYER ---
  const sendOTPRequest = async (phone, code, name) => {
    if (USE_REAL_GATEWAY) {
      try {
        const response = await fetch(BACKEND_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code, name, salon: SALON_NAME })
        });
        
        if (!response.ok) throw new Error('Gateway failed to send message');
        return true;
      } catch (error) {
        console.error("Gateway Error:", error);
        setGatewayError('Failed to send OTP via SMS. Please try again.');
        return false;
      }
    } else {
      // Mock Gateway Response for Demo Purposes
      return new Promise((resolve) => {
        setTimeout(() => {
          setNotification({
            visible: true,
            message: `[MOCK SMS] Your PayNest verification code for ${SALON_NAME} is ${code}. Do not share this with anyone.`
          });
          setTimeout(() => setNotification({ visible: false, message: '' }), 6000);
          resolve(true);
        }, 1500);
      });
    }
  };

  // --- AUTH LOGIC ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setGatewayError('');
    
    if (customerName.trim() && mobileNumber.length === 10) {
      setIsProcessing(true);
      
      const secureCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(secureCode);
      setOtp('');
      setOtpError(false);

      // Call the Gateway Integration
      const success = await sendOTPRequest(mobileNumber, secureCode, customerName);
      
      setIsProcessing(false);
      
      if (success) {
        setView('otp');
      }
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setOtpError(false);
    
    if (otp.length === 4) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        if (otp === generatedOtp) {
          setView('menu');
        } else {
          setOtpError(true);
          setOtp('');
        }
      }, 800);
    }
  };

  // --- CART LOGIC ---
  const updateQuantity = (item, delta) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCart = { ...prev };
      if (newQty === 0) delete newCart[item.id];
      else newCart[item.id] = { ...item, quantity: newQty };
      return newCart;
    });
  };

  const getCartTotal = () => Object.values(cart).reduce((total, item) => total + (item.price * item.quantity), 0);
  const getCartCount = () => Object.values(cart).reduce((count, item) => count + item.quantity, 0);

  const handlePaymentSimulation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setView('success');
      setCart({}); 
    }, 2500);
  };

  // --- UI COMPONENTS ---

  const SMSNotification = () => (
    <div className={`fixed top-4 left-4 right-4 z-[100] transition-all duration-500 transform ${notification.visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'}`}>
      <div className="bg-zinc-800/95 backdrop-blur-xl border border-zinc-700 shadow-2xl rounded-2xl p-4 flex gap-4 items-start">
        <div className="bg-green-500 rounded-lg p-2 mt-0.5">
          <MessageCircle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-200 font-semibold text-sm">Messages</span>
            <span className="text-zinc-500 text-xs">now</span>
          </div>
          <p className="text-white text-sm leading-snug">{notification.message}</p>
        </div>
      </div>
    </div>
  );

  const renderHeader = (showBack = false, title = "", backAction = null) => (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-4 flex items-center justify-between">
      {showBack ? (
        <button onClick={backAction || (() => setView('menu'))} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">{SALON_NAME}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{LOCATION}</p>
        </div>
      )}
      
      {title && <h2 className="text-lg font-medium text-white absolute left-1/2 -translate-x-1/2">{title}</h2>}

      {(view === 'menu' || view === 'welcome') && (
        <div className="text-right flex-1 flex flex-col items-end">
           <span className="text-[10px] uppercase tracking-wider text-zinc-500">Powered by</span>
           <span className="text-sm font-semibold text-zinc-300">PayNest</span>
        </div>
      )}
    </header>
  );

  const renderWelcome = () => (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {renderHeader()}
      
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Welcome.</h2>
          <p className="text-zinc-400 leading-relaxed">
            Please enter your details to view the menu and book your services at {SALON_NAME}.
          </p>
        </div>

        {gatewayError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-400">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-snug">{gatewayError}</p>
          </div>
        )}

        <form onSubmit={handleSendOTP} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400 px-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400 px-1">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Phone size={18} />
                <span className="ml-2 text-zinc-400 font-medium border-r border-zinc-700 pr-2">+91</span>
              </div>
              <input 
                type="tel" 
                maxLength="10"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-[84px] pr-4 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600 tracking-wide"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={!customerName.trim() || mobileNumber.length !== 10 || isProcessing}
            className="w-full mt-8 bg-white text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              "Get OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderOTP = () => (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative">
      <SMSNotification />
      {renderHeader(true, "Verification", () => setView('welcome'))}
      
      <div className="flex-1 flex flex-col px-6 pt-12">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-white border border-zinc-800">
             <MessageSquareLock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify your number</h2>
          <p className="text-zinc-400 text-sm">
            We've sent a 4-digit code via WhatsApp/SMS to<br/>
            <span className="text-white font-medium mt-1 inline-block">+91 {mobileNumber.slice(0,5)} {mobileNumber.slice(5)}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-8 flex flex-col items-center">
          <div className="relative">
            <input 
              type="text" 
              maxLength="4"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                setOtpError(false);
              }}
              placeholder="• • • •"
              className={`w-48 bg-transparent border-b-2 text-center text-4xl py-2 focus:outline-none transition-colors tracking-[1em] placeholder:text-zinc-700
                ${otpError ? 'border-red-500 text-red-500' : 'border-zinc-700 text-white focus:border-white'}`}
              required
              autoFocus
            />
            {otpError && (
              <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-1 text-red-500 text-sm">
                <XCircle size={14} /> Incorrect OTP. Try again.
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={otp.length !== 4 || isProcessing}
            className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-4"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              "Verify & View Menu"
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="pb-28 min-h-screen bg-zinc-950">
      {renderHeader()}
      
      <div className="px-4 py-4 bg-zinc-900/30 border-b border-zinc-900">
         <p className="text-sm text-zinc-400">Hello, <span className="text-white font-medium">{customerName.split(' ')[0]}</span>. What are we doing today?</p>
      </div>

      <div className="sticky top-[73px] z-40 bg-zinc-950 border-b border-zinc-900 shadow-xl shadow-black/20">
        <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                activeCategory === cat.id 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {SERVICES[activeCategory].map(service => {
          const qty = cart[service.id]?.quantity || 0;
          return (
            <div key={service.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="pr-4">
                  <h3 className="text-zinc-100 font-medium text-lg">{service.name}</h3>
                  <p className="text-zinc-500 text-sm mt-1 leading-relaxed">{service.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold block">₹{service.price}</span>
                  <span className="text-zinc-600 text-xs">{service.duration}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end items-center">
                {qty > 0 ? (
                  <div className="flex items-center bg-zinc-800 rounded-full p-1 border border-zinc-700">
                    <button onClick={() => updateQuantity(service, -1)} className="p-2 text-zinc-300 hover:text-white">
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-white font-medium">{qty}</span>
                    <button onClick={() => updateQuantity(service, 1)} className="p-2 text-zinc-300 hover:text-white">
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => updateQuantity(service, 1)}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-full transition-colors border border-zinc-700"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {getCartCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pb-6 z-50">
          <button 
            onClick={() => setView('cart')}
            className="w-full bg-white text-black p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-white/10 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {getCartCount()}
              </div>
              <span className="font-semibold">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">₹{getCartTotal()}</span>
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}
    </div>
  );

  const renderCart = () => {
    const total = getCartTotal();
    const taxes = Math.round(total * 0.18);
    const finalTotal = total + taxes;

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        {renderHeader(true, "Your Cart")}
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              {Object.values(cart).map(item => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b border-zinc-900">
                  <div>
                    <h4 className="text-zinc-200 font-medium">{item.name}</h4>
                    <div className="text-zinc-500 text-sm mt-1">₹{item.price} x {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium mb-2">₹{item.price * item.quantity}</div>
                    <div className="flex items-center bg-zinc-900 rounded-full p-1">
                      <button onClick={() => updateQuantity(item, -1)} className="p-1.5 text-zinc-400">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-zinc-200 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item, 1)} className="p-1.5 text-zinc-400">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/50 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-medium mb-4">Bill Summary</h3>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Taxes & Fees (18% GST)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-zinc-800 flex justify-between text-white font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-900 bg-zinc-950 pb-8">
          <button 
            onClick={() => setView('payment')}
            className="w-full bg-white text-black p-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98
