import { create } from "zustand";
import type { FeeStandard } from "@/types";
import { defaultFeeStandard } from "@/types";
import { storage } from "@/utils/storage";

interface FeeStandardState {
  standard: FeeStandard;
  updateStandard: (standard: Partial<FeeStandard>) => void;
  resetStandard: () => void;
}

function loadStandardWithDefaults(): FeeStandard {
  const stored = storage.feeStandard.get<Partial<FeeStandard> | null>(null);
  if (!stored) {
    return defaultFeeStandard;
  }
  return { ...defaultFeeStandard, ...stored };
}

export const useFeeStandardStore = create<FeeStandardState>((set) => ({
  standard: loadStandardWithDefaults(),
  updateStandard: (updates: Partial<FeeStandard>) =>
    set((state) => {
      const newStandard = { ...state.standard, ...updates };
      storage.feeStandard.set(newStandard);
      return { standard: newStandard };
    }),
  resetStandard: () =>
    set(() => {
      storage.feeStandard.set(defaultFeeStandard);
      return { standard: defaultFeeStandard };
    }),
}));
