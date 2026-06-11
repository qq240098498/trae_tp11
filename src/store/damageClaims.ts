import { create } from "zustand";
import type { DamageClaim, DamageStatus, DamageItem } from "@/types";
import { storage } from "@/utils/storage";
import { generateDamageId } from "@/utils/calculator";

interface DamageClaimsState {
  claims: DamageClaim[];
  addClaim: (claim: Omit<DamageClaim, "id" | "createdAt" | "updatedAt">) => void;
  updateClaim: (id: string, updates: Partial<DamageClaim>) => void;
  deleteClaim: (id: string) => void;
  updateStatus: (id: string, status: DamageStatus, handler?: string, handlingNotes?: string) => void;
  getClaim: (id: string) => DamageClaim | undefined;
  getClaimsByOrderId: (orderId: string) => DamageClaim[];
  getStats: () => {
    total: number;
    pending: number;
    investigating: number;
    approved: number;
    totalCompensation: number;
  };
}

export const useDamageClaimsStore = create<DamageClaimsState>((set, get) => ({
  claims: storage.damageClaims.get<DamageClaim[]>([]),

  addClaim: (claimData) =>
    set((state) => {
      const now = new Date().toISOString();
      const newClaim: DamageClaim = {
        ...claimData,
        id: generateDamageId(),
        createdAt: now,
        updatedAt: now,
      };
      const newClaims = [newClaim, ...state.claims];
      storage.damageClaims.set(newClaims);
      return { claims: newClaims };
    }),

  updateClaim: (id, updates) =>
    set((state) => {
      const newClaims = state.claims.map((claim) =>
        claim.id === id ? { ...claim, ...updates, updatedAt: new Date().toISOString() } : claim
      );
      storage.damageClaims.set(newClaims);
      return { claims: newClaims };
    }),

  deleteClaim: (id) =>
    set((state) => {
      const newClaims = state.claims.filter((claim) => claim.id !== id);
      storage.damageClaims.set(newClaims);
      return { claims: newClaims };
    }),

  updateStatus: (id, status, handler, handlingNotes) =>
    set((state) => {
      const newClaims = state.claims.map((claim) =>
        claim.id === id
          ? {
              ...claim,
              status,
              handler: handler || claim.handler,
              handlingNotes: handlingNotes || claim.handlingNotes,
              handleDate: status === "compensated" ? new Date().toISOString() : claim.handleDate,
              updatedAt: new Date().toISOString(),
            }
          : claim
      );
      storage.damageClaims.set(newClaims);
      return { claims: newClaims };
    }),

  getClaim: (id) => {
    return get().claims.find((claim) => claim.id === id);
  },

  getClaimsByOrderId: (orderId) => {
    return get().claims.filter((claim) => claim.orderId === orderId);
  },

  getStats: () => {
    const { claims } = get();
    const compensatedClaims = claims.filter((claim) => claim.status === "compensated");

    return {
      total: claims.length,
      pending: claims.filter((claim) => claim.status === "pending").length,
      investigating: claims.filter((claim) => claim.status === "investigating").length,
      approved: claims.filter((claim) => claim.status === "approved").length,
      totalCompensation: compensatedClaims.reduce(
        (sum, claim) => sum + claim.compensationAmount,
        0
      ),
    };
  },
}));
