import { Customer, Order, Expense, InventoryItem, Machine, OrderStatus, MachineStatus } from '@/types/laundry';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';
import { mockCustomers, mockOrders, mockExpenses, mockInventory, mockMachines } from '@/utils/mockData';

// Helper: LocalStorage keys
const KEYS = {
  CUSTOMERS: 'lms_customers',
  ORDERS: 'lms_orders',
  EXPENSES: 'lms_expenses',
  INVENTORY: 'lms_inventory',
  MACHINES: 'lms_machines',
};

// Helper: Safe LocalStorage getter with fallback
function getLocalData<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

// Helper: Safe LocalStorage setter
function setLocalData<T>(key: string, data: T[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const laundryService = {
  // ==========================================
  // CUSTOMERS SERVICES
  // ==========================================
  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Fetching customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase getCustomers error, falling back:', error);
      } else if (data) {
        // Map snake_case database schema to camelCase TypeScript interfaces
        return data.map(item => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          email: item.email,
          address: item.address,
          loyaltyPoints: item.loyalty_points,
          createdAt: item.created_at,
        }));
      }
    }
    
    // Local fallback
    return getLocalData<Customer>(KEYS.CUSTOMERS, mockCustomers);
  },

  async saveCustomer(customer: Customer): Promise<Customer> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Upserting customer...', customer);
      const { data, error } = await supabase
        .from('customers')
        .upsert({
          id: customer.id.startsWith('cust-') ? undefined : customer.id, // Let DB handle UUID generation
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          loyalty_points: customer.loyaltyPoints,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          loyaltyPoints: data.loyalty_points,
          createdAt: data.created_at,
        };
      }
      console.error('Supabase saveCustomer error, falling back:', error);
    }

    // Local fallback
    const list = getLocalData<Customer>(KEYS.CUSTOMERS, mockCustomers);
    const index = list.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.push(customer);
    }
    setLocalData(KEYS.CUSTOMERS, list);
    return customer;
  },

  // ==========================================
  // ORDERS SERVICES
  // ==========================================
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Fetching orders...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getOrders error, falling back:', error);
      } else if (data) {
        return data.map(item => ({
          id: item.id,
          orderNumber: item.order_number,
          customerId: item.customer_id,
          customerName: item.customers?.name || 'Walk-in Customer',
          weight: Number(item.weight),
          basePrice: Number(item.base_price),
          extraPrice: Number(item.extra_price),
          discount: Number(item.discount),
          totalPrice: Number(item.total_price),
          serviceType: item.service_type,
          paymentStatus: item.payment_status,
          orderStatus: item.order_status,
          notes: item.notes || '',
          trackingQr: item.tracking_qr || '',
          hasEmailReceipt: item.has_email_receipt,
          hasSmsNotification: item.has_sms_notification,
          createdAt: item.created_at,
        }));
      }
    }

    // Local fallback
    const orders = getLocalData<Order>(KEYS.ORDERS, mockOrders);
    const customers = getLocalData<Customer>(KEYS.CUSTOMERS, mockCustomers);
    
    // Map customerName for convenience in UI
    return orders.map(ord => ({
      ...ord,
      customerName: customers.find(c => c.id === ord.customerId)?.name || 'Walk-in Customer',
    }));
  },

  async saveOrder(order: Order): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Saving order...', order);
      const dbPayload = {
        order_number: order.orderNumber,
        customer_id: order.customerId,
        weight: order.weight,
        base_price: order.basePrice,
        extra_price: order.extraPrice,
        discount: order.discount,
        total_price: order.totalPrice,
        service_type: order.serviceType,
        payment_status: order.paymentStatus,
        order_status: order.orderStatus,
        notes: order.notes,
        tracking_qr: order.trackingQr,
        has_email_receipt: order.hasEmailReceipt,
        has_sms_notification: order.hasSmsNotification,
      };

      let result;
      if (order.id.startsWith('ord-')) {
        // Mock ID, insert as new
        const { data, error } = await supabase
          .from('orders')
          .insert([dbPayload])
          .select()
          .single();
        result = { data, error };
      } else {
        // Valid UUID, upsert
        const { data, error } = await supabase
          .from('orders')
          .upsert({ id: order.id, ...dbPayload })
          .select()
          .single();
        result = { data, error };
      }

      if (!result.error && result.data) {
        return {
          id: result.data.id,
          orderNumber: result.data.order_number,
          customerId: result.data.customer_id,
          weight: Number(result.data.weight),
          basePrice: Number(result.data.base_price),
          extraPrice: Number(result.data.extra_price),
          discount: Number(result.data.discount),
          totalPrice: Number(result.data.total_price),
          serviceType: result.data.service_type,
          paymentStatus: result.data.payment_status,
          orderStatus: result.data.order_status,
          notes: result.data.notes || '',
          trackingQr: result.data.tracking_qr || '',
          hasEmailReceipt: result.data.has_email_receipt,
          hasSmsNotification: result.data.has_sms_notification,
          createdAt: result.data.created_at,
        };
      }
      console.error('Supabase saveOrder error, falling back:', result.error);
    }

    // Local fallback
    const list = getLocalData<Order>(KEYS.ORDERS, mockOrders);
    const index = list.findIndex(o => o.id === order.id);
    if (index >= 0) {
      list[index] = order;
    } else {
      list.push(order);
    }
    setLocalData(KEYS.ORDERS, list);
    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      console.log(`Supabase: Updating order ${orderId} status to ${status}...`);
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId);

      if (!error) return true;
      console.error('Supabase updateOrderStatus error, falling back:', error);
    }

    // Local fallback
    const list = getLocalData<Order>(KEYS.ORDERS, mockOrders);
    const index = list.findIndex(o => o.id === orderId);
    if (index >= 0) {
      list[index].orderStatus = status;
      setLocalData(KEYS.ORDERS, list);
      return true;
    }
    return false;
  },

  // ==========================================
  // EXPENSES SERVICES
  // ==========================================
  async getExpenses(): Promise<Expense[]> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Fetching expenses...');
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase getExpenses error, falling back:', error);
      } else if (data) {
        return data.map(item => ({
          id: item.id,
          category: item.category,
          description: item.description || '',
          amount: Number(item.amount),
          date: item.date,
          createdAt: item.created_at,
        }));
      }
    }

    return getLocalData<Expense>(KEYS.EXPENSES, mockExpenses);
  },

  async addExpense(expense: Expense): Promise<Expense> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Adding expense...', expense);
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
        }])
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          category: data.category,
          description: data.description || '',
          amount: Number(data.amount),
          date: data.date,
          createdAt: data.created_at,
        };
      }
      console.error('Supabase addExpense error, falling back:', error);
    }

    // Local fallback
    const list = getLocalData<Expense>(KEYS.EXPENSES, mockExpenses);
    list.unshift(expense); // Put new expenses at the front
    setLocalData(KEYS.EXPENSES, list);
    return expense;
  },

  // ==========================================
  // INVENTORY SERVICES
  // ==========================================
  async getInventory(): Promise<InventoryItem[]> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Fetching inventory...');
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase getInventory error, falling back:', error);
      } else if (data) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          quantity: Number(item.quantity),
          unit: item.unit,
          threshold: Number(item.threshold),
          lastRestocked: item.last_restocked,
        }));
      }
    }

    return getLocalData<InventoryItem>(KEYS.INVENTORY, mockInventory);
  },

  async updateInventoryItem(itemId: string, quantity: number): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      console.log(`Supabase: Updating stock for ${itemId} to ${quantity}...`);
      const { error } = await supabase
        .from('inventory')
        .update({ quantity })
        .eq('id', itemId);

      if (!error) return true;
      console.error('Supabase updateInventoryItem error, falling back:', error);
    }

    // Local fallback
    const list = getLocalData<InventoryItem>(KEYS.INVENTORY, mockInventory);
    const index = list.findIndex(i => i.id === itemId);
    if (index >= 0) {
      list[index].quantity = quantity;
      list[index].lastRestocked = new Date().toISOString();
      setLocalData(KEYS.INVENTORY, list);
      return true;
    }
    return false;
  },

  // ==========================================
  // MACHINES SERVICES
  // ==========================================
  async getMachines(): Promise<Machine[]> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase: Fetching machines...');
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase getMachines error, falling back:', error);
      } else if (data) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          status: item.status,
          currentCycle: item.current_cycle,
          timeRemaining: item.time_remaining,
          lastMaintenance: item.last_maintenance,
        }));
      }
    }

    return getLocalData<Machine>(KEYS.MACHINES, mockMachines);
  },

  async updateMachineStatus(
    machineId: string,
    status: MachineStatus,
    currentCycle: string | null = null,
    timeRemaining: number = 0
  ): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      console.log(`Supabase: Updating machine ${machineId} status...`);
      const { error } = await supabase
        .from('machines')
        .update({
          status,
          current_cycle: currentCycle,
          time_remaining: timeRemaining,
        })
        .eq('id', machineId);

      if (!error) return true;
      console.error('Supabase updateMachineStatus error, falling back:', error);
    }

    // Local fallback
    const list = getLocalData<Machine>(KEYS.MACHINES, mockMachines);
    const index = list.findIndex(m => m.id === machineId);
    if (index >= 0) {
      list[index].status = status;
      list[index].currentCycle = currentCycle;
      list[index].timeRemaining = timeRemaining;
      setLocalData(KEYS.MACHINES, list);
      return true;
    }
    return false;
  },
};
