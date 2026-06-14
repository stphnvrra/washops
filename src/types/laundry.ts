export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loyaltyPoints: number;
  createdAt: string;
}

export type ServiceType = 'Wash-Dry-Fold' | 'Wash-Dry-Press' | 'Dry Clean' | 'Ironing Only';

export type OrderStatus = 'Received' | 'Washing' | 'Drying' | 'Folding' | 'Ready' | 'Completed';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partially Paid';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string; // Derived field for UI list queries
  weight: number;
  basePrice: number;
  extraPrice: number;
  discount: number;
  totalPrice: number;
  serviceType: ServiceType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes: string;
  trackingQr: string;
  hasEmailReceipt: boolean;
  hasSmsNotification: boolean;
  createdAt: string;
}

export type ExpenseCategory = 'Rent' | 'Utilities' | 'Supplies' | 'Payroll' | 'Maintenance' | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // 'Liters', 'Kilograms', 'Pcs'
  threshold: number; // Alert when quantity <= threshold
  lastRestocked: string;
}

export type MachineStatus = 'Idle' | 'Running' | 'Out of Service';
export type MachineType = 'Washer' | 'Dryer';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  currentCycle: string | null;
  timeRemaining: number; // in minutes
  lastMaintenance: string;
}

export interface UserProfile {
  id: string;
  email: string;
  shopName: string;
  fullName: string;
  createdAt: string;
}

