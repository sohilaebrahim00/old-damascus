/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react/no-unescaped-entities */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Order, OrderItem } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, ListFilter, Play, CheckCircle, ChefHat, BellRing } from "lucide-react";
import { OrderCard } from "./OrderCard";
import { OrderDetailsModal } from "./OrderDetailsModal";

export function KitchenDisplayClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [filter, setFilter] = useState("ALL"); // ALL, NEW, PREPARING, READY
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  const supabase = createClient();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play a synthesized beep for new orders
  const playNewOrderSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up to A6
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio play failed, user interaction may be required first.");
    }
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch order with items
          const { data } = await supabase.from('orders').select(`*, order_items(*, order_item_modifiers(*))`).eq('id', payload.new.id).single();
          if (data) {
              setOrders(prev => [...prev, data]);
              playNewOrderSound();
          }
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
          // Note: Full item tree isn't sent on UPDATE unless explicitly fetched, but usually items don't change, just status.
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, playNewOrderSound]);

  const updateOrderStatus = async (id: string, status: string) => {
    // Optimistic UI
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
    try {
      await fetch(`/api/admin/kitchen/orders/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status })
      });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const delayOrder = async (id: string, delayMinutes: number) => {
    try {
      await fetch(`/api/admin/kitchen/orders/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delay", delayMinutes })
      });
      // A realtime update will catch the estimated_ready_time change
    } catch (e) {
      console.error("Failed to delay order", e);
    }
  };

  const filteredOrders = orders
    .filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED') // Hide completed from main board by default
    .filter(o => filter === "ALL" ? true : o.status === filter)
    .filter(o => query === "" || o.order_number.toLowerCase().includes(query.toLowerCase()) || o.customer_name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in search
      if (document.activeElement?.tagName === 'INPUT') return;

      // Find the first order that is active
      const activeOrders = filteredOrders;
      if (activeOrders.length === 0) return;
      const first = activeOrders[0];

      if (e.key === ' ' || e.key === 's') { // Start
        if (first.status === 'NEW' || first.status === 'ACCEPTED') {
          e.preventDefault();
          updateOrderStatus(first.id, 'PREPARING');
        }
      } else if (e.key === 'r') { // Ready
        if (first.status === 'PREPARING') {
          updateOrderStatus(first.id, 'READY');
        }
      } else if (e.key === 'c') { // Complete
        if (first.status === 'READY') {
          updateOrderStatus(first.id, 'COMPLETED');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Note: Runs on every render to get latest filteredOrders closure

  // Stats
  const activeCount = orders.filter(o => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)).length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-brand-gold" />
            <span className="bg-gradient-to-r from-brand-gold to-brand-olive bg-clip-text text-transparent">KDS</span>
          </h1>
          
          <div className="hidden sm:flex gap-4">
             <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active</span>
                <span className="text-xl font-bold text-white leading-none">{activeCount}</span>
             </div>
             <div className="w-px bg-slate-800"></div>
             <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Preparing</span>
                <span className="text-xl font-bold text-blue-400 leading-none">{preparingCount}</span>
             </div>
             <div className="w-px bg-slate-800"></div>
             <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ready</span>
                <span className="text-xl font-bold text-green-400 leading-none">{readyCount}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold text-slate-200 placeholder:text-slate-500"
            />
          </div>
          
          <div className="flex bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <button onClick={() => setFilter("ALL")} className={`px-4 py-2 text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>ALL</button>
            <button onClick={() => setFilter("NEW")} className={`px-4 py-2 text-sm font-bold transition-colors border-l border-slate-700 ${filter === 'NEW' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>NEW</button>
            <button onClick={() => setFilter("PREPARING")} className={`px-4 py-2 text-sm font-bold transition-colors border-l border-slate-700 ${filter === 'PREPARING' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>PREP</button>
            <button onClick={() => setFilter("READY")} className={`px-4 py-2 text-sm font-bold transition-colors border-l border-slate-700 ${filter === 'READY' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>READY</button>
          </div>
          
          <button onClick={() => {
            // Init audio context on user gesture
             if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
             }
             alert("Audio notifications enabled.");
          }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-brand-gold transition-colors" title="Enable Sound">
            <BellRing className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-auto h-[calc(100vh-80px)]">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <CheckCircle className="w-16 h-16 mb-4 text-slate-700" />
             <h2 className="text-2xl font-bold text-slate-400">All caught up!</h2>
             <p>No active orders in this view.</p>
          </div>
        ) : (
          <div className="flex gap-4 sm:gap-6 pb-6">
            <AnimatePresence>
              {filteredOrders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="shrink-0"
                >
                  <OrderCard 
                    order={order} 
                    onUpdateStatus={(status) => updateOrderStatus(order.id, status)}
                    onDelay={(mins) => delayOrder(order.id, mins)}
                    onClick={() => setSelectedOrder(order)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          isOpen={true} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={(s) => updateOrderStatus(selectedOrder.id, s)}
        />
      )}
    </div>
  );
}
