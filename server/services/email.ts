import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// order confirmation logic

type OrderEmailInput = {
  to: string;
  orderNumber: string;
};

export async function sendOrderConfirmationEmail(input: OrderEmailInput) {
  if (!resend) {
    console.info(`Order confirmation email queued for ${input.to} (${input.orderNumber})`);
    return;
  }
  await resend.emails.send({
    from: "orders@torea.store",
    to: input.to,
    subject: `Your TORÉA order ${input.orderNumber}`,
    html: `<p>Thanks for your purchase! Your order number is ${input.orderNumber}.</p>`,
  });
}

export async function sendNewsletterWelcome(to: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "newsletter@torea.store",
      to,
      subject: "Thanks for subscribing to TORÉA Newsletter",
      html: `
        <p>Hi there,</p>
        <p>Thank you for joining the TORÉA newsletter. We'll keep you updated on new arrivals and exclusive offers.</p>
        <p>Cheers,<br/>The TORÉA Team</p>
      `,
    });
  } catch (err) {
    console.error("resend email error", err);
  }
}
