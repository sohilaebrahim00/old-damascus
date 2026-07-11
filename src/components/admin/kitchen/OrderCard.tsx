/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import { Order, OrderItem } from "@/lib/supabase/types";
import { Clock, Play, CheckCircle, Package, Truck, UtensilsCrossed, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function OrderCard({ 
  order, 
  onUpdateStatus, 
  onDelay,
  onClick
}: { 
  order: any; 
  onUpdateStatus: (status: string) => void;
  onDelay: (mins: number) => void;
  onClick: () => void;
}) {
  const [timeElapsed, setTimeElapsed] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const start = new Date(order.created_at).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - start) / 60000); // minutes
      setTimeElapsed(diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';
  const isNew = order.status === 'NEW' || order.status === 'ACCEPTED';
  
  const TypeIcon = order.order_type === 'delivery' ? Truck : order.order_type === 'pickup' ? Package : UtensilsCrossed;

  return (
    <div 
      className={`w-80 sm:w-96 rounded-2xl shadow-xl border-2 flex flex-col h-[70vh] min-h-[500px] overflow-hidden transition-all bg-slate-900 ${
        isReady ? 'border-green-500/50 shadow-green-900/20' : 
        isPreparing ? 'border-blue-500/50 shadow-blue-900/20' : 
        'border-brand-gold/50 shadow-brand-gold/10'
      }`}
    >
      {/* Header */}
      <div 
        className={`p-4 flex justify-between items-start cursor-pointer ${
          isReady ? 'bg-green-500/10' : 
          isPreparing ? 'bg-blue-500/10' : 
          'bg-brand-gold/10'
        }`}
        onClick={onClick}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-white leading-none font-mono tracking-tighter">#{order.order_number}</h2>
            {isNew && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span></span>}
          </div>
          <div className="text-slate-300 font-bold text-lg truncate w-48">{order.customer_name}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${
             order.order_type === 'delivery' ? 'bg-purple-500/20 text-purple-300' :
             order.order_type === 'pickup' ? 'bg-orange-500/20 text-orange-300' :
             'bg-teal-500/20 text-teal-300'
          }`}>
             <TypeIcon className="w-3 h-3" /> {order.order_type}
          </span>
          <div className="text-slate-400 font-bold text-sm mt-2 flex items-center gap-1">
             <Clock className="w-3 h-3" /> {timeElapsed}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50" onClick={onClick}>
        {order.order_items?.map((item: any) => (
          <div key={item.id} className="mb-4 pb-4 border-b border-slate-800 last:border-0 last:mb-0 last:pb-0">
             <div className="flex justify-between items-start">
               <div className="flex gap-2">
                 <span className="text-brand-gold font-bold text-lg">{item.quantity}x</span>
                 <span className="text-white font-bold text-lg leading-snug">{item.name}</span>
               </div>
             </div>
             {item.order_item_modifiers && item.order_item_modifiers.length > 0 && (
               <ul className="mt-2 ml-8 space-y-1">
                 {item.order_item_modifiers.map((mod: any) => (
                   <li key={mod.id} className="text-slate-400 text-sm flex items-start gap-2">
                     <span className="text-slate-600 mt-1">-</span> {mod.name}
                   </li>
                 ))}
               </ul>
             )}
             {item.special_instructions && (
               <div className="mt-2 ml-8 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-300 text-sm font-semibold">
                 NOTE: {item.special_instructions}
               </div>
             )}
          </div>
        ))}
      </div>

      {/* Badges / Global Notes */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
         {order.order_source === 'subscription' && <span className="bg-brand-gold text-brand-dark font-black px-2 py-1 rounded uppercase tracking-wider">Subscriber</span>}
         {order.payment_status === 'UNPAID' && <span className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-1 rounded">UNPAID</span>}
         {order.notes && <div className="w-full mt-1 text-yellow-500 font-semibold truncate bg-yellow-500/10 p-1.5 rounded border border-yellow-500/20">"{order.notes}"</div>}
      </div>

      {/* Actions */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-3 shrink-0">
        {isNew ? (
          <>
            <button onClick={() => onUpdateStatus('PREPARING')} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
              <Play className="fill-current w-6 h-6" /> Start Prep [Space]
            </button>
            <button onClick={() => onDelay(5)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg text-sm">+5 Min</button>
            <button onClick={() => onUpdateStatus('CANCELLED')} className="bg-red-900/50 hover:bg-red-800 text-red-300 font-bold py-3 rounded-lg text-sm">Cancel</button>
          </>
        ) : isPreparing ? (
          <>
            <button onClick={() => onUpdateStatus('READY')} className="col-span-2 bg-green-600 hover:bg-green-500 text-white font-black text-xl py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6" /> Mark Ready [R]
            </button>
            <button onClick={() => onDelay(5)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg text-sm">+5 Min</button>
            <button onClick={() => onUpdateStatus('NEW')} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-1"><XCircle className="w-4 h-4"/> Undo</button>
          </>
        ) : isReady ? (
          <>
            <button onClick={() => onUpdateStatus('COMPLETED')} className="col-span-2 bg-slate-200 hover:bg-white text-slate-900 font-black text-xl py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6" /> Complete [C]
            </button>
            <button onClick={() => onUpdateStatus('PREPARING')} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-1"><XCircle className="w-4 h-4"/> Undo Ready</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
