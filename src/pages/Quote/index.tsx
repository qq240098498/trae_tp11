import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Building2,
  MapPin,
  Package,
  Wrench,
  Moon,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Check,
  X,
  Warehouse,
} from "lucide-react";
import { useFeeStandardStore } from "@/store/feeStandard";
import { calculateQuote, formatCurrency } from "@/utils/calculator";
import type { QuoteParams, StorageType, BillingCycle } from "@/types";
import { storageTypeLabels, storageTypeDescriptions, billingCycleLabels } from "@/types";

export default function QuotePage() {
  const navigate = useNavigate();
  const { standard } = useFeeStandardStore();

  const [params, setParams] = useState<QuoteParams>({
    floorFrom: 1,
    floorTo: 1,
    hasElevatorFrom: true,
    hasElevatorTo: true,
    distance: 10,
    itemCount: 15,
    needsDisassembly: false,
    hasLargeItems: false,
    largeItemCount: 0,
    isNightService: false,
    needsStorage: false,
    storageType: "normal",
    billingCycle: "daily",
    storageDuration: 7,
    storageItemCount: 10,
  });

  const quoteResult = useMemo(
    () => calculateQuote(params, standard),
    [params, standard]
  );

  const updateParam = <K extends keyof QuoteParams>(
    key: K,
    value: QuoteParams[K]
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateOrder = () => {
    const quoteData = encodeURIComponent(JSON.stringify(params));
    navigate(`/orders/new?quote=${quoteData}`);
  };

  const FloorSelector = ({
    label,
    value,
    hasElevator,
    onFloorChange,
    onElevatorChange,
  }: {
    label: string;
    value: number;
    hasElevator: boolean;
    onFloorChange: (v: number) => void;
    onElevatorChange: (v: boolean) => void;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-700 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary-500" />
          {label}楼层
        </label>
        <button
          type="button"
          onClick={() => onElevatorChange(!hasElevator)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            hasElevator
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {hasElevator ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {hasElevator ? "有电梯" : "无电梯"}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onFloorChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          <span className="text-gray-500 ml-1">层</span>
        </div>
        <button
          type="button"
          onClick={() => onFloorChange(value + 1)}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="30"
        value={value}
        onChange={(e) => onFloorChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-7 h-7 text-primary-600" />
            报价计算
          </h1>
          <p className="text-gray-500 mt-1">根据搬家参数自动计算费用</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-500" />
              楼层信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FloorSelector
                label="起始地"
                value={params.floorFrom}
                hasElevator={params.hasElevatorFrom}
                onFloorChange={(v) => updateParam("floorFrom", v)}
                onElevatorChange={(v) => updateParam("hasElevatorFrom", v)}
              />
              <FloorSelector
                label="目的地"
                value={params.floorTo}
                hasElevator={params.hasElevatorTo}
                onFloorChange={(v) => updateParam("floorTo", v)}
                onElevatorChange={(v) => updateParam("hasElevatorTo", v)}
              />
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              搬运距离
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">两地距离</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary-600">
                    {params.distance}
                  </span>
                  <span className="text-gray-500">公里</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={params.distance}
                onChange={(e) => updateParam("distance", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>1公里</span>
                <span>
                  基础距离 {standard.distanceBase}公里内免费
                </span>
                <span>100公里</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              物品数量
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">物品件数</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateParam("itemCount", Math.max(1, params.itemCount - 1))
                    }
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <span className="text-lg font-bold text-gray-600">−</span>
                  </button>
                  <span className="text-2xl font-bold text-gray-900 w-16 text-center">
                    {params.itemCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateParam("itemCount", params.itemCount + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <span className="text-lg font-bold text-gray-600">+</span>
                  </button>
                  <span className="text-gray-500">件</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={params.itemCount}
                onChange={(e) =>
                  updateParam("itemCount", Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <p className="text-sm text-gray-400">
                基础数量 {standard.itemBase} 件内免费，超出部分每件加收{" "}
                {formatCurrency(standard.itemFee)}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-500" />
              附加服务
            </h2>
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  params.needsDisassembly
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() =>
                  updateParam("needsDisassembly", !params.needsDisassembly)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        params.needsDisassembly
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">家具拆装</p>
                      <p className="text-sm text-gray-500">
                        床、衣柜等家具拆装服务
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {formatCurrency(standard.disassemblyFee)}
                    </p>
                    <p className="text-xs text-gray-400">整套</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  params.hasLargeItems
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() =>
                  updateParam("hasLargeItems", !params.hasLargeItems)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        params.hasLargeItems
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">大件物品</p>
                      <p className="text-sm text-gray-500">
                        冰箱、洗衣机、钢琴等大件
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {formatCurrency(standard.largeItemFee)}
                    </p>
                    <p className="text-xs text-gray-400">每件</p>
                  </div>
                </div>
                {params.hasLargeItems && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">大件数量</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam(
                              "largeItemCount",
                              Math.max(1, params.largeItemCount - 1)
                            );
                          }}
                          className="w-7 h-7 rounded-md bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <span className="text-sm font-bold">−</span>
                        </button>
                        <span className="w-8 text-center font-bold">
                          {params.largeItemCount}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam(
                              "largeItemCount",
                              params.largeItemCount + 1
                            );
                          }}
                          className="w-7 h-7 rounded-md bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <span className="text-sm font-bold">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  params.isNightService
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() =>
                  updateParam("isNightService", !params.isNightService)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        params.isNightService
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">夜间服务</p>
                      <p className="text-sm text-gray-500">
                        18:00 - 次日8:00 时段搬家
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {formatCurrency(standard.nightServiceFee)}
                    </p>
                    <p className="text-xs text-gray-400">次</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-primary-500" />
              仓储服务
            </h2>
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  params.needsStorage
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() =>
                  updateParam("needsStorage", !params.needsStorage)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        params.needsStorage
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">物品临时仓储</p>
                      <p className="text-sm text-gray-500">
                        支持按天/按月计费，超期自动累加费用
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {params.needsStorage ? "已启用" : "点击启用"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {params.needsStorage
                        ? formatCurrency(
                            (params.billingCycle === "daily"
                              ? params.storageType === "normal"
                                ? standard.storageNormalDaily
                                : params.storageType === "moisture_proof"
                                ? standard.storageMoistureProofDaily
                                : standard.storageValuableDaily
                              : params.storageType === "normal"
                              ? standard.storageNormalMonthly
                              : params.storageType === "moisture_proof"
                              ? standard.storageMoistureProofMonthly
                              : standard.storageValuableMonthly) *
                              params.storageDuration *
                              params.storageItemCount
                          )
                        : "查看详情"}
                    </p>
                  </div>
                </div>
              </div>

              {params.needsStorage && (
                <div className="space-y-5 animate-slide-up">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      选择仓储类型
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(["normal", "moisture_proof", "valuable"] as StorageType[]).map(
                        (type) => {
                          const dailyPrice =
                            type === "normal"
                              ? standard.storageNormalDaily
                              : type === "moisture_proof"
                              ? standard.storageMoistureProofDaily
                              : standard.storageValuableDaily;
                          const monthlyPrice =
                            type === "normal"
                              ? standard.storageNormalMonthly
                              : type === "moisture_proof"
                              ? standard.storageMoistureProofMonthly
                              : standard.storageValuableMonthly;
                          return (
                            <div
                              key={type}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateParam("storageType", type);
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                params.storageType === type
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                  {storageTypeLabels[type]}
                                </p>
                                {params.storageType === type && (
                                  <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                {storageTypeDescriptions[type]}
                              </p>
                              <div className="text-xs space-y-1">
                                <p className="text-gray-600">
                                  按天：
                                  <span className="font-semibold text-primary-600">
                                    {formatCurrency(dailyPrice)}/件
                                  </span>
                                </p>
                                <p className="text-gray-600">
                                  按月：
                                  <span className="font-semibold text-primary-600">
                                    {formatCurrency(monthlyPrice)}/件
                                  </span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      计费方式
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["daily", "monthly"] as BillingCycle[]).map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam("billingCycle", cycle);
                          }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            params.billingCycle === cycle
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-100 hover:border-gray-200 bg-white"
                          }`}
                        >
                          <p className="font-semibold text-gray-900 text-center">
                            {billingCycleLabels[cycle]}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        仓储{params.billingCycle === "daily" ? "天数" : "月数"}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam(
                              "storageDuration",
                              Math.max(1, params.storageDuration - 1)
                            );
                          }}
                          className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <span className="text-lg font-bold">−</span>
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {params.storageDuration}
                          </span>
                          <span className="text-gray-500 ml-1">
                            {params.billingCycle === "daily" ? "天" : "个月"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam(
                              "storageDuration",
                              params.storageDuration + 1
                            );
                          }}
                          className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={params.billingCycle === "daily" ? 180 : 24}
                        value={params.storageDuration}
                        onChange={(e) =>
                          updateParam("storageDuration", Number(e.target.value))
                        }
                        className="w-full h-2 mt-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        仓储物品数量
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam(
                              "storageItemCount",
                              Math.max(1, params.storageItemCount - 1)
                            );
                          }}
                          className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <span className="text-lg font-bold">−</span>
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {params.storageItemCount}
                          </span>
                          <span className="text-gray-500 ml-1">件</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateParam(
                              "storageItemCount",
                              params.storageItemCount + 1
                            );
                          }}
                          className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="200"
                        value={params.storageItemCount}
                        onChange={(e) =>
                          updateParam("storageItemCount", Number(e.target.value))
                        }
                        className="w-full h-2 mt-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">仓储费用小计</p>
                        <p className="text-xs text-gray-400">
                          {storageTypeLabels[params.storageType]} ·{" "}
                          {billingCycleLabels[params.billingCycle]} ·{" "}
                          {params.storageDuration}
                          {params.billingCycle === "daily" ? "天" : "个月"} ×{" "}
                          {params.storageItemCount}件
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-accent-600">
                        {formatCurrency(
                          (params.billingCycle === "daily"
                            ? params.storageType === "normal"
                              ? standard.storageNormalDaily
                              : params.storageType === "moisture_proof"
                              ? standard.storageMoistureProofDaily
                              : standard.storageValuableDaily
                            : params.storageType === "normal"
                            ? standard.storageNormalMonthly
                            : params.storageType === "moisture_proof"
                            ? standard.storageMoistureProofMonthly
                            : standard.storageValuableMonthly) *
                            params.storageDuration *
                            params.storageItemCount
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                      ⚠️ 超期部分按 {standard.storageOverdueRate} 倍费率自动累加
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-accent-500" />
              费用清单
            </h2>
            <div className="space-y-3 mb-6">
              {quoteResult.items.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div>
                    <p className="text-gray-700 font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <span
                    className={`font-semibold ${
                      item.amount > 0 ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {item.amount > 0 ? formatCurrency(item.amount) : "免费"}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">预估总价</span>
                <span className="text-3xl font-bold text-accent-600">
                  {formatCurrency(quoteResult.total)}
                </span>
              </div>
            </div>
            <button
              onClick={handleCreateOrder}
              className="w-full btn-accent flex items-center justify-center gap-2 py-3 text-lg"
            >
              生成订单
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              生成订单后可填写客户详细信息
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
