export type StorageType = "normal" | "moisture_proof" | "valuable";
export type BillingCycle = "daily" | "monthly";

export const storageTypeLabels: Record<StorageType, string> = {
  normal: "常温仓",
  moisture_proof: "防潮仓",
  valuable: "贵重物品专属仓",
};

export const storageTypeDescriptions: Record<StorageType, string> = {
  normal: "普通物品存储，常温环境",
  moisture_proof: "防潮处理，适合家具、衣物等",
  valuable: "独立仓储空间，24小时监控",
};

export const billingCycleLabels: Record<BillingCycle, string> = {
  daily: "按天计费",
  monthly: "按月计费",
};

export interface FeeStandard {
  basePrice: number;
  floorFee: number;
  elevatorFloorFee: number;
  distanceBase: number;
  distanceFee: number;
  itemBase: number;
  itemFee: number;
  disassemblyFee: number;
  largeItemFee: number;
  nightServiceFee: number;
  storageNormalDaily: number;
  storageNormalMonthly: number;
  storageMoistureProofDaily: number;
  storageMoistureProofMonthly: number;
  storageValuableDaily: number;
  storageValuableMonthly: number;
  storageOverdueRate: number;
}

export interface QuoteParams {
  floorFrom: number;
  floorTo: number;
  hasElevatorFrom: boolean;
  hasElevatorTo: boolean;
  distance: number;
  itemCount: number;
  needsDisassembly: boolean;
  hasLargeItems: boolean;
  largeItemCount: number;
  isNightService: boolean;
  needsStorage: boolean;
  storageType: StorageType;
  billingCycle: BillingCycle;
  storageDuration: number;
  storageItemCount: number;
}

export interface FeeItem {
  name: string;
  amount: number;
  description: string;
}

export interface QuoteResult {
  items: FeeItem[];
  total: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface MovingOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  floorFrom: number;
  floorTo: number;
  hasElevatorFrom: boolean;
  hasElevatorTo: boolean;
  distance: number;
  itemCount: number;
  needsDisassembly: boolean;
  hasLargeItems: boolean;
  largeItemCount: number;
  isNightService: boolean;
  needsStorage: boolean;
  storageType: StorageType;
  billingCycle: BillingCycle;
  storageDuration: number;
  storageItemCount: number;
  storageStartDate: string;
  storageEndDate: string;
  notes: string;
  status: OrderStatus;
  totalPrice: number;
  feeBreakdown: FeeItem[];
  createdAt: string;
}

export const statusLabels: Record<OrderStatus, string> = {
  pending: "待确认",
  confirmed: "已确认",
  in_progress: "进行中",
  completed: "已完成",
  cancelled: "已取消",
};

export const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export const defaultFeeStandard: FeeStandard = {
  basePrice: 300,
  floorFee: 30,
  elevatorFloorFee: 10,
  distanceBase: 10,
  distanceFee: 8,
  itemBase: 20,
  itemFee: 15,
  disassemblyFee: 200,
  largeItemFee: 100,
  nightServiceFee: 150,
  storageNormalDaily: 5,
  storageNormalMonthly: 120,
  storageMoistureProofDaily: 8,
  storageMoistureProofMonthly: 200,
  storageValuableDaily: 15,
  storageValuableMonthly: 400,
  storageOverdueRate: 1.5,
};

export type DamageType = "damage" | "loss";

export type DamageStatus =
  | "pending"
  | "investigating"
  | "approved"
  | "rejected"
  | "compensated";

export type CompensationMethod = "cash" | "bank_transfer" | "wechat" | "alipay" | "other";

export interface DamageItem {
  id: string;
  name: string;
  quantity: number;
  estimatedValue: number;
  damageDegree: "minor" | "moderate" | "severe" | "total_loss";
  description: string;
  photoUrls?: string[];
}

export interface DamageClaim {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  type: DamageType;
  items: DamageItem[];
  totalEstimatedValue: number;
  compensationAmount: number;
  status: DamageStatus;
  reportedBy: string;
  reportDate: string;
  incidentDate: string;
  incidentDescription: string;
  handler?: string;
  handlingNotes?: string;
  handleDate?: string;
  rejectReason?: string;
  rejectDate?: string;
  rejectHandler?: string;
  compensationMethod?: CompensationMethod;
  actualCompensationAmount?: number;
  compensationDate?: string;
  compensationHandler?: string;
  compensationReceipt?: string;
  createdAt: string;
  updatedAt: string;
}

export const compensationMethodLabels: Record<CompensationMethod, string> = {
  cash: "现金",
  bank_transfer: "银行转账",
  wechat: "微信支付",
  alipay: "支付宝",
  other: "其他",
};

export const damageTypeLabels: Record<DamageType, string> = {
  damage: "物品损坏",
  loss: "物品丢失",
};

export const damageStatusLabels: Record<DamageStatus, string> = {
  pending: "待处理",
  investigating: "调查中",
  approved: "已确认",
  rejected: "已驳回",
  compensated: "已赔偿",
};

export const damageStatusColors: Record<DamageStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  investigating: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-gray-100 text-gray-600",
  compensated: "bg-emerald-100 text-emerald-800",
};

export const damageDegreeLabels: Record<DamageItem["damageDegree"], string> = {
  minor: "轻微损坏",
  moderate: "中度损坏",
  severe: "严重损坏",
  total_loss: "完全损坏/丢失",
};

export const damageStatusTransitions: Record<DamageStatus, DamageStatus[]> = {
  pending: ["investigating"],
  investigating: ["pending", "approved", "rejected"],
  approved: ["investigating", "compensated"],
  rejected: [],
  compensated: [],
};

export const damageStatusTransitionLabels: Record<DamageStatus, Record<DamageStatus, string>> = {
  pending: {
    pending: "待处理",
    investigating: "开始调查",
    approved: "确认赔偿",
    rejected: "驳回申请",
    compensated: "完成赔偿",
  },
  investigating: {
    pending: "退回待处理",
    investigating: "调查中",
    approved: "确认赔偿",
    rejected: "驳回申请",
    compensated: "完成赔偿",
  },
  approved: {
    pending: "退回待处理",
    investigating: "重新调查",
    approved: "已确认",
    rejected: "驳回申请",
    compensated: "完成赔偿",
  },
  rejected: {
    pending: "待处理",
    investigating: "调查中",
    approved: "确认赔偿",
    rejected: "已驳回",
    compensated: "完成赔偿",
  },
  compensated: {
    pending: "待处理",
    investigating: "调查中",
    approved: "确认赔偿",
    rejected: "驳回申请",
    compensated: "已赔偿",
  },
};
