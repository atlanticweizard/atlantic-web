import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Lock } from "lucide-react";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getTotal, clearCart, validateCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Validate cart on mount to remove stale products
  useEffect(() => {
    validateCart();
  }, [validateCart]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (checkoutData: CheckoutFormData) => {
      const response = await apiRequest("POST", "/api/payment/initiate", {
        customerInfo: checkoutData,
        items: items,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      console.log("🔍 Payment initiation response received:", data);
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        console.error("❌ Invalid response: data is not an object", data);
        toast({
          title: "Payment Error",
          description: "Invalid response from payment server. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data.paymentUrl) {
        console.error("❌ Missing paymentUrl in response:", data);
        toast({
          title: "Payment Error",
          description: "Payment URL is missing. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      if (!data.formData || typeof data.formData !== 'object') {
        console.error("❌ Invalid or missing formData in response:", data);
        toast({
          title: "Payment Error",
          description: "Payment form data is invalid. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Validation passed. Creating payment form...");
      console.log("  - Payment URL:", data.paymentUrl);
      console.log("  - Form data keys:", Object.keys(data.formData));

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;

      Object.keys(data.formData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data.formData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      console.log("✅ Form created and appended. Submitting to:", data.paymentUrl);
      form.submit();
    },
    onError: (error: any) => {
      console.error("❌ Payment mutation error:", error);
      toast({
        title: "Payment Initiation Failed",
        description: error?.message || "There was an error initiating payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    orderMutation.mutate(data);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Add some items to proceed with checkout.</p>
          <Button onClick={() => setLocation("/shop")} data-testid="button-continue-shopping">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Shipping Information
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-zip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card className="p-6 bg-card/50 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-foreground">Secure Payment</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your payment will be securely processed through PayU payment gateway. We accept credit/debit cards, UPI, net banking, and wallets.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Lock className="h-4 w-4" />
                      <span className="font-medium">256-bit SSL Encrypted & PCI-DSS Compliant</span>
                    </div>
                  </div>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary text-primary-foreground uppercase tracking-wider hover-elevate active-elevate-2"
                  disabled={orderMutation.isPending}
                  data-testid="button-place-order"
                >
                  {orderMutation.isPending ? "Redirecting to Payment..." : "Proceed to Payment"}
                </Button>
              </form>
            </Form>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Order Summary
            </h2>
            <Card className="p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4" data-testid={`order-item-${item.product.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-foreground">
                      ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">₹{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-xl font-semibold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-total">₹{getTotal().toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
