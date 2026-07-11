/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { Search, Plus, Minus, ShoppingCart, CreditCard, User, Printer } from "lucide-react";

export function POSClient({ categories, items }: { categories: any[], items: any[] }) {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [subId, setSubId] = useState("");
  const [subscription, setSubscription] = useState<any | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, notes: "" }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const lookupSubscription = async () => {
    try {
        const res = await fetch(`/api/admin/subscriptions?query=${subId}`);
        const data = await res.json();
        if (data && data.length > 0) {
            setSubscription(data[0]);
            setCustomerName(data[0].customer_name);
            setCustomerPhone(data[0].customer_phone);
            alert("Subscription linked successfully.");
        } else {
            alert("Subscription not found");
        }
    } catch (e) {
        alert("Error looking up subscription");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);
  const tax = Math.round(subtotal * 0.0825);
  const total = subtotal + tax;

  const handleCheckout = async (useCredit = false) => {
    setIsCheckingOut(true);
    try {
        const res = await fetch("/api/admin/pos/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: customerName,
                customer_phone: customerPhone,
                items: cart,
                order_type: 'dine_in',
                subtotal_cents: subtotal,
                tax_cents: tax,
                total_cents: total,
                subscription_id: subscription?.id,
                apply_meal_credit: useCredit
            })
        });
        const data = await res.json();
        if (data.success) {
            setSuccessOrder(data.order);
            setCart([]);
            setCustomerName("");
            setCustomerPhone("");
            setSubscription(null);
            setSubId("");
        } else {
            alert(data.error);
        }
    } catch (e) {
        alert("Checkout failed");
    } finally {
        setIsCheckingOut(false);
    }
  };

  if (successOrder) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                 <ShoppingCart className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-brand-dark mb-2">Order Created!</h2>
              <p className="text-xl text-olive-dark font-mono mb-8">#{successOrder.order_number}</p>
              
              <div className="flex gap-4">
                  <button onClick={() => setSuccessOrder(null)} className="btn-primary py-3 px-8 text-lg">New Order</button>
                  <button className="btn-outline bg-white py-3 px-8 text-lg flex items-center gap-2"><Printer className="w-5 h-5"/> Print Receipt</button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-full">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
        <div className="p-6 bg-white border-b border-slate-200 shadow-sm z-10 flex justify-between items-center">
            <h1 className="text-2xl font-black text-brand-dark">Point of Sale</h1>
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    placeholder="Sub ID (e.g. OD-1001)" 
                    value={subId}
                    onChange={e => setSubId(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <button onClick={lookupSubscription} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700">Link Sub</button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.filter(i => i.available).map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => addToCart(item)}
                        className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all text-left flex flex-col h-40 active:scale-95"
                    >
                        <div className="font-bold text-olive-dark text-lg mb-auto line-clamp-2">{item.name}</div>
                        <div className="text-brand-gold font-black text-xl">${(item.price_cents / 100).toFixed(2)}</div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-20">
         <div className="p-6 border-b border-slate-200 bg-cream/30">
            <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-olive" /> Customer Details
            </h2>
            <input 
                type="text" 
                placeholder="Name" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
            />
            <input 
                type="text" 
                placeholder="Phone" 
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
            />
            {subscription && (
                <div className="mt-3 p-2 bg-brand-gold/20 rounded border border-brand-gold/30 text-sm font-bold text-brand-dark flex items-center justify-between">
                    <span>VIP Subscriber</span>
                    <span className="uppercase text-xs tracking-wider">{subscription.status}</span>
                </div>
            )}
         </div>

         <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                    <p>Cart is empty</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-olive-dark">{item.name}</div>
                                <div className="text-sm text-olive flex items-center gap-2 mt-1">
                                    <button className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200" onClick={() => {
                                        if (item.quantity === 1) removeFromCart(item.id);
                                        else setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
                                    }}><Minus className="w-3 h-3"/></button>
                                    <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                                    <button className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200" onClick={() => addToCart(item)}><Plus className="w-3 h-3"/></button>
                                </div>
                            </div>
                            <div className="font-mono font-bold text-brand-dark">
                                ${(item.price_cents * item.quantity / 100).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>

         <div className="p-6 bg-cream/20 border-t border-slate-200">
             <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-sm text-olive"><span className="uppercase tracking-wider">Subtotal</span> <span className="font-mono">${(subtotal / 100).toFixed(2)}</span></div>
                 <div className="flex justify-between text-sm text-olive"><span className="uppercase tracking-wider">Tax</span> <span className="font-mono">${(tax / 100).toFixed(2)}</span></div>
                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-300">
                     <span className="uppercase tracking-wider font-bold text-olive-dark text-lg">Total</span> 
                     <span className="font-mono text-3xl font-black text-brand-dark">${(total / 100).toFixed(2)}</span>
                 </div>
             </div>
             
             {subscription?.status === 'active' ? (
                 <div className="space-y-2">
                     <button 
                         disabled={isCheckingOut || cart.length === 0} 
                         onClick={() => handleCheckout(true)}
                         className="w-full bg-brand-gold hover:bg-yellow-500 text-brand-dark font-black py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                     >
                         <CreditCard className="w-5 h-5" /> USE MEAL CREDIT (FREE)
                     </button>
                     <button 
                         disabled={isCheckingOut || cart.length === 0} 
                         onClick={() => handleCheckout(false)}
                         className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
                     >
                         Pay Regular
                     </button>
                 </div>
             ) : (
                 <button 
                     disabled={isCheckingOut || cart.length === 0} 
                     onClick={() => handleCheckout(false)}
                     className="w-full bg-brand-dark hover:bg-black text-brand-gold font-black py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                 >
                     <CreditCard className="w-5 h-5" /> CHARGE ${(total / 100).toFixed(2)}
                 </button>
             )}
         </div>
      </div>
    </div>
  );
}
