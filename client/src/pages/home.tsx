import { Link } from "wouter";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/product-grid";

const heroImage = "/assets/products/Black_cashmere_luxury_overcoat_85411d0a.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            ATLANTIC WEIZARD
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light tracking-wide max-w-2xl mx-auto">
            Where timeless elegance meets modern sophistication
          </p>
          <Link href="/shop" data-testid="link-shop-hero">
            <Button 
              size="lg"
              className="bg-primary text-primary-foreground border-2 border-primary tracking-widest uppercase hover-elevate active-elevate-2"
              data-testid="button-explore-collection"
            >
              Explore Collection
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Collection
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Curated pieces that define modern luxury
            </p>
          </div>
          <ProductGrid limit={6} />
          <div className="text-center mt-16">
            <Link href="/shop" data-testid="link-view-all">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary text-foreground uppercase tracking-wider hover-elevate active-elevate-2"
                data-testid="button-view-all"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-card-foreground mb-8">
            The Atlantic Weizard Philosophy
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Born from a passion for impeccable craftsmanship and understated luxury, Atlantic Weizard represents more than fashion—it's a statement of refined taste. Each piece is carefully selected to embody the perfect balance between classic elegance and contemporary edge.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We believe true luxury lies in quality, not quantity. In details, not excess. In pieces that become part of your story, not fleeting trends.
          </p>
        </div>
      </section>
    </div>
  );
}
