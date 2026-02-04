// User types
export type SubscriptionType = 'weekly' | 'yearly' | null;

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  coins: number;
  subscription_type: SubscriptionType;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Order types
export type OrderStatus = 'pending' | 'completed' | 'failed';
export type OrderType = 'recharge' | 'subscription' | 'task';

export interface Order {
  id: string;
  user_id: string;
  type: OrderType;
  amount: number;
  coins?: number;
  subscription_type?: SubscriptionType;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

// AI Model types
export interface AIModel {
  id: string | number;
  title: string; // 界面显示的标题
  type: string; // text2image, text2video, image2video, image2image
  shortapi: string; // 提供给 short api 的模型名称
  price?: number;
  description?: string;
  parameters?: ModelParameter[];
  active?: boolean;
  created_at?: string;
}

export interface ModelParameter {
  name: string;
  type: string;
  description?: string;
  default?: any;
  required?: boolean;
  enum?: any[];
  min?: number;
  max?: number;
}

// Task types
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Task {
  id: string;
  user_id: string;
  model_id: string;
  type: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video';
  prompt: string;
  status: TaskStatus;
  result_url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

// ShortAPI types
export interface ShortAPIJobResponse {
  job_id: string;
  status: string;
}

export interface ShortAPIJobQueryResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
}
