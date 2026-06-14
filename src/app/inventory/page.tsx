'use client';

import React, { useState } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { InventoryItem } from '@/types/laundry';
import {
  Package2,
  AlertTriangle,
  RotateCw,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';

export default function InventoryPage() {
  const { inventory, updateInventoryStock, showToast } = useLaundry();

  // Stock increment state
  const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({});

  const handleRestock = async (item: InventoryItem) => {
    const amountToAdd = restockAmounts[item.id] || 5; // default to 5 units
    const newQty = Number((item.quantity + amountToAdd).toFixed(2));
    
    try {
      await updateInventoryStock(item.id, newQty);
      // Reset input amount
      setRestockAmounts(prev => ({ ...prev, [item.id]: 0 }));
    } catch (err) {
      console.error(err);
      showToast('Error updating stock level.', 'error');
    }
  };

  const handleQtyChange = (itemId: string, val: number) => {
    setRestockAmounts(prev => ({ ...prev, [itemId]: Math.max(0, val) }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Inventory &amp; Supplies
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor laundry chemicals, restock supply items, and audits threshold alerts.
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Auto-consumption linked to completed orders!</span>
        </div>
      </div>

      {/* Low Stock Summary Alerts */}
      {inventory.some(i => i.quantity <= i.threshold) && (
        <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/20 text-amber-300 text-xs flex gap-3 items-start animate-pulse">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-200">Critical Stock Warnings Active</h4>
            <p className="mt-1 leading-relaxed text-amber-400/90">
              One or more essential laundry chemicals (detergents/softeners) or packaging bags have fallen below standard threshold levels. Please initiate immediate restocking below.
            </p>
          </div>
        </div>
      )}

      {/* Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventory.map((item) => {
          const isLow = item.quantity <= item.threshold;
          const inputVal = restockAmounts[item.id] !== undefined ? restockAmounts[item.id] : 5;

          return (
            <div
              key={item.id}
              className={`glass-card p-5 rounded-2xl flex flex-col justify-between min-h-[220px] border transition ${
                isLow ? 'border-amber-500/20 bg-amber-950/10' : 'border-slate-800'
              }`}
            >
              {/* Item Info */}
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${isLow ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' : 'bg-slate-950/40 text-slate-400 border-slate-800'}`}>
                      <Package2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-5">{item.name}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Last Restocked: {new Date(item.lastRestocked).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Warning Badge */}
                  {isLow && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wide animate-pulse">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Stock Level Counter */}
                <div className="my-5 flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black ${isLow ? 'text-amber-400' : 'text-slate-100'}`}>
                    {item.quantity}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{item.unit}</span>
                  <span className="text-[10px] text-slate-500 ml-2">
                    (Threshold: {item.threshold} {item.unit})
                  </span>
                </div>
              </div>

              {/* Restocking Action Row */}
              <div className="flex items-center gap-3 border-t border-slate-900 pt-3">
                <div className="flex items-center border border-slate-850 bg-slate-950/60 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id, inputVal - 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    value={inputVal}
                    onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-12 text-center text-xs font-bold text-white bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id, inputVal + 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleRestock(item)}
                  disabled={inputVal <= 0}
                  className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Replenish Stock</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
