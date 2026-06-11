import { create } from "zustand";
import type { FeeStandard } from "@/types";
import { defaultFeeStandard } from "@/types";
import { storage } from "@/utils/storage";

interface FeeStandardState {
  standard: FeeStandard;
  updateStandard: (standard: Partial<FeeStandard>) => void;
  resetStandard: () => void;
}

export const useFeeStandardStore = create<FeeStandardState>((set) => ({
  standard: storage.feeStandard.get<FeeStandard>(defaultFeeStandard),
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
