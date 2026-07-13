/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import { X, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OrderDetailsModal({ 
  order, 
  isOpen, 
  onClose,
}: { 
  order: any; 
  isOpen: boolean; 
  onClose: () => void;
  onUpdateStatus?: (status: string) => void;
}) {
  if (!order) return null;

  const printReceipt = () => {
    // Generate a simple receipt layout in a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${order.order_number}</title>
            <style>
              body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .flex-between { display: flex; justify-content: space-between; }
              .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
              .item { margin-bottom: 5px; }
              .mod { margin-left: 10px; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <h1 class="center">OLD DAMASCUS</h1>
            <p class="center">1310 W Campbell Rd #108<br/>Richardson, TX 75080<br/>469-728-5635</p>
            <div class="divider"></div>
            <p>Order: <b>#${order.order_number}</b></p>
            <p>Type: ${order.order_type.toUpperCase()}</p>
            <p>Customer: ${order.customer_name}</p>
            <p>Time: ${new Date(order.created_at).toLocaleString()}</p>
            <div class="divider"></div>
            ${order.order_items.map((i: any) => `
              <div class="item">
                <div class="flex-between">
                  <span>${i.quantity}x ${i.name}</span>
                  <span>$${(i.price_cents / 100).toFixed(2)}</span>
                </div>
                ${i.order_item_modifiers ? i.order_item_modifiers.map((m: any) => `
                  <div class="flex-between mod">
                    <span>- ${m.name}</span>
                    <span>$${(m.additional_price_cents / 100).toFixed(2)}</span>
                  </div>
                `).join('') : ''}
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="flex-between bold">
              <span>Total</span>
              <span>$${(order.total_cents / 100).toFixed(2)}</span>
            </div>
            <p class="center" style="margin-top: 30px;">Thank you for dining with us!</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] flex flex-col overflow-hidden text-slate-200"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
              <div>
                <h2 className="text-3xl font-black text-white font-mono mb-2">#{order.order_number}</h2>
                <div className="text-slate-400 font-semibold">{order.customer_name} • {order.customer_phone}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={printReceipt} className="p-3 bg-slate-800 rounded-xl hover:bg-brand-gold hover:text-slate-900 transition-colors">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Order Items</h3>
              
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="text-brand-gold font-black text-xl">{item.quantity}x</span>
                        <span className="text-white font-bold text-xl">{item.name}</span>
                      </div>
                      <div className="text-slate-400 font-mono">${(item.price_cents / 100).toFixed(2)}</div>
                    </div>
                    {item.order_item_modifiers && item.order_item_modifiers.length > 0 && (
                      <ul className="mt-3 ml-8 space-y-2">
                        {item.order_item_modifiers.map((mod: any) => (
                          <li key={mod.id} className="text-slate-300 text-sm flex justify-between">
                            <span>- {mod.name}</span>
                            <span className="text-slate-500 font-mono">+${(mod.additional_price_cents / 100).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.special_instructions && (
                      <div className="mt-3 ml-8 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300 text-sm">
                        <span className="font-bold">NOTE:</span> {item.special_instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <h4 className="font-bold text-yellow-500 text-sm mb-1 uppercase tracking-wider">Order Notes</h4>
                  <p className="text-yellow-100">{order.notes}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 text-sm text-slate-400">
                <div className="flex justify-between"><span className="uppercase tracking-wider">Subtotal</span> <span className="font-mono text-slate-200">${(order.subtotal_cents / 100).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="uppercase tracking-wider">Tax</span> <span className="font-mono text-slate-200">${(order.tax_cents / 100).toFixed(2)}</span></div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                  <span className="uppercase tracking-wider font-bold text-white">Total</span> 
                  <span className="font-mono text-xl font-bold text-brand-gold">${(order.total_cents / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-8">
                 <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Timeline</h3>
                 <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-700">
                    <div className="relative">
                       <span className="absolute -left-[21px] w-3 h-3 bg-slate-500 rounded-full border-2 border-slate-900 mt-1"></span>
                       <div className="text-sm text-slate-300 font-medium">Received</div>
                       <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    {order.preparing_at && (
                       <div className="relative">
                          <span className="absolute -left-[21px] w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 mt-1"></span>
                          <div className="text-sm text-blue-300 font-medium">Started Preparing</div>
                          <div className="text-xs text-slate-500">{new Date(order.preparing_at).toLocaleString()}</div>
                       </div>
                    )}
                    {order.ready_at && (
                       <div className="relative">
                          <span className="absolute -left-[21px] w-3 h-3 bg-brand-gold rounded-full border-2 border-slate-900 mt-1"></span>
                          <div className="text-sm text-brand-gold font-medium">Ready</div>
                          <div className="text-xs text-slate-500">{new Date(order.ready_at).toLocaleString()}</div>
                       </div>
                    )}
                    {order.completed_at && (
                       <div className="relative">
                          <span className="absolute -left-[21px] w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 mt-1"></span>
                          <div className="text-sm text-green-400 font-medium">Completed</div>
                          <div className="text-xs text-slate-500">{new Date(order.completed_at).toLocaleString()}</div>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
