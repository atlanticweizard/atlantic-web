import { useRoute } from "wouter";

const policies = {
  privacy: {
    title: "Privacy Policy",
    content: `
      <h2>Information We Collect</h2>
      <p>Atlantic Weizard collects information that you provide directly to us, including when you create an account, place an order, or contact our customer service team. This may include your name, email address, shipping address, phone number, and payment information.</p>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to process your orders, communicate with you about your purchases, improve our services, and provide you with a personalized shopping experience. We may also use your information to send you promotional communications, which you can opt out of at any time.</p>

      <h2>Information Sharing</h2>
      <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential.</p>

      <h2>Security</h2>
      <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>

      <h2>Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at privacy@atlanticweizard.com</p>
    `,
  },
  terms: {
    title: "Terms & Conditions",
    content: `
      <h2>Acceptance of Terms</h2>
      <p>By accessing and using the Atlantic Weizard website, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.</p>

      <h2>Use of Website</h2>
      <p>You agree to use this website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the website.</p>

      <h2>Product Information</h2>
      <p>We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content on this website is accurate, complete, reliable, current, or error-free.</p>

      <h2>Orders and Payment</h2>
      <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice.</p>

      <h2>Intellectual Property</h2>
      <p>All content on this website, including text, graphics, logos, images, and software, is the property of Atlantic Weizard and protected by copyright and other intellectual property laws.</p>

      <h2>Limitation of Liability</h2>
      <p>Atlantic Weizard shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or products.</p>

      <h2>Governing Law</h2>
      <p>These Terms and Conditions are governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>
    `,
  },
  refund: {
    title: "Refund Policy",
    content: `
      <h2>30-Day Return Policy</h2>
      <p>We want you to be completely satisfied with your Atlantic Weizard purchase. If for any reason you're not satisfied, you may return most items within 30 days of delivery for a full refund or exchange.</p>

      <h2>Eligibility</h2>
      <p>To be eligible for a return, items must be unused, unworn, and in their original condition with all tags attached. Items must be returned in their original packaging.</p>

      <h2>Non-Returnable Items</h2>
      <p>Certain items are non-returnable, including:</p>
      <ul>
        <li>Personalized or custom-made items</li>
        <li>Final sale items</li>
        <li>Items marked as non-returnable at time of purchase</li>
      </ul>

      <h2>How to Return</h2>
      <p>To initiate a return, please contact our customer service team at returns@atlanticweizard.com with your order number and reason for return. We will provide you with a return authorization and shipping instructions.</p>

      <h2>Refund Processing</h2>
      <p>Once we receive and inspect your return, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method. Please note that it may take additional time for your bank or credit card company to process the refund.</p>

      <h2>Exchanges</h2>
      <p>If you need a different size or color, we're happy to facilitate an exchange. Please contact our customer service team to arrange an exchange.</p>

      <h2>Damaged or Defective Items</h2>
      <p>If you receive a damaged or defective item, please contact us immediately. We will arrange for a replacement or full refund, including return shipping costs.</p>
    `,
  },
  shipping: {
    title: "Shipping Policy",
    content: `
      <h2>Shipping Methods</h2>
      <p>We offer several shipping options to meet your needs:</p>
      <ul>
        <li><strong>Standard Shipping:</strong> 5-7 business days</li>
        <li><strong>Express Shipping:</strong> 2-3 business days</li>
        <li><strong>Overnight Shipping:</strong> 1 business day</li>
      </ul>

      <h2>Shipping Costs</h2>
      <p>Shipping costs are calculated based on your order total, shipping method, and destination. We offer free standard shipping on all orders over $500.</p>

      <h2>Processing Time</h2>
      <p>Orders are typically processed within 1-2 business days. You will receive a confirmation email with tracking information once your order has shipped.</p>

      <h2>International Shipping</h2>
      <p>We currently ship to select international destinations. International orders may be subject to customs duties and taxes, which are the responsibility of the recipient. Delivery times for international orders vary by destination.</p>

      <h2>Tracking Your Order</h2>
      <p>Once your order ships, you will receive a tracking number via email. You can use this number to track your shipment on the carrier's website.</p>

      <h2>Delivery Issues</h2>
      <p>If your order is delayed or you experience any delivery issues, please contact our customer service team at shipping@atlanticweizard.com for assistance.</p>

      <h2>Signature Requirement</h2>
      <p>For orders over $1,000, we require a signature upon delivery to ensure the security of your purchase.</p>
    `,
  },
};

export default function Policies() {
  const [, params] = useRoute("/policies/:type");
  const policyType = params?.type as keyof typeof policies;
  const policy = policies[policyType];

  if (!policy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Policy Not Found</h2>
          <p className="text-muted-foreground">The policy you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
          {policy.title}
        </h1>
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-foreground space-y-6"
            dangerouslySetInnerHTML={{ __html: policy.content }}
            style={{
              fontSize: '1rem',
              lineHeight: '1.7',
            }}
          />
        </div>
        <style>{`
          .prose h2 {
            font-family: var(--font-serif);
            font-size: 1.75rem;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .prose p {
            color: hsl(var(--muted-foreground));
            margin-bottom: 1rem;
          }
          .prose ul {
            color: hsl(var(--muted-foreground));
            margin-left: 1.5rem;
            margin-bottom: 1rem;
          }
          .prose li {
            margin-bottom: 0.5rem;
          }
          .prose strong {
            color: hsl(var(--foreground));
            font-weight: 600;
          }
        `}</style>
      </div>
    </div>
  );
}
