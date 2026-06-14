'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Order, Expense, InventoryItem, Machine, OrderStatus, PaymentStatus, ServiceType, MachineStatus } from '@/types/laundry';
import { laundryService } from '@/services/laundryService';

interface NotificationToast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

interface LaundryContextType {
  customers: Customer[];
  orders: Order[];
  expenses: Expense[];
  inventory: InventoryItem[];
  machines: Machine[];
  loading: boolean;
  toasts: NotificationToast[];
  
  // Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingQr'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => Promise<boolean>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
  updateInventoryStock: (itemId: string, quantity: number) => Promise<boolean>;
  triggerMachineCycle: (machineId: string, cycleName: string, durationMinutes: number) => Promise<boolean>;
  toggleMachineStatus: (machineId: string, status: MachineStatus) => Promise<boolean>;
  
  // Mock integrations
  sendMockEmail: (orderId: string) => void;
  sendMockSms: (orderId: string) => void;
  showToast: (message: string, type?: NotificationToast['type']) => void;
  dismissToast: (id: string) => void;
}

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

export const LaundryProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [custs, ords, exps, invs, macs] = await Promise.all([
        laundryService.getCustomers(),
        laundryService.getOrders(),
        laundryService.getExpenses(),
        laundryService.getInventory(),
        laundryService.getMachines(),
      ]);
      setCustomers(custs);
      setOrders(ords);
      setExpenses(exps);
      setInventory(invs);
      setMachines(macs);
    } catch (error) {
      console.error('Failed to load laundry data:', error);
      showToast('Error loading business records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadAllData();
  }, []);

  // Timer interval for machine countdown simulation
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setMachines(prevMachines => {
        let changed = false;
        const updated = prevMachines.map(m => {
          if (m.status === 'Running' && m.timeRemaining > 0) {
            changed = true;
            const nextTime = m.timeRemaining - 1;
            if (nextTime === 0) {
              // Cycle finished
              showToast(`Machine alert: ${m.name} finished its cycle!`, 'success');
              
              // Try updating storage status in background
              laundryService.updateMachineStatus(m.id, 'Idle', null, 0);
              return {
                ...m,
                status: 'Idle' as MachineStatus,
                currentCycle: null,
                timeRemaining: 0,
              };
            }
            return { ...m, timeRemaining: nextTime };
          }
          return m;
        });

        // Only update state if timer values changed to prevent unnecessary re-renders
        if (changed) {
          return updated;
        }
        return prevMachines;
      });
    }, 12000); // Speed up for demo: 12 seconds in-app = 1 minute real cycle

    return () => clearInterval(interval);
  }, [mounted]);

  // Toast notifications manager
  const showToast = (message: string, type: NotificationToast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto dismiss after 4.5s
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Actions
  const addCustomer = async (custData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...custData,
    };
    const saved = await laundryService.saveCustomer(newCust);
    setCustomers(prev => [...prev, saved]);
    showToast(`Registered customer: ${saved.name}`, 'success');
    return saved;
  };

  const consumeInventoryForOrder = async (serviceType: ServiceType, weight: number) => {
    // Determine detergent consumption per kg
    let detergentMultiplier = 0.05; // 50ml per kg default
    let softenerMultiplier = 0.03;    // 30ml per kg default

    if (serviceType === 'Dry Clean') {
      detergentMultiplier = 0.02; // uses special solvent mostly
      softenerMultiplier = 0;
    } else if (serviceType === 'Wash-Dry-Press') {
      detergentMultiplier = 0.07;
      softenerMultiplier = 0.05;
    }

    const detergentNeeded = Number((weight * detergentMultiplier).toFixed(2));
    const softenerNeeded = Number((weight * softenerMultiplier).toFixed(2));

    setInventory(prevItems => {
      return prevItems.map(item => {
        let updatedQty = item.quantity;
        if (item.name.toLowerCase().includes('detergent')) {
          updatedQty = Math.max(0, Number((item.quantity - detergentNeeded).toFixed(2)));
          laundryService.updateInventoryItem(item.id, updatedQty);
          if (updatedQty <= item.threshold) {
            showToast(`Low stock warning: ${item.name} is running low!`, 'warning');
          }
        } else if (item.name.toLowerCase().includes('softener') && softenerNeeded > 0) {
          updatedQty = Math.max(0, Number((item.quantity - softenerNeeded).toFixed(2)));
          laundryService.updateInventoryItem(item.id, updatedQty);
          if (updatedQty <= item.threshold) {
            showToast(`Low stock warning: ${item.name} is running low!`, 'warning');
          }
        }
        return { ...item, quantity: updatedQty };
      });
    });
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingQr'>) => {
    const orderNum = `LMS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `ord-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: newId,
      orderNumber: orderNum,
      trackingQr: `/orders/${newId}`,
      createdAt: new Date().toISOString(),
    };

    const saved = await laundryService.saveOrder(newOrder);
    
    // Automatically trigger inventory depletion
    consumeInventoryForOrder(saved.serviceType, saved.weight);

    // Refresh orders list
    const updatedOrders = await laundryService.getOrders();
    setOrders(updatedOrders);
    
    // Increment customer loyalty points
    setCustomers(prevCusts => {
      return prevCusts.map(c => {
        if (c.id === saved.customerId) {
          const updatedPoints = c.loyaltyPoints + Math.floor(saved.weight * 2);
          laundryService.saveCustomer({ ...c, loyaltyPoints: updatedPoints });
          return { ...c, loyaltyPoints: updatedPoints };
        }
        return c;
      });
    });

    showToast(`New Order ${orderNum} created successfully!`, 'success');
    return saved;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const success = await laundryService.updateOrderStatus(orderId, status);
    if (success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
      const order = orders.find(o => o.id === orderId);
      const orderNum = order ? order.orderNumber : '';
      showToast(`Order ${orderNum} status updated to ${status}`, 'info');

      // Auto trigger sms simulation when ready for pickup
      if (status === 'Ready') {
        sendMockSms(orderId);
      }
    }
    return success;
  };

  const updateOrderPaymentStatus = async (orderId: string, status: PaymentStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    const updatedOrder = { ...order, paymentStatus: status };
    const saved = await laundryService.saveOrder(updatedOrder);
    
    setOrders(prev => prev.map(o => o.id === orderId ? saved : o));
    showToast(`Order ${order.orderNumber} payment marked as ${status}`, 'success');
    return true;
  };

  const addExpense = async (expData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...expData,
    };
    const saved = await laundryService.addExpense(newExp);
    setExpenses(prev => [saved, ...prev]);
    showToast(`Recorded Expense: ₱${saved.amount.toLocaleString()} for ${saved.category}`, 'info');
    return saved;
  };

  const updateInventoryStock = async (itemId: string, quantity: number) => {
    const success = await laundryService.updateInventoryItem(itemId, quantity);
    if (success) {
      setInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity, lastRestocked: new Date().toISOString() } : i));
      const item = inventory.find(i => i.id === itemId);
      showToast(`Updated stock of ${item ? item.name : 'item'} to ${quantity}`, 'success');
    }
    return success;
  };

  const triggerMachineCycle = async (machineId: string, cycleName: string, durationMinutes: number) => {
    const success = await laundryService.updateMachineStatus(machineId, 'Running', cycleName, durationMinutes);
    if (success) {
      setMachines(prev => prev.map(m => m.id === machineId ? {
        ...m,
        status: 'Running',
        currentCycle: cycleName,
        timeRemaining: durationMinutes,
      } : m));
      const machine = machines.find(m => m.id === machineId);
      showToast(`Started "${cycleName}" cycle on ${machine ? machine.name : 'machine'}`, 'info');
    }
    return success;
  };

  const toggleMachineStatus = async (machineId: string, status: MachineStatus) => {
    const success = await laundryService.updateMachineStatus(machineId, status, null, 0);
    if (success) {
      setMachines(prev => prev.map(m => m.id === machineId ? {
        ...m,
        status,
        currentCycle: null,
        timeRemaining: 0,
      } : m));
      const machine = machines.find(m => m.id === machineId);
      showToast(`${machine ? machine.name : 'Machine'} is now ${status}`, 'info');
    }
    return success;
  };

  // Mock triggers
  const sendMockEmail = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Update local order state
    const updated = { ...order, hasEmailReceipt: true };
    laundryService.saveOrder(updated);
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));

    showToast(`📧 Mock Email Receipt sent to customer for Order ${order.orderNumber}!`, 'success');
  };

  const sendMockSms = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update local order state
    const updated = { ...order, hasSmsNotification: true };
    laundryService.saveOrder(updated);
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));

    showToast(`📱 Mock SMS Alert sent: "Hello! Your Order ${order.orderNumber} is ready for pickup."`, 'success');
  };

  return (
    <LaundryContext.Provider value={{
      customers,
      orders,
      expenses,
      inventory,
      machines,
      loading,
      toasts,
      
      addCustomer,
      addOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      addExpense,
      updateInventoryStock,
      triggerMachineCycle,
      toggleMachineStatus,
      
      sendMockEmail,
      sendMockSms,
      showToast,
      dismissToast,
    }}>
      {children}
    </LaundryContext.Provider>
  );
};

export const useLaundry = () => {
  const context = useContext(LaundryContext);
  if (!context) {
    throw new Error('useLaundry must be used within a LaundryProvider');
  }
  return context;
};
