import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">ATLANTIC WEIZARD</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curating timeless luxury for the modern individual
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" data-testid="link-footer-shop">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    All Products
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/shop" data-testid="link-footer-new">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    New Arrivals
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" data-testid="link-footer-about">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" data-testid="link-footer-shipping">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Shipping Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" data-testid="link-footer-refund">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Refund Policy
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/policies/privacy" data-testid="link-footer-privacy">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" data-testid="link-footer-terms">
                  <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    Terms & Conditions
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Atlantic Weizard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
