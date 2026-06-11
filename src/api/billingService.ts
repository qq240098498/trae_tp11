import type { FeeStandard, QuoteParams, QuoteResult, FeeItem, StorageType, BillingCycle } from "@/types";
import { storageTypeLabels, billingCycleLabels } from "@/types";
import { ok, err } from "./types";
import type { ApiResult } from "./types";
import {
  validateQuoteParams,
  validateFeeStandard,
  validateStorageOverdue,
  validateCompensationAmount,
  getStorageUnitPrice,
  roundCurrency,
} from "./validators";

function calculateStorageFeeServer(
  storageType: StorageType,
  billingCycle: BillingCycle,
  storageDuration: number,
  storageItemCount: number,
  storageStartDate: string | undefined,
  storageEndDate: string | undefined,
  standard: FeeStandard
): FeeItem[] {
  const items: FeeItem[] = [];
  const unitPrice = getStorageUnitPrice(storageType, billingCycle, standard);
  const baseFee = roundCurrency(unitPrice * storageDuration * storageItemCount);

  const cycleUnit = billingCycle === "daily" ? "天" : "月";
  const priceUnit = billingCycle === "daily" ? "天·件" : "月·件";

  items.push({
    name: `${storageTypeLabels[storageType]}仓储费`,
    amount: baseFee,
    description: `${billingCycleLabels[billingCycle]} × ${storageDuration}${cycleUnit} × ${storageItemCount}件 × ${unitPrice}元/${priceUnit}`,
  });

  if (storageStartDate && storageEndDate) {
    const overdueResult = validateStorageOverdue(
      storageType,
      billingCycle,
      storageDuration,
      storageItemCount,
      storageStartDate,
      storageEndDate,
      standard
    );
    if (overdueResult.success && overdueResult.data && overdueResult.data.overdueFee > 0) {
      const { overdueDays, overdueFee } = overdueResult.data;
      const dailyUnitPrice = getStorageUnitPrice(storageType, "daily", standard);
      items.push({
        name: "仓储超期费",
        amount: overdueFee,
        description: `超期${overdueDays}天 × ${storageItemCount}件 × ${dailyUnitPrice}元/天·件 × ${standard.storageOverdueRate}倍费率`,
      });
    }
  }

  return items;
}

export function calculateQuoteApi(
  params: QuoteParams,
  standard: FeeStandard
): ApiResult<QuoteResult> {
  const paramValidation = validateQuoteParams(params);
  if (!paramValidation.success) {
    return err(paramValidation.error!, "INVALID_PARAMS");
  }

  const standardValidation = validateFeeStandard(standard);
  if (!standardValidation.success) {
    return err(standardValidation.error!, "INVALID_STANDARD");
  }

  const items: FeeItem[] = [];

  items.push({
    name: "起步价",
    amount: roundCurrency(standard.basePrice),
    description: "基础服务费用",
  });

  const floorFromFee = params.hasElevatorFrom
    ? params.floorFrom * standard.elevatorFloorFee
    : params.floorFrom * standard.floorFee;
  const floorToFee = params.hasElevatorTo
    ? params.floorTo * standard.elevatorFloorFee
    : params.floorTo * standard.floorFee;
  const totalFloorFee = roundCurrency(floorFromFee + floorToFee);

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
      amount: roundCurrency(extraDistance * standard.distanceFee),
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
      amount: roundCurrency(extraItems * standard.itemFee),
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
      amount: roundCurrency(standard.disassemblyFee),
      description: "家具拆装服务",
    });
  }

  if (params.hasLargeItems && params.largeItemCount > 0) {
    items.push({
      name: "大件物品费",
      amount: roundCurrency(params.largeItemCount * standard.largeItemFee),
      description: `${params.largeItemCount}件大件物品`,
    });
  }

  if (params.isNightService) {
    items.push({
      name: "夜间服务费",
      amount: roundCurrency(standard.nightServiceFee),
      description: "夜间时段搬家服务",
    });
  }

  if (params.needsStorage) {
    const storageItems = calculateStorageFeeServer(
      params.storageType,
      params.billingCycle,
      params.storageDuration,
      params.storageItemCount,
      undefined,
      undefined,
      standard
    );
    items.push(...storageItems);
  }

  const total = roundCurrency(items.reduce((sum, item) => sum + item.amount, 0));

  return ok({ items, total });
}

export function calculateStorageFeeApi(
  params: {
    storageType: StorageType;
    billingCycle: BillingCycle;
    storageDuration: number;
    storageItemCount: number;
    storageStartDate?: string;
    storageEndDate?: string;
  },
  standard: FeeStandard
): ApiResult<{ items: FeeItem[]; total: number }> {
  const standardValidation = validateFeeStandard(standard);
  if (!standardValidation.success) {
    return err(standardValidation.error!, "INVALID_STANDARD");
  }

  if (params.storageDuration < 1) {
    return err("仓储时长至少为1", "INVALID_PARAMS");
  }
  if (params.storageItemCount < 1) {
    return err("仓储物品数量至少为1", "INVALID_PARAMS");
  }

  const items = calculateStorageFeeServer(
    params.storageType,
    params.billingCycle,
    params.storageDuration,
    params.storageItemCount,
    params.storageStartDate,
    params.storageEndDate,
    standard
  );

  const total = roundCurrency(items.reduce((sum, item) => sum + item.amount, 0));
  return ok({ items, total });
}

export function calculateOrderTotalApi(
  params: QuoteParams,
  standard: FeeStandard,
  storageStartDate?: string,
  storageEndDate?: string
): ApiResult<QuoteResult> {
  const quoteResult = calculateQuoteApi(params, standard);
  if (!quoteResult.success) {
    return quoteResult;
  }

  if (params.needsStorage && storageStartDate && storageEndDate) {
    const overdueResult = validateStorageOverdue(
      params.storageType,
      params.billingCycle,
      params.storageDuration,
      params.storageItemCount,
      storageStartDate,
      storageEndDate,
      standard
    );
    if (!overdueResult.success) {
      return err(overdueResult.error!, overdueResult.code!);
    }
    if (overdueResult.data!.overdueFee > 0) {
      const existingOverdue = quoteResult.data!.items.find(i => i.name === "仓储超期费");
      if (!existingOverdue) {
        const dailyUnitPrice = getStorageUnitPrice(params.storageType, "daily", standard);
        const overdueDays = overdueResult.data!.overdueDays;
        quoteResult.data!.items.push({
          name: "仓储超期费",
          amount: overdueResult.data!.overdueFee,
          description: `超期${overdueDays}天 × ${params.storageItemCount}件 × ${dailyUnitPrice}元/天·件 × ${standard.storageOverdueRate}倍费率`,
        });
        quoteResult.data!.total = roundCurrency(
          quoteResult.data!.items.reduce((sum, item) => sum + item.amount, 0)
        );
      }
    }
  }

  return quoteResult;
}

export function validateCompensationApi(
  compensationAmount: number,
  totalEstimatedValue: number
): ApiResult<number> {
  return validateCompensationAmount(compensationAmount, totalEstimatedValue);
}

export function updateFeeStandardApi(
  newStandard: FeeStandard
): ApiResult<FeeStandard> {
  const validation = validateFeeStandard(newStandard);
  if (!validation.success) {
    return err(validation.error!, "VALIDATION_ERROR");
  }
  return ok(newStandard);
}

export function getStoragePriceDisplayApi(
  type: StorageType,
  standard: FeeStandard
): { dailyPrice: number; monthlyPrice: number } {
  return {
    dailyPrice: getStorageUnitPrice(type, "daily", standard),
    monthlyPrice: getStorageUnitPrice(type, "monthly", standard),
  };
}

export function calculateStorageSubtotalApi(
  type: StorageType,
  cycle: BillingCycle,
  duration: number,
  itemCount: number,
  standard: FeeStandard
): number {
  const unitPrice = getStorageUnitPrice(type, cycle, standard);
  return roundCurrency(unitPrice * duration * itemCount);
}
