import type { FeeStandard, QuoteParams, StorageType, BillingCycle } from "@/types";
import { ok, err } from "./types";
import type { ApiResult } from "./types";

const MAX_FLOOR = 99;
const MAX_DISTANCE = 9999;
const MAX_ITEM_COUNT = 9999;
const MAX_STORAGE_DURATION_DAILY = 365;
const MAX_STORAGE_DURATION_MONTHLY = 36;
const MAX_STORAGE_ITEM_COUNT = 9999;
const MAX_LARGE_ITEM_COUNT = 999;
const MAX_UNIT_PRICE = 99999;
const MAX_OVERDUE_RATE = 10;
const MIN_OVERDUE_RATE = 1;

export function validateFeeStandard(standard: FeeStandard): ApiResult<FeeStandard> {
  const errors: string[] = [];

  if (standard.basePrice < 0) errors.push("起步价不能为负数");
  if (standard.basePrice > MAX_UNIT_PRICE) errors.push(`起步价不能超过${MAX_UNIT_PRICE}`);
  if (standard.floorFee < 0) errors.push("无电梯楼层费不能为负数");
  if (standard.floorFee > MAX_UNIT_PRICE) errors.push(`无电梯楼层费不能超过${MAX_UNIT_PRICE}`);
  if (standard.elevatorFloorFee < 0) errors.push("有电梯楼层费不能为负数");
  if (standard.elevatorFloorFee > MAX_UNIT_PRICE) errors.push(`有电梯楼层费不能超过${MAX_UNIT_PRICE}`);
  if (standard.distanceBase < 0) errors.push("基础距离不能为负数");
  if (standard.distanceFee < 0) errors.push("超出距离费不能为负数");
  if (standard.distanceFee > MAX_UNIT_PRICE) errors.push(`超出距离费不能超过${MAX_UNIT_PRICE}`);
  if (standard.itemBase < 0) errors.push("基础物品数量不能为负数");
  if (standard.itemFee < 0) errors.push("超出物品费不能为负数");
  if (standard.itemFee > MAX_UNIT_PRICE) errors.push(`超出物品费不能超过${MAX_UNIT_PRICE}`);
  if (standard.disassemblyFee < 0) errors.push("家具拆装费不能为负数");
  if (standard.disassemblyFee > MAX_UNIT_PRICE) errors.push(`家具拆装费不能超过${MAX_UNIT_PRICE}`);
  if (standard.largeItemFee < 0) errors.push("大件物品费不能为负数");
  if (standard.largeItemFee > MAX_UNIT_PRICE) errors.push(`大件物品费不能超过${MAX_UNIT_PRICE}`);
  if (standard.nightServiceFee < 0) errors.push("夜间服务费不能为负数");
  if (standard.nightServiceFee > MAX_UNIT_PRICE) errors.push(`夜间服务费不能超过${MAX_UNIT_PRICE}`);
  if (standard.storageNormalDaily < 0) errors.push("常温仓按天费不能为负数");
  if (standard.storageNormalMonthly < 0) errors.push("常温仓按月费不能为负数");
  if (standard.storageMoistureProofDaily < 0) errors.push("防潮仓按天费不能为负数");
  if (standard.storageMoistureProofMonthly < 0) errors.push("防潮仓按月费不能为负数");
  if (standard.storageValuableDaily < 0) errors.push("贵重仓按天费不能为负数");
  if (standard.storageValuableMonthly < 0) errors.push("贵重仓按月费不能为负数");
  if (standard.storageOverdueRate < MIN_OVERDUE_RATE) errors.push(`超期费率不能低于${MIN_OVERDUE_RATE}`);
  if (standard.storageOverdueRate > MAX_OVERDUE_RATE) errors.push(`超期费率不能超过${MAX_OVERDUE_RATE}`);

  if (standard.elevatorFloorFee > standard.floorFee) {
    errors.push("有电梯楼层费不应高于无电梯楼层费");
  }

  if (errors.length > 0) {
    return err(errors.join("；"), "VALIDATION_ERROR");
  }

  return ok(standard);
}

export function validateQuoteParams(params: QuoteParams): ApiResult<QuoteParams> {
  const errors: string[] = [];

  if (params.floorFrom < 0) errors.push("起始楼层不能为负数");
  if (params.floorFrom > MAX_FLOOR) errors.push(`起始楼层不能超过${MAX_FLOOR}`);
  if (params.floorTo < 0) errors.push("目的楼层不能为负数");
  if (params.floorTo > MAX_FLOOR) errors.push(`目的楼层不能超过${MAX_FLOOR}`);
  if (params.distance < 1) errors.push("搬运距离至少1公里");
  if (params.distance > MAX_DISTANCE) errors.push(`搬运距离不能超过${MAX_DISTANCE}`);
  if (params.itemCount < 1) errors.push("物品数量至少1件");
  if (params.itemCount > MAX_ITEM_COUNT) errors.push(`物品数量不能超过${MAX_ITEM_COUNT}`);

  if (params.hasLargeItems) {
    if (params.largeItemCount < 1) errors.push("大件物品数量至少1件");
    if (params.largeItemCount > MAX_LARGE_ITEM_COUNT) errors.push(`大件物品数量不能超过${MAX_LARGE_ITEM_COUNT}`);
  }

  if (params.needsStorage) {
    if (!["normal", "moisture_proof", "valuable"].includes(params.storageType)) {
      errors.push("无效的仓储类型");
    }
    if (!["daily", "monthly"].includes(params.billingCycle)) {
      errors.push("无效的计费方式");
    }
    if (params.storageDuration < 1) errors.push("仓储时长至少1");
    const maxDuration = params.billingCycle === "daily" ? MAX_STORAGE_DURATION_DAILY : MAX_STORAGE_DURATION_MONTHLY;
    if (params.storageDuration > maxDuration) errors.push(`仓储时长不能超过${maxDuration}`);
    if (params.storageItemCount < 1) errors.push("仓储物品数量至少1件");
    if (params.storageItemCount > MAX_STORAGE_ITEM_COUNT) errors.push(`仓储物品数量不能超过${MAX_STORAGE_ITEM_COUNT}`);
  }

  if (errors.length > 0) {
    return err(errors.join("；"), "VALIDATION_ERROR");
  }

  return ok(params);
}

export function validateCompensationAmount(
  compensationAmount: number,
  totalEstimatedValue: number
): ApiResult<number> {
  if (compensationAmount < 0) {
    return err("赔偿金额不能为负数", "INVALID_AMOUNT");
  }
  if (compensationAmount > totalEstimatedValue * 3) {
    return err("赔偿金额不能超过预估总价值的3倍", "AMOUNT_EXCEEDS_LIMIT");
  }
  if (compensationAmount > 1000000) {
    return err("单笔赔偿金额不能超过100万元", "AMOUNT_EXCEEDS_LIMIT");
  }
  return ok(compensationAmount);
}

export function validateStorageOverdue(
  storageType: StorageType,
  billingCycle: BillingCycle,
  storageDuration: number,
  storageItemCount: number,
  storageStartDate: string,
  storageEndDate: string,
  standard: FeeStandard
): ApiResult<{ overdueDays: number; overdueFee: number }> {
  if (!storageStartDate || !storageEndDate) {
    return ok({ overdueDays: 0, overdueFee: 0 });
  }

  const start = new Date(storageStartDate);
  const end = new Date(storageEndDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return err("无效的日期格式", "INVALID_DATE");
  }

  if (end <= start) {
    return err("出仓日期必须晚于入仓日期", "INVALID_DATE_RANGE");
  }

  const diffTime = end.getTime() - start.getTime();
  const actualDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const plannedDays = billingCycle === "monthly"
    ? storageDuration * 30
    : storageDuration;

  if (actualDays <= plannedDays) {
    return ok({ overdueDays: 0, overdueFee: 0 });
  }

  const overdueDays = actualDays - plannedDays;
  const priceMap: Record<StorageType, number> = {
    normal: standard.storageNormalDaily,
    moisture_proof: standard.storageMoistureProofDaily,
    valuable: standard.storageValuableDaily,
  };
  const dailyUnitPrice = priceMap[storageType];
  const overdueFee = Math.round(overdueDays * dailyUnitPrice * storageItemCount * standard.storageOverdueRate * 100) / 100;

  if (overdueFee < 0) {
    return err("超期费用计算异常", "CALCULATION_ERROR");
  }

  return ok({ overdueDays, overdueFee });
}

export function getStorageUnitPrice(
  type: StorageType,
  cycle: BillingCycle,
  standard: FeeStandard
): number {
  const priceMap: Record<StorageType, Record<BillingCycle, number>> = {
    normal: {
      daily: standard.storageNormalDaily,
      monthly: standard.storageNormalMonthly,
    },
    moisture_proof: {
      daily: standard.storageMoistureProofDaily,
      monthly: standard.storageMoistureProofMonthly,
    },
    valuable: {
      daily: standard.storageValuableDaily,
      monthly: standard.storageValuableMonthly,
    },
  };
  return priceMap[type]?.[cycle] ?? 0;
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
