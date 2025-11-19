import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { Order } from "@shared/schema";

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my"],
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to view your order history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setLocation("/auth")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>You haven't placed any orders yet</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => setLocation("/shop")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Browse Products
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Order History</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      order.paymentStatus === "success"
                        ? "default"
                        : order.paymentStatus === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {order.paymentStatus === "success"
                      ? "Paid"
                      : order.paymentStatus === "failed"
                      ? "Failed"
                      : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Items</h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ₹{(typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>
                      ₹
                      {typeof order.total === "string"
                        ? parseFloat(order.total).toFixed(2)
                        : order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Info */}
                  {order.transactionId && (
                    <>
                      <Separator />
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-semibold">Transaction ID:</span>{" "}
                          {order.transactionId}
                        </p>
                        {order.paymentMethod && (
                          <p>
                            <span className="font-semibold">Payment Method:</span>{" "}
                            {order.paymentMethod}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Shipping Address */}
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </p>
                      <p>{order.customerInfo.address}</p>
                      <p>
                        {order.customerInfo.city}, {order.customerInfo.zipCode}
                      </p>
                      <p>{order.customerInfo.country}</p>
                      <p>Phone: {order.customerInfo.phone}</p>
                      <p>Email: {order.customerInfo.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
