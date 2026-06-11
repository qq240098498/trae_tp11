import { useState } from "react";
import {
  Settings,
  DollarSign,
  Building2,
  MapPin,
  Package,
  Wrench,
  Moon,
  Save,
  RotateCcw,
  CheckCircle,
  Warehouse,
  AlertCircle,
} from "lucide-react";
import { useFeeStandardStore } from "@/store/feeStandard";
import { formatCurrency } from "@/utils/calculator";
import { updateFeeStandardApi } from "@/api";
import type { FeeStandard } from "@/types";
import { defaultFeeStandard } from "@/types";

export default function StandardsPage() {
  const { standard, updateStandard, resetStandard } = useFeeStandardStore();
  const [formData, setFormData] = useState<FeeStandard>(standard);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (key: keyof FeeStandard, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setValidationError(null);
  };

  const handleSave = () => {
    const validation = updateFeeStandardApi(formData);
    if (!validation.success) {
      setValidationError(validation.error ?? "验证失败");
      return;
    }
    setValidationError(null);
    updateStandard(validation.data!);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm("确定要恢复默认费用标准吗？")) {
      resetStandard();
      setFormData(defaultFeeStandard);
      setValidationError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const sections = [
    {
      title: "基础费用",
      icon: DollarSign,
      items: [
        {
          key: "basePrice" as const,
          label: "起步价",
          unit: "元",
          description: "基础服务费用",
        },
      ],
    },
    {
      title: "楼层费用",
      icon: Building2,
      items: [
        {
          key: "floorFee" as const,
          label: "无电梯楼层费",
          unit: "元/层",
          description: "无电梯时每层楼搬运费",
        },
        {
          key: "elevatorFloorFee" as const,
          label: "有电梯楼层费",
          unit: "元/层",
          description: "有电梯时每层楼费用",
        },
      ],
    },
    {
      title: "距离费用",
      icon: MapPin,
      items: [
        {
          key: "distanceBase" as const,
          label: "基础距离",
          unit: "公里",
          description: "起步价包含的距离",
        },
        {
          key: "distanceFee" as const,
          label: "超出距离费",
          unit: "元/公里",
          description: "超出基础距离后每公里费用",
        },
      ],
    },
    {
      title: "物品费用",
      icon: Package,
      items: [
        {
          key: "itemBase" as const,
          label: "基础物品数量",
          unit: "件",
          description: "起步价包含的物品数量",
        },
        {
          key: "itemFee" as const,
          label: "超出物品费",
          unit: "元/件",
          description: "超出基础数量后每件费用",
        },
      ],
    },
    {
      title: "附加服务",
      icon: Wrench,
      items: [
        {
          key: "disassemblyFee" as const,
          label: "家具拆装费",
          unit: "元/套",
          description: "整套家具拆装服务",
        },
        {
          key: "largeItemFee" as const,
          label: "大件物品费",
          unit: "元/件",
          description: "冰箱、钢琴等大件搬运",
        },
      ],
    },
    {
      title: "特殊服务",
      icon: Moon,
      items: [
        {
          key: "nightServiceFee" as const,
          label: "夜间服务费",
          unit: "元/次",
          description: "18:00-次日8:00时段",
        },
      ],
    },
    {
      title: "仓储服务",
      icon: Warehouse,
      items: [
        {
          key: "storageNormalDaily" as const,
          label: "常温仓（按天）",
          unit: "元/天·件",
          description: "普通物品日常温仓储",
        },
        {
          key: "storageNormalMonthly" as const,
          label: "常温仓（按月）",
          unit: "元/月·件",
          description: "普通物品月常温仓储",
        },
        {
          key: "storageMoistureProofDaily" as const,
          label: "防潮仓（按天）",
          unit: "元/天·件",
          description: "防潮处理日常仓储",
        },
        {
          key: "storageMoistureProofMonthly" as const,
          label: "防潮仓（按月）",
          unit: "元/月·件",
          description: "防潮处理月仓储",
        },
        {
          key: "storageValuableDaily" as const,
          label: "贵重物品仓（按天）",
          unit: "元/天·件",
          description: "贵重物品专属仓储日结",
        },
        {
          key: "storageValuableMonthly" as const,
          label: "贵重物品仓（按月）",
          unit: "元/月·件",
          description: "贵重物品专属仓储月结",
        },
        {
          key: "storageOverdueRate" as const,
          label: "超期费率倍数",
          unit: "倍",
          description: "超期后费用倍率",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary-600" />
            费用标准
          </h1>
          <p className="text-gray-500 mt-1">设置搬家费用计算标准</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            恢复默认
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">费用标准验证失败</p>
            <p className="text-sm text-red-600 mt-1">{validationError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.title}
            className="card animate-slide-up"
            style={{ animationDelay: `${sectionIndex * 50}ms` }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h2>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      {item.label}
                    </label>
                    <span className="text-xs text-gray-400">{item.unit}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData[item.key]}
                      onChange={(e) =>
                        handleChange(item.key, Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-lg font-semibold text-gray-900"
                      min="0"
                      step={item.unit === "倍" ? "0.1" : "1"}
                    />
                    {!item.unit.includes("倍") && !item.unit.includes("公里") && !item.unit.includes("件") && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        ¥
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">费用示例</h3>
            <p className="text-sm text-gray-500">
              基于当前标准，10公里内、5楼有电梯、20件物品的基础搬家费用
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">预估起价</p>
            <p className="text-3xl font-bold text-accent-600">
              {formatCurrency(
                standard.basePrice + 5 * standard.elevatorFloorFee * 2
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
