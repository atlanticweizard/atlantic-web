import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import CartDrawer from "./cart-drawer";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { items } = useCart();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
  ];

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 border-b border-border/50 ${
      scrolled ? "bg-background/98 backdrop-blur-md shadow-lg" : "bg-background/80 backdrop-blur-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground tracking-tight cursor-pointer hover:text-primary transition-all duration-300" style={{ textShadow: '0 0 20px rgba(212, 175, 55, 0.3)' }}>
              ATLANTIC WEIZARD
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase()}`}>
                <span
                  className={`text-sm uppercase tracking-widest cursor-pointer transition-all duration-300 ${
                    location === link.href
                      ? "text-primary font-medium border-b-2 border-primary pb-1"
                      : "text-muted-foreground hover:text-primary hover:shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                  }`}
                  style={location !== link.href ? { textShadow: '0 0 8px rgba(212, 175, 55, 0)' } : {}}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex hover-elevate active-elevate-2">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">{user.username}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex hover-elevate active-elevate-2"
                onClick={() => setLocation("/auth")}
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            <CartDrawer>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover-elevate active-elevate-2"
                data-testid="button-cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs"
                    data-testid="badge-cart-count"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu" className="hover-elevate active-elevate-2">
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`link-mobile-${link.label.toLowerCase()}`}
                    >
                      <span
                        className={`text-lg uppercase tracking-wider cursor-pointer transition-colors ${
                          location === link.href
                            ? "text-primary font-medium"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-border pt-6">
                    {user ? (
                      <>
                        <div className="text-sm text-muted-foreground mb-4">
                          Logged in as <span className="font-medium text-foreground">{user.username}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            logoutMutation.mutate();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setLocation("/auth");
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Login / Sign Up
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
