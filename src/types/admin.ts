export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalCarOrders: number;
  totalProducts: number;
  pendingOrders: number;
  activeRewards: number;
}

export interface User {
  id: string;
  username: string;
  created_at: string;
  display_name?: string;
  bio?: string;
  profile_display_name?: string;
  phone_number?: string;
  telegram_username?: string;
  profile_picture_url?: string;
  avatar_url?: string;
  age?: number;
  gender?: string;
  relationship_status?: string;
}

export interface OrderItem {
  quantity: number;
  price: number;
  product_name?: string;
  product_type?: string;
  product_image?: string;
}

export interface Order {
  id: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at?: string;
  user_id: string;
  delivery_address?: string;
  // Car order specific fields
  from_location?: string;
  to_location?: string;
  customer_name?: string;
  telegram_username?: string;
  people_count?: number;
  location_type?: string;
  // Regular order fields
  items?: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: string;
  image_url?: string;
  category_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface CashbackCode {
  id: string;
  code: string;
  type: string;
  is_used: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  category_type_id?: string;
  category_types?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export interface CategoryType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}