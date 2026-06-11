import { create } from "zustand";
import type {
  MovingOrder,
  OrderStatus,
  DailyOrderTrend,
  DailyRevenue,
  ServiceTypeStat,
  RegionOrderStat,
  WorkerRankStat,
  ServiceType,
} from "@/types";
import { serviceTypeLabels } from "@/types";
import { storage } from "@/utils/storage";
import { generateOrderId } from "@/utils/calculator";

const MONEY_FIELDS: (keyof MovingOrder)[] = ["totalPrice", "feeBreakdown"];

const DEFAULT_REGIONS = ["朝阳区", "海淀区", "东城区", "西城区", "丰台区", "通州区", "昌平区", "大兴区"];
const DEFAULT_WORKERS = ["张伟", "李强", "王磊", "刘洋", "陈明", "赵刚", "孙鹏", "周涛"];
const SERVICE_TYPES: ServiceType[] = ["standard", "premium", "international", "storage_only", "disassembly_only"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface DuplicateCheckResult {
  
  isDuplicate: boolean;
  duplicateOrders: MovingOrder[];
  reason: string;
}

interface OrdersState {
  orders: MovingOrder[];
  addOrder: (order: Omit<MovingOrder, "id" | "createdAt">) => void;
  updateOrder: (id: string, updates: Partial<MovingOrder>) => void;
  deleteOrder: (id: string) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => MovingOrder | undefined;
  checkDuplicate: (orderData: Omit<MovingOrder, "id" | "createdAt">) => DuplicateCheckResult;
  getStats: () => {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
    todayCount: number;
    todayRevenue: number;
  };
  getDailyOrderTrend: (days: number) => DailyOrderTrend[];
  getDailyRevenue: (days: number) => DailyRevenue[];
  getServiceTypeStats: () => ServiceTypeStat[];
  getRegionOrderStats: () => RegionOrderStat[];
  getWorkerRankStats: () => WorkerRankStat[];
  ensureDemoData: () => void;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function migrateOrders(orders: MovingOrder[]): MovingOrder[] {
  return orders.map((order) => ({
    ...order,
    serviceType: order.serviceType || "standard",
    region: order.region || "未分配",
    workerName: order.workerName || "未分配",
  }));
}

const initialOrders = migrateOrders(storage.orders.get<MovingOrder[]>([]));

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: initialOrders,

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
      const safeUpdates = { ...updates };
      for (const field of MONEY_FIELDS) {
        delete safeUpdates[field];
      }
      const newOrders = state.orders.map((order) =>
        order.id === id ? { ...order, ...safeUpdates } : order
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

  checkDuplicate: (orderData) => {
    const { orders } = get();
    const duplicateOrders: MovingOrder[] = [];

    for (const order of orders) {
      if (order.status === "cancelled") continue;

      const sameCustomer =
        order.customerName.trim() === orderData.customerName.trim() &&
        order.customerPhone.trim() === orderData.customerPhone.trim();

      const sameFloor =
        order.floorFrom === orderData.floorFrom &&
        order.floorTo === orderData.floorTo;

      if (sameCustomer && sameFloor) {
        duplicateOrders.push(order);
      }
    }

    if (duplicateOrders.length > 0) {
      return {
        isDuplicate: true,
        duplicateOrders,
        reason: `已存在相同客户（${orderData.customerName}）且楼层相同（${orderData.floorFrom}层→${orderData.floorTo}层）的订单`,
      };
    }

    return {
      isDuplicate: false,
      duplicateOrders: [],
      reason: "",
    };
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

  getDailyOrderTrend: (days: number) => {
    const { orders } = get();
    const result: DailyOrderTrend[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;
      const count = orders.filter(
        (o) => o.createdAt.split("T")[0] === dateStr
      ).length;
      result.push({ date: displayDate, count });
    }
    return result;
  },

  getDailyRevenue: (days: number) => {
    const { orders } = get();
    const result: DailyRevenue[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;
      const dayOrders = orders.filter(
        (o) => o.createdAt.split("T")[0] === dateStr && o.status === "completed"
      );
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      result.push({ date: displayDate, revenue });
    }
    return result;
  },

  getServiceTypeStats: () => {
    const { orders } = get();
    const stats: Record<string, number> = {};

    for (const type of SERVICE_TYPES) {
      stats[serviceTypeLabels[type]] = 0;
    }

    for (const order of orders) {
      const label = serviceTypeLabels[order.serviceType] || "标准搬家";
      stats[label] = (stats[label] || 0) + 1;
    }

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  },

  getRegionOrderStats: () => {
    const { orders } = get();
    const stats: Record<string, number> = {};

    for (const order of orders) {
      const region = order.region || "未分配";
      stats[region] = (stats[region] || 0) + 1;
    }

    return Object.entries(stats)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  },

  getWorkerRankStats: () => {
    const { orders } = get();
    const stats: Record<string, { orders: number; revenue: number }> = {};

    for (const order of orders) {
      const name = order.workerName || "未分配";
      if (!stats[name]) {
        stats[name] = { orders: 0, revenue: 0 };
      }
      stats[name].orders += 1;
      if (order.status === "completed") {
        stats[name].revenue += order.totalPrice;
      }
    }

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.orders - a.orders);
  },

  ensureDemoData: () => {
    const { orders, addOrder } = get();
    if (orders.length > 20) return;

    const customerNames = [
      "王先生", "李女士", "张先生", "刘女士", "陈先生",
      "赵女士", "孙先生", "周女士", "吴先生", "郑女士",
    ];
    const statuses: OrderStatus[] = ["pending", "confirmed", "in_progress", "completed", "completed", "completed"];

    for (let i = 0; i < 40; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split("T")[0];
      const moveDate = new Date(date);
      moveDate.setDate(moveDate.getDate() + Math.floor(Math.random() * 3));

      addOrder({
        customerName: pickRandom(customerNames),
        customerPhone: `138${Math.floor(10000000 + Math.random() * 89999999)}`,
        fromAddress: `${pickRandom(DEFAULT_REGIONS)}XX路${Math.floor(Math.random() * 200) + 1}号`,
        toAddress: `${pickRandom(DEFAULT_REGIONS)}XX街${Math.floor(Math.random() * 200) + 1}号`,
        moveDate: moveDate.toISOString().split("T")[0],
        floorFrom: Math.floor(Math.random() * 20) + 1,
        floorTo: Math.floor(Math.random() * 20) + 1,
        hasElevatorFrom: Math.random() > 0.5,
        hasElevatorTo: Math.random() > 0.5,
        distance: Math.floor(Math.random() * 30) + 1,
        itemCount: Math.floor(Math.random() * 50) + 5,
        needsDisassembly: Math.random() > 0.6,
        hasLargeItems: Math.random() > 0.5,
        largeItemCount: Math.floor(Math.random() * 5),
        isNightService: Math.random() > 0.85,
        needsStorage: Math.random() > 0.7,
        storageType: "normal",
        billingCycle: "daily",
        storageDuration: Math.floor(Math.random() * 30) + 1,
        storageItemCount: Math.floor(Math.random() * 20),
        storageStartDate: dateStr,
        storageEndDate: dateStr,
        notes: "",
        status: pickRandom(statuses),
        totalPrice: Math.floor(Math.random() * 8000) + 500,
        feeBreakdown: [],
        serviceType: pickRandom(SERVICE_TYPES),
        region: pickRandom(DEFAULT_REGIONS),
        workerName: pickRandom(DEFAULT_WORKERS),
      });
    }
  },
}));
