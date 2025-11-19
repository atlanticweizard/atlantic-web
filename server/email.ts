import { Resend } from "resend";
import type { Order } from "@shared/schema";

export class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private enabled: boolean;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || "noreply@atlanticweizard.com";
    this.enabled = false;

    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      try {
        this.resend = new Resend(apiKey);
        this.enabled = true;
        console.log("✅ Email service enabled (Resend)");
      } catch (error) {
        console.warn("⚠️  Email service configuration error:", error);
      }
    } else {
      console.warn("⚠️  Email service disabled - missing configuration");
      console.warn("   Set RESEND_API_KEY environment variable");
    }
  }

  async sendOrderConfirmation(order: Order): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      console.log("📧 Email skipped (service disabled)");
      return false;
    }

    try {
      const itemsList = order.items
        .map(
          (item) =>
            `- ${item.product.name} x ${item.quantity} - ₹${(typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price).toFixed(2)}`
        )
        .join("\n");

      await this.resend.emails.send({
        from: `Atlantic Weizard <${this.fromEmail}>`,
        to: order.customerInfo.email,
        subject: `Order Confirmation - ${order.id}`,
        text: `
Dear ${order.customerInfo.firstName} ${order.customerInfo.lastName},

Thank you for your order at Atlantic Weizard!

Order Details:
--------------
Order ID: ${order.id}
Transaction ID: ${order.transactionId || "N/A"}
Payment Status: ${order.paymentStatus?.toUpperCase() || "PENDING"}
Total Amount: ₹${typeof order.total === "string" ? parseFloat(order.total).toFixed(2) : order.total.toFixed(2)}

Items Ordered:
${itemsList}

Shipping Address:
${order.customerInfo.address}
${order.customerInfo.city}, ${order.customerInfo.zipCode}
${order.customerInfo.country}

Contact: ${order.customerInfo.phone}

We will process your order shortly and send you shipping updates.

Thank you for shopping with Atlantic Weizard!

Best regards,
Atlantic Weizard Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; }
    .order-details { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #d4af37; }
    .items { margin: 15px 0; }
    .item { padding: 10px; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; color: #d4af37; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ATLANTIC WEIZARD</h1>
      <p>Order Confirmation</p>
    </div>
    
    <div class="content">
      <p>Dear ${order.customerInfo.firstName} ${order.customerInfo.lastName},</p>
      <p>Thank you for your order at Atlantic Weizard!</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Transaction ID:</strong> ${order.transactionId || "N/A"}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus?.toUpperCase() || "PENDING"}</p>
        <p class="total">Total Amount: ₹${(typeof order.total === "string" ? parseFloat(order.total) : order.total).toFixed(2)}</p>
      </div>
      
      <div class="items">
        <h3>Items Ordered</h3>
        ${order.items
          .map(
            (item) => `
          <div class="item">
            <strong>${item.product.name}</strong><br>
            Quantity: ${item.quantity} × ₹${(typeof item.product.price === "string" ? parseFloat(item.product.price) : item.product.price).toFixed(2)}
          </div>
        `
          )
          .join("")}
      </div>
      
      <div class="order-details">
        <h3>Shipping Address</h3>
        <p>
          ${order.customerInfo.address}<br>
          ${order.customerInfo.city}, ${order.customerInfo.zipCode}<br>
          ${order.customerInfo.country}<br>
          Phone: ${order.customerInfo.phone}
        </p>
      </div>
      
      <p>We will process your order shortly and send you shipping updates.</p>
      <p>Thank you for shopping with Atlantic Weizard!</p>
    </div>
    
    <div class="footer">
      <p>Atlantic Weizard - Where timeless elegance meets modern sophistication</p>
      <p>https://atlanticweizard.dpdns.org</p>
    </div>
  </div>
</body>
</html>
        `,
      });

      console.log(`✅ Order confirmation email sent to ${order.customerInfo.email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      return false;
    }
  }

  async sendPaymentSuccessEmail(order: Order): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      return false;
    }

    try {
      await this.resend.emails.send({
        from: `Atlantic Weizard <${this.fromEmail}>`,
        to: order.customerInfo.email,
        subject: `Payment Successful - Order ${order.id}`,
        text: `
Dear ${order.customerInfo.firstName},

Your payment has been successfully processed!

Order ID: ${order.id}
Transaction ID: ${order.transactionId}
Amount Paid: ₹${(typeof order.total === "string" ? parseFloat(order.total) : order.total).toFixed(2)}
Payment Method: ${order.paymentMethod || "N/A"}

Your order is now being prepared for shipment.

Thank you for your purchase!

Best regards,
Atlantic Weizard Team
        `,
      });

      console.log(`✅ Payment success email sent to ${order.customerInfo.email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending payment success email:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
