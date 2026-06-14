-- SQL Schema for Next.js Laundry Management System (Supabase / PostgreSQL)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers Table (CRM)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    weight DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    extra_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    service_type VARCHAR(100) NOT NULL, -- e.g., 'Wash-Dry-Fold', 'Wash-Dry-Press', 'Dry Clean'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid', -- 'Paid', 'Unpaid', 'Partially Paid'
    order_status VARCHAR(50) NOT NULL DEFAULT 'Received', -- 'Received', 'Washing', 'Drying', 'Folding', 'Ready', 'Completed'
    notes TEXT,
    tracking_qr TEXT,
    has_email_receipt BOOLEAN DEFAULT FALSE,
    has_sms_notification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Table (Financials)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- 'Rent', 'Utilities', 'Supplies', 'Payroll', 'Maintenance', 'Other'
    description TEXT,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table (Supplies)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    unit VARCHAR(50) NOT NULL, -- 'Liters', 'Kilograms', 'Units', 'Boxes'
    threshold DECIMAL(10,2) NOT NULL DEFAULT 0.0, -- Warning trigger level
    last_restocked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Machines Table (Hardware Status)
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- 'Washer A', 'Dryer B'
    type VARCHAR(50) NOT NULL, -- 'Washer', 'Dryer'
    status VARCHAR(50) NOT NULL DEFAULT 'Idle', -- 'Idle', 'Running', 'Out of Service'
    current_cycle VARCHAR(100), -- 'Quick Wash', 'Normal Dry'
    time_remaining INTEGER DEFAULT 0, -- minutes remaining
    last_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
