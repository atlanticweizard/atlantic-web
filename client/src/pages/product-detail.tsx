import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4" data-testid="text-error-not-found">Product Not Found</h2>
          <p className="text-muted-foreground mb-6" data-testid="text-error-message">The product you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = "/shop"} data-testid="button-back-to-shop">Back to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="sticky top-24">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-[3/4] object-cover rounded-md"
              data-testid={`img-product-${product.id}`}
            />
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2" data-testid={`text-category-${product.id}`}>
                {product.category}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid={`text-name-${product.id}`}>
                {product.name}
              </h1>
              <p className="text-3xl font-medium text-primary" data-testid={`text-price-${product.id}`}>
                ₹{parseFloat(product.price).toFixed(2)}
              </p>
            </div>

            <div className="border-t border-b border-border py-6">
              <p className="text-foreground leading-relaxed" data-testid={`text-description-${product.id}`}>
                {product.description}
              </p>
            </div>

            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-wider text-foreground">Quantity</span>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground uppercase tracking-wider hover-elevate active-elevate-2"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </Card>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex justify-between border-b border-border pb-2">
                <span>Free Shipping</span>
                <span className="text-foreground">On orders over ₹500</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span>Returns</span>
                <span className="text-foreground">30-day return policy</span>
              </div>
              <div className="flex justify-between">
                <span>Authenticity</span>
                <span className="text-foreground">100% Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
