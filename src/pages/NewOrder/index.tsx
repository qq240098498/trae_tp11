import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PlusCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Package,
  Wrench,
  Moon,
  ArrowLeft,
  Check,
  X,
  FileText,
  Calculator,
  Warehouse,
} from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { useFeeStandardStore } from "@/store/feeStandard";
import { formatCurrency } from "@/utils/calculator";
import { calculateOrderTotalApi, getStoragePriceDisplayApi, validateStorageOverdue } from "@/api";
import type { QuoteParams, MovingOrder, FeeItem, StorageType, BillingCycle, ServiceType } from "@/types";
import { storageTypeLabels, storageTypeDescriptions, billingCycleLabels } from "@/types";

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addOrder, checkDuplicate } = useOrdersStore();
  const { standard } = useFeeStandardStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    fromAddress: "",
    toAddress: "",
    moveDate: "",
    notes: "",
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
    storageType: "normal" as StorageType,
    billingCycle: "daily" as BillingCycle,
    storageDuration: 7,
    storageItemCount: 10,
    storageStartDate: "",
    storageEndDate: "",
    status: "pending" as const,
    serviceType: "standard" as ServiceType,
    region: "",
    workerName: "",
  });

  useEffect(() => {
    const quoteParam = searchParams.get("quote");
    if (quoteParam) {
      try {
        const quoteData = JSON.parse(decodeURIComponent(quoteParam)) as QuoteParams;
        setFormData((prev) => ({ ...prev, ...quoteData }));
      } catch (e) {
        console.error("Failed to parse quote data", e);
      }
    }
  }, [searchParams]);

  const quoteResult = useMemo(() => {
    const params: QuoteParams = {
      floorFrom: formData.floorFrom,
      floorTo: formData.floorTo,
      hasElevatorFrom: formData.hasElevatorFrom,
      hasElevatorTo: formData.hasElevatorTo,
      distance: formData.distance,
      itemCount: formData.itemCount,
      needsDisassembly: formData.needsDisassembly,
      hasLargeItems: formData.hasLargeItems,
      largeItemCount: formData.largeItemCount,
      isNightService: formData.isNightService,
      needsStorage: formData.needsStorage,
      storageType: formData.storageType,
      billingCycle: formData.billingCycle,
      storageDuration: formData.storageDuration,
      storageItemCount: formData.storageItemCount,
    };
    const result = calculateOrderTotalApi(
      params,
      standard,
      formData.needsStorage ? formData.storageStartDate : undefined,
      formData.needsStorage ? formData.storageEndDate : undefined
    );
    if (result.success && result.data) {
      return result.data;
    }
    return { items: [], total: 0 };
  }, [formData, standard]);

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!formData.customerName || !formData.customerPhone) {
      alert("请填写客户姓名和电话");
      return;
    }

    const orderData: Omit<MovingOrder, "id" | "createdAt"> = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      fromAddress: formData.fromAddress,
      toAddress: formData.toAddress,
      moveDate: formData.moveDate,
      floorFrom: formData.floorFrom,
      floorTo: formData.floorTo,
      hasElevatorFrom: formData.hasElevatorFrom,
      hasElevatorTo: formData.hasElevatorTo,
      distance: formData.distance,
      itemCount: formData.itemCount,
      needsDisassembly: formData.needsDisassembly,
      hasLargeItems: formData.hasLargeItems,
      largeItemCount: formData.largeItemCount,
      isNightService: formData.isNightService,
      needsStorage: formData.needsStorage,
      storageType: formData.storageType,
      billingCycle: formData.billingCycle,
      storageDuration: formData.storageDuration,
      storageItemCount: formData.storageItemCount,
      storageStartDate: formData.storageStartDate,
      storageEndDate: formData.storageEndDate,
      notes: formData.notes,
      status: formData.status,
      totalPrice: quoteResult.total,
      feeBreakdown: quoteResult.items as FeeItem[],
      serviceType: formData.serviceType,
      region: formData.region || "未分配",
      workerName: formData.workerName || "未分配",
    };

    const duplicateCheck = checkDuplicate(orderData);
    if (duplicateCheck.isDuplicate) {
      const duplicateInfo = duplicateCheck.duplicateOrders
        .map(
          (o) =>
            `  • 订单号：${o.id}，状态：${
              {
                pending: "待确认",
                confirmed: "已确认",
                in_progress: "进行中",
                completed: "已完成",
                cancelled: "已取消",
              }[o.status]
            }，日期：${o.moveDate || "未安排"}`
        )
        .join("\n");

      const confirmed = window.confirm(
        `⚠️ 检测到重复订单\n\n${duplicateCheck.reason}\n\n已有订单：\n${duplicateInfo}\n\n是否仍要创建新订单？`
      );
      if (!confirmed) {
        return;
      }
    }

    addOrder(orderData);
    navigate("/orders");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <PlusCircle className="w-7 h-7 text-primary-600" />
            新建订单
          </h1>
          <p className="text-gray-500 mt-1">登记客户搬家信息</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            step >= 1
              ? "bg-primary-100 text-primary-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
            1
          </span>
          客户信息
        </div>
        <div className="flex-1 h-0.5 bg-gray-200">
          <div
            className={`h-full bg-primary-500 transition-all ${
              step >= 2 ? "w-full" : "w-0"
            }`}
          />
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            step >= 2
              ? "bg-primary-100 text-primary-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
            2
          </span>
          搬家详情
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="card animate-scale-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                基本信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    客户姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    className="input-field"
                    placeholder="请输入客户姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      handleInputChange("customerPhone", e.target.value)
                    }
                    className="input-field"
                    placeholder="请输入联系电话"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    起始地址
                  </label>
                  <input
                    type="text"
                    value={formData.fromAddress}
                    onChange={(e) =>
                      handleInputChange("fromAddress", e.target.value)
                    }
                    className="input-field"
                    placeholder="请输入起始地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    目的地址
                  </label>
                  <input
                    type="text"
                    value={formData.toAddress}
                    onChange={(e) =>
                      handleInputChange("toAddress", e.target.value)
                    }
                    className="input-field"
                    placeholder="请输入目的地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    搬家日期
                  </label>
                  <input
                    type="date"
                    value={formData.moveDate}
                    onChange={(e) =>
                      handleInputChange("moveDate", e.target.value)
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="input-field min-h-24 resize-none"
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center gap-2"
                >
                  下一步
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-scale-in">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-500" />
                  楼层信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">
                        起始楼层
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange(
                            "hasElevatorFrom",
                            !formData.hasElevatorFrom
                          )
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          formData.hasElevatorFrom
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {formData.hasElevatorFrom ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        {formData.hasElevatorFrom ? "有电梯" : "无电梯"}
                      </button>
                    </div>
                    <input
                      type="number"
                      value={formData.floorFrom}
                      onChange={(e) =>
                        handleInputChange("floorFrom", Number(e.target.value))
                      }
                      className="input-field text-center text-xl font-bold"
                      min="0"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">
                        目的楼层
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange(
                            "hasElevatorTo",
                            !formData.hasElevatorTo
                          )
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          formData.hasElevatorTo
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {formData.hasElevatorTo ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        {formData.hasElevatorTo ? "有电梯" : "无电梯"}
                      </button>
                    </div>
                    <input
                      type="number"
                      value={formData.floorTo}
                      onChange={(e) =>
                        handleInputChange("floorTo", Number(e.target.value))
                      }
                      className="input-field text-center text-xl font-bold"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  物品与距离
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      搬运距离 (公里)
                    </label>
                    <input
                      type="number"
                      value={formData.distance}
                      onChange={(e) =>
                        handleInputChange("distance", Number(e.target.value))
                      }
                      className="input-field"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      物品数量 (件)
                    </label>
                    <input
                      type="number"
                      value={formData.itemCount}
                      onChange={(e) =>
                        handleInputChange("itemCount", Number(e.target.value))
                      }
                      className="input-field"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary-500" />
                  附加服务
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.needsDisassembly
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                    onClick={() =>
                      handleInputChange(
                        "needsDisassembly",
                        !formData.needsDisassembly
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.needsDisassembly
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">家具拆装</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(standard.disassemblyFee)}/套
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.hasLargeItems
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                    onClick={() =>
                      handleInputChange("hasLargeItems", !formData.hasLargeItems)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.hasLargeItems
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">大件物品</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(standard.largeItemFee)}/件
                        </p>
                      </div>
                    </div>
                    {formData.hasLargeItems && (
                      <div className="mt-3">
                        <input
                          type="number"
                          value={formData.largeItemCount}
                          onChange={(e) =>
                            handleInputChange(
                              "largeItemCount",
                              Number(e.target.value)
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          min="0"
                          placeholder="大件数量"
                        />
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.isNightService
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                    onClick={() =>
                      handleInputChange("isNightService", !formData.isNightService)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.isNightService
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">夜间服务</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(standard.nightServiceFee)}/次
                        </p>
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
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all mb-4 ${
                    formData.needsStorage
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                  onClick={() =>
                    handleInputChange("needsStorage", !formData.needsStorage)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.needsStorage
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">启用物品临时仓储</p>
                      <p className="text-xs text-gray-500">
                        支持常温仓、防潮仓、贵重物品专属仓
                      </p>
                    </div>
                    {formData.needsStorage && (
                      <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {formData.needsStorage && (
                  <div className="space-y-5 animate-slide-up">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        选择仓储类型
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(["normal", "moisture_proof", "valuable"] as StorageType[]).map(
                          (type) => (
                            <div
                              key={type}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange("storageType", type);
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.storageType === type
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                  {storageTypeLabels[type]}
                                </p>
                                {formData.storageType === type && (
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
                                    {formatCurrency(getStoragePriceDisplayApi(type, standard).dailyPrice)}
                                    /件
                                  </span>
                                </p>
                                <p className="text-gray-600">
                                  按月：
                                  <span className="font-semibold text-primary-600">
                                    {formatCurrency(getStoragePriceDisplayApi(type, standard).monthlyPrice)}
                                    /件
                                  </span>
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        计费方式
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["daily", "monthly"] as BillingCycle[]).map((cycle) => (
                          <div
                            key={cycle}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInputChange("billingCycle", cycle);
                            }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                              formData.billingCycle === cycle
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <p className="font-semibold text-gray-900">
                              {billingCycleLabels[cycle]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          仓储{formData.billingCycle === "daily" ? "天数" : "月数"}
                        </label>
                        <input
                          type="number"
                          value={formData.storageDuration}
                          onChange={(e) =>
                            handleInputChange(
                              "storageDuration",
                              Math.max(1, Number(e.target.value))
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="input-field"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          仓储物品数量 (件)
                        </label>
                        <input
                          type="number"
                          value={formData.storageItemCount}
                          onChange={(e) =>
                            handleInputChange(
                              "storageItemCount",
                              Math.max(1, Number(e.target.value))
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="input-field"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          入仓日期
                        </label>
                        <input
                          type="date"
                          value={formData.storageStartDate}
                          onChange={(e) =>
                            handleInputChange("storageStartDate", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          预计出仓日期
                        </label>
                        <input
                          type="date"
                          value={formData.storageEndDate}
                          onChange={(e) =>
                            handleInputChange("storageEndDate", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="input-field"
                        />
                      </div>
                    </div>

                    {formData.storageStartDate &&
                      formData.storageEndDate &&
                      (() => {
                        const overdueResult = validateStorageOverdue(
                          formData.storageType,
                          formData.billingCycle,
                          formData.storageDuration,
                          formData.storageItemCount,
                          formData.storageStartDate,
                          formData.storageEndDate,
                          standard
                        );
                        if (overdueResult.success && overdueResult.data && overdueResult.data.overdueFee > 0) {
                          const { overdueDays } = overdueResult.data;
                          const plannedDays =
                            formData.billingCycle === "monthly"
                              ? formData.storageDuration * 30
                              : formData.storageDuration;
                          return (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-sm text-orange-700">
                                ⚠️ 超期预警：预计存储 {plannedDays + overdueDays} 天，超出约定{" "}
                                {formData.billingCycle === "daily" ? `${formData.storageDuration} 天` : `${formData.storageDuration} 个月（${plannedDays}天）`}，
                                超期 {overdueDays} 天将按 {standard.storageOverdueRate} 倍费率累加
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <span>←</span>
                  上一步
                </button>
                <button onClick={handleSubmit} className="btn-accent flex-1 py-3 text-lg">
                  确认提交订单
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-accent-500" />
              费用清单
            </h2>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {quoteResult.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-gray-700 text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      item.amount > 0 ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {item.amount > 0 ? formatCurrency(item.amount) : "免费"}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">预估总价</span>
                <span className="text-2xl font-bold text-accent-600">
                  {formatCurrency(quoteResult.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
