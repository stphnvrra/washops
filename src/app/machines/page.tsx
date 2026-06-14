'use client';

import React, { useState } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { Machine, MachineStatus } from '@/types/laundry';
import {
  Cpu,
  Play,
  RotateCw,
  Wrench,
  AlertOctagon,
  Clock,
  CheckCircle,
  ToggleLeft
} from 'lucide-react';

export default function MachinesPage() {
  const { machines, triggerMachineCycle, toggleMachineStatus, showToast } = useLaundry();

  // Cycle start selectors
  const [selectedCycles, setSelectedCycles] = useState<Record<string, string>>({});
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});

  const washerCycles = [
    { name: 'Standard Wash', duration: 35 },
    { name: 'Delicates Eco', duration: 30 },
    { name: 'Heavy Duvet Wash', duration: 50 },
    { name: 'Quick Rinse & Spin', duration: 15 },
  ];

  const dryerCycles = [
    { name: 'Regular Dry (Warm)', duration: 40 },
    { name: 'Turbo High-Temp Dry', duration: 30 },
    { name: 'Gentle Low-Heat Dry', duration: 45 },
  ];

  const handleStartCycle = async (machineId: string, isWasher: boolean) => {
    const defaultCycle = isWasher ? washerCycles[0] : dryerCycles[0];
    const chosenCycleName = selectedCycles[machineId] || defaultCycle.name;
    
    // Lookup duration
    const cyclesList = isWasher ? washerCycles : dryerCycles;
    const cycleInfo = cyclesList.find(c => c.name === chosenCycleName) || defaultCycle;
    
    try {
      await triggerMachineCycle(machineId, cycleInfo.name, cycleInfo.duration);
      showToast(`Triggered ${cycleInfo.name} on machine.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error starting cycle.', 'error');
    }
  };

  const handleCycleSelect = (machineId: string, cycleName: string) => {
    setSelectedCycles(prev => ({ ...prev, [machineId]: cycleName }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Operations Monitor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track active machinery, initiate wash/dry cycles, and record maintenance logs.
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          <span>Simulation Active (12s = 1 min cycle)</span>
        </div>
      </div>

      {/* Machinery Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => {
          const isWasher = machine.type === 'Washer';
          const isRunning = machine.status === 'Running';
          const isIdle = machine.status === 'Idle';
          const isOos = machine.status === 'Out of Service';

          // Calculate cycle completion ratio (standard 40 mins base for visualization)
          const remainingPercent = isRunning 
            ? Math.max(5, Math.min(100, (machine.timeRemaining / 45) * 100)) 
            : 0;

          return (
            <div
              key={machine.id}
              className={`glass-card p-5 rounded-2xl flex flex-col justify-between min-h-[280px] border transition ${
                isRunning ? 'border-sky-500/20' : isOos ? 'border-rose-950/40 opacity-70' : 'border-slate-800'
              }`}
            >
              {/* Header: Machine Name & Status */}
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white leading-5">{machine.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{machine.type} Unit</p>
                  </div>
                  {/* Status Indicator */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${
                    isRunning ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse' :
                    isOos ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isRunning ? 'bg-sky-400 animate-ping' : isOos ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}></span>
                    <span>{machine.status}</span>
                  </span>
                </div>

                {/* Body Details: Timer progress or Cycle config */}
                <div className="my-5 flex-1">
                  {isRunning ? (
                    /* Active Cycle Progress Ring/Bar */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold">{machine.currentCycle}</span>
                        <span className="text-sky-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{machine.timeRemaining}m left</span>
                        </span>
                      </div>
                      {/* Loading progress bar */}
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/60">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${100 - remainingPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : isOos ? (
                    /* Out of Service Info */
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-950/10 border border-rose-900/20 text-rose-300 text-xs">
                      <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                      <p>Requires technician drum alignment audit. Flagged during June service check.</p>
                    </div>
                  ) : (
                    /* Idle Cycle Selection Form */
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Select Preset Cycle
                      </label>
                      <select
                        onChange={(e) => handleCycleSelect(machine.id, e.target.value)}
                        value={selectedCycles[machine.id] || ''}
                        className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500/30"
                      >
                        {(isWasher ? washerCycles : dryerCycles).map(c => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.duration} mins)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex gap-2 border-t border-slate-900 pt-3">
                {isIdle && (
                  <button
                    onClick={() => handleStartCycle(machine.id, isWasher)}
                    className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-lg shadow-sky-500/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Run</span>
                  </button>
                )}
                {isRunning && (
                  <button
                    onClick={() => toggleMachineStatus(machine.id, 'Idle')}
                    className="flex-1 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1"
                  >
                    <span>Emergency Stop</span>
                  </button>
                )}
                <button
                  onClick={() => toggleMachineStatus(machine.id, isOos ? 'Idle' : 'Out of Service')}
                  className={`p-2 rounded-xl border transition flex items-center justify-center ${
                    isOos 
                      ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-900/20' 
                      : 'border-slate-800 bg-slate-950/20 text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                  title={isOos ? 'Mark as Repaired' : 'Flag for Maintenance'}
                >
                  <Wrench className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
