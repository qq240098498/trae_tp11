import { create } from "zustand";
import type { MovingOrder, OrderStatus } from "@/types";
import { storage } from "@/utils/storage";
import { generateOrderId } from "@/utils/calculator";

interface OrdersState {
  orders: MovingOrder[];
  addOrder: (order: Omit<MovingOrder, "id" | "createdAt">) => void;
  updateOrder: (id: string, updates: Partial<MovingOrder>) => void;
  deleteOrder: (id: string) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => MovingOrder | undefined;
  getStats: () => {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
    todayCount: number;
    todayRevenue: number;
  };
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: storage.orders.get<MovingOrder[]>([]),

  addOrder: (orderData) =>
    set((state) => {
      const newOrder: MovingOrder = {
        ...orderData,
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
      };
      const newOrders = [newOrder, ...state.orders];
      storage.orders.set(newOrders);
      return { orders: newOrders };
    }),

  updateOrder: (id, updates) =>
    set((state) => {
      const newOrders = state.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      );
      storage.orders.set(newOrders);
      return { orders: newOrders };
    }),

  deleteOrder: (id) =>
    set((state) => {
      const newOrders = state.orders.filter((order) => order.id !== id);
      storage.orders.set(newOrders);
      return { orders: newOrders };
    }),

  updateStatus: (id, status) =>
    set((state) => {
      const newOrders = state.orders.map((order) =>
        order.id === id ? { ...order, status } : order
      );
      storage.orders.set(newOrders);
      return { orders: newOrders };
    }),

  getOrder: (id) => {
    return get().orders.find((order) => order.id === id);
  },

  getStats: () => {
    const { orders } = get();
    const today = getTodayString();
    const todayOrders = orders.filter(
      (order) => order.createdAt.split("T")[0] === today
    );
    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    );

    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      completed: completedOrders.length,
      revenue: completedOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      ),
      todayCount: todayOrders.length,
      todayRevenue: todayOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      ),
    };
  },
}));
