import { createContext, useContext, useState, useEffect } from "react";
import type { Product, CartItem } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  validateCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("atlantic-cart");
    if (saved) {
      try {
        const parsedItems = JSON.parse(saved);
        setItems(parsedItems);
        // Validate cart on load
        if (parsedItems.length > 0) {
          validateCartItems(parsedItems);
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("atlantic-cart", JSON.stringify(items));
  }, [items]);

  const validateCartItems = async (itemsToValidate: CartItem[]) => {
    try {
      const response = await apiRequest("GET", "/api/products");
      const products: Product[] = await response.json();
      const validProductIds = new Set(products.map(p => p.id));
      
      const invalidItems = itemsToValidate.filter(item => !validProductIds.has(item.product.id));
      
      if (invalidItems.length > 0) {
        console.warn(`🧹 Removing ${invalidItems.length} stale items from cart`);
        setItems(current => current.filter(item => validProductIds.has(item.product.id)));
      }
    } catch (error) {
      console.error("Failed to validate cart items:", error);
    }
  };

  const validateCart = async () => {
    await validateCartItems(items);
  };

  const addToCart = (product: Product, quantity: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, validateCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
