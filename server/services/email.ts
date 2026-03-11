type OrderEmailInput = {
  to: string;
  orderNumber: string;
};

export async function sendOrderConfirmationEmail(input: OrderEmailInput) {
  // Replace with Resend, Postmark, or SES integration in production.
  console.info(`Order confirmation email queued for ${input.to} (${input.orderNumber})`);
}
