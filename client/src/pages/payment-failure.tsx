import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";

export default function PaymentFailure() {
  const [, setLocation] = useLocation();
  const [failureDetails, setFailureDetails] = useState<{ orderId?: string; txnid?: string; error?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const txnid = params.get("txnid");
    const error = params.get("error");

    setFailureDetails({ orderId: orderId || undefined, txnid: txnid || undefined, error: error || undefined });
  }, []);

  const getErrorMessage = () => {
    if (failureDetails?.error === "invalid_hash") {
      return "Payment verification failed. This transaction may have been tampered with.";
    }
    if (failureDetails?.error === "processing_error") {
      return "An error occurred while processing your payment.";
    }
    return "Your payment could not be completed. This may be due to insufficient funds, incorrect card details, or a technical issue.";
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Payment Failed
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            {getErrorMessage()}
          </p>

          {failureDetails && failureDetails.orderId && (
            <div className="bg-muted/30 rounded-lg p-6 mb-8 space-y-3">
              {failureDetails.orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono font-medium text-foreground">
                    #{failureDetails.orderId.substring(0, 8).toUpperCase()}
                  </span>
                </div>
              )}
              {failureDetails.txnid && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-sm text-foreground">
                    {failureDetails.txnid}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 text-left mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-foreground font-medium mb-2">What can you do?</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Check your card details and try again</li>
                <li>• Ensure you have sufficient balance</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/checkout")}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => setLocation("/shop")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Your order has been saved. If you need assistance, please contact our customer support.
          </p>
        </Card>
      </div>
    </div>
  );
}
