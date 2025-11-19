import { useQuery } from "@tanstack/react-query";
import ProductGrid from "@/components/product-grid";
import type { Product } from "@shared/schema";

export default function Shop() {
  const { error, isError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4" data-testid="text-error-title">Error Loading Products</h2>
          <p className="text-muted-foreground" data-testid="text-error-message">{error?.message || "Failed to load products. Please try again later."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-4" data-testid="text-page-title">
            Shop Collection
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-testid="text-page-subtitle">
            Discover our complete range of meticulously crafted luxury pieces
          </p>
        </div>
        <ProductGrid />
      </div>
    </div>
  );
}
