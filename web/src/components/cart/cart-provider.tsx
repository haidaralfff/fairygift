"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, CustomGiftSelection, Product } from "@/types/domain";

const CART_STORAGE_KEY = "fairygift-cart-v1";

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  totalItems: number;
  totalPrice: number;
  addReadyMade: (product: Product, quantity: number) => void;
  addCustomGift: (
    selection: CustomGiftSelection,
    unitPrice: number,
    quantity?: number,
    replaceCartItemId?: string | null
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore storage error
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage error
    }
  }, [items, hydrated]);

  const addReadyMade = useCallback((product: Product, quantity: number) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.type === "ready_made" && i.productId === product.id
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        const curr = copy[existingIdx]!;
        copy[existingIdx] = {
          ...curr,
          quantity: Math.min(50, curr.quantity + quantity),
          unitPrice: product.price,
        };
        return copy;
      }
      return [
        ...prev,
        {
          cartItemId: `rm-${product.id}-${Date.now()}`,
          type: "ready_made",
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: product.imageUrl,
          unitPrice: product.price,
          quantity,
        },
      ];
    });
  }, []);

  const addCustomGift = useCallback(
    (
      selection: CustomGiftSelection,
      unitPrice: number,
      quantity = 1,
      replaceCartItemId?: string | null
    ) => {
      const newItem: CartItem = {
        cartItemId: replaceCartItemId || `cg-${Date.now()}`,
        type: "custom_gift",
        name: `Kado Custom (${selection.packagingName})`,
        unitPrice,
        quantity,
        customization: selection,
      };
      setItems((prev) => {
        if (replaceCartItemId) {
          const idx = prev.findIndex((i) => i.cartItemId === replaceCartItemId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...newItem, quantity: prev[idx]!.quantity };
            return copy;
          }
        }
        return [...prev, newItem];
      });
    },
    []
  );

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    const safeQty = Math.max(1, Math.min(50, quantity));
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: safeQty } : item
      )
    );
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,
        totalItems,
        totalPrice,
        addReadyMade,
        addCustomGift,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart harus dipakai di dalam CartProvider.");
  }
  return ctx;
}
