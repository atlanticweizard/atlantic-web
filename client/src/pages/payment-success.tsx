import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [orderDetails, setOrderDetails] = useState<{ orderId: string; txnid: string } | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const txnid = params.get("txnid");

    if (orderId && txnid) {
      setOrderDetails({ orderId, txnid });
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Payment Successful!
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>

          {orderDetails && (
            <div className="bg-muted/30 rounded-lg p-6 mb-8 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-medium text-foreground">
                  #{orderDetails.orderId.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm text-foreground">
                  {orderDetails.txnid}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">What's next?</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive an order confirmation email shortly with your order details and tracking information.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            If you have any questions about your order, please contact our customer support.
          </p>
        </Card>
      </div>
    </div>
  );
}
