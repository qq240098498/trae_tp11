import type {
  FeeStandard,
  QuoteParams,
  QuoteResult,
  FeeItem,
  StorageType,
  BillingCycle,
} from "@/types";
import { storageTypeLabels, billingCycleLabels } from "@/types";

function getStorageUnitPrice(
  type: StorageType,
  cycle: BillingCycle,
  standard: FeeStandard
): number {
  const priceMap: Record<StorageType, Record<BillingCycle, number>> = {
    normal: {
      daily: standard.storageNormalDaily ?? 5,
      monthly: standard.storageNormalMonthly ?? 120,
    },
    moisture_proof: {
      daily: standard.storageMoistureProofDaily ?? 8,
      monthly: standard.storageMoistureProofMonthly ?? 200,
    },
    valuable: {
      daily: standard.storageValuableDaily ?? 15,
      monthly: standard.storageValuableMonthly ?? 400,
    },
  };
  return priceMap[type][cycle] || 0;
}

function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function calculateStorageFee(
  params: {
    storageType: StorageType;
    billingCycle: BillingCycle;
    storageDuration: number;
    storageItemCount: number;
    storageStartDate?: string;
    storageEndDate?: string;
  },
  standard: FeeStandard
): { items: FeeItem[]; total: number } {
  const items: FeeItem[] = [];
  const unitPrice = getStorageUnitPrice(params.storageType, params.billingCycle, standard);
  const baseFee = unitPrice * params.storageDuration * params.storageItemCount;

  items.push({
    name: `${storageTypeLabels[params.storageType]}仓储费`,
    amount: baseFee,
    description: `${billingCycleLabels[params.billingCycle]} × ${params.storageDuration}${params.billingCycle === "daily" ? "天" : "月"} × ${params.storageItemCount}件 × ${unitPrice}元/${params.billingCycle === "daily" ? "天·件" : "月·件"}`,
  });

  let overdueDays = 0;
  if (params.storageStartDate && params.storageEndDate) {
    const actualDays = calculateDaysBetween(params.storageStartDate, params.storageEndDate);
    const plannedDays = params.billingCycle === "monthly" 
      ? params.storageDuration * 30 
      : params.storageDuration;
    
    if (actualDays > plannedDays) {
      overdueDays = actualDays - plannedDays;
      const dailyUnitPrice = getStorageUnitPrice(params.storageType, "daily", standard);
      const overdueFee = overdueDays * dailyUnitPrice * params.storageItemCount * standard.storageOverdueRate;
      
      items.push({
        name: "仓储超期费",
        amount: overdueFee,
        description: `超期${overdueDays}天 × ${params.storageItemCount}件 × ${dailyUnitPrice}元/天·件 × ${standard.storageOverdueRate}倍费率`,
      });
    }
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { items, total };
}

export function calculateQuote(
  params: QuoteParams,
  standard: FeeStandard
): QuoteResult {
  const items: FeeItem[] = [];

  items.push({
    name: "起步价",
    amount: standard.basePrice,
    description: "基础服务费用",
  });

  const floorFromFee = params.hasElevatorFrom
    ? params.floorFrom * standard.elevatorFloorFee
    : params.floorFrom * standard.floorFee;
  const floorToFee = params.hasElevatorTo
    ? params.floorTo * standard.elevatorFloorFee
    : params.floorTo * standard.floorFee;
  const totalFloorFee = floorFromFee + floorToFee;

  if (totalFloorFee > 0) {
    items.push({
      name: "楼层费",
      amount: totalFloorFee,
      description: `起始${params.floorFrom}层(${params.hasElevatorFrom ? "有电梯" : "无电梯"}) + 目的${params.floorTo}层(${params.hasElevatorTo ? "有电梯" : "无电梯"})`,
    });
  }

  if (params.distance > standard.distanceBase) {
    const extraDistance = params.distance - standard.distanceBase;
    items.push({
      name: "距离费",
      amount: extraDistance * standard.distanceFee,
      description: `超出${standard.distanceBase}公里部分，共${extraDistance}公里`,
    });
  } else {
    items.push({
      name: "距离费",
      amount: 0,
      description: `${params.distance}公里（含在起步价内）`,
    });
  }

  if (params.itemCount > standard.itemBase) {
    const extraItems = params.itemCount - standard.itemBase;
    items.push({
      name: "物品费",
      amount: extraItems * standard.itemFee,
      description: `超出${standard.itemBase}件部分，共${extraItems}件`,
    });
  } else {
    items.push({
      name: "物品费",
      amount: 0,
      description: `${params.itemCount}件（含在起步价内）`,
    });
  }

  if (params.needsDisassembly) {
    items.push({
      name: "拆装费",
      amount: standard.disassemblyFee,
      description: "家具拆装服务",
    });
  }

  if (params.hasLargeItems && params.largeItemCount > 0) {
    items.push({
      name: "大件物品费",
      amount: params.largeItemCount * standard.largeItemFee,
      description: `${params.largeItemCount}件大件物品`,
    });
  }

  if (params.isNightService) {
    items.push({
      name: "夜间服务费",
      amount: standard.nightServiceFee,
      description: "夜间时段搬家服务",
    });
  }

  if (params.needsStorage) {
    const storageResult = calculateStorageFee(
      {
        storageType: params.storageType,
        billingCycle: params.billingCycle,
        storageDuration: params.storageDuration,
        storageItemCount: params.storageItemCount,
      },
      standard
    );
    items.push(...storageResult.items);
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, total };
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `BJ${year}${month}${day}${random}`;
}

export function generateDamageId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `DM${year}${month}${day}${random}`;
}
