import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// optionally configure a Mailgun SMTP transporter if credentials provided
let mailgunTransport: nodemailer.Transporter | null = null;
if (process.env.MAILGUN_SMTP_USER && process.env.MAILGUN_SMTP_PASS) {
  mailgunTransport = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_HOST || "smtp.mailgun.org",
    port: Number(process.env.MAILGUN_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAILGUN_SMTP_USER,
      pass: process.env.MAILGUN_SMTP_PASS,
    },
  });
}

// order confirmation logic

type OrderEmailInput = {
  to: string;
  orderNumber: string;
};

export async function sendOrderConfirmationEmail(input: OrderEmailInput) {
  const fromAddress = process.env.EMAIL_FROM || "orders@torea.store";

  // prefer Resend if configured
  if (resend) {
    await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: `Your TORÉA order ${input.orderNumber}`,
      html: `<p>Thanks for your purchase! Your order number is ${input.orderNumber}.</p>`,
    });
    return;
  }

  // fallback to Mailgun SMTP when available
  if (mailgunTransport) {
    await mailgunTransport.sendMail({
      from: fromAddress,
      to: input.to,
      subject: `Your TORÉA order ${input.orderNumber}`,
      html: `<p>Thanks for your purchase! Your order number is ${input.orderNumber}.</p>`,
    });
    return;
  }

  console.info(`Order confirmation email queued for ${input.to} (${input.orderNumber})`);
}

export async function sendNewsletterWelcome(to: string) {
  const fromAddress = process.env.EMAIL_FROM || "newsletter@torea.store";

  if (resend) {
    try {
      await resend.emails.send({
        from: fromAddress,
        to,
        subject: "Thanks for subscribing to TORÉA Newsletter",
        html: `
          <p>Hi there,</p>
          <p>Thank you for joining the TORÉA newsletter. We'll keep you updated on new arrivals and exclusive offers.</p>
          <p>Cheers,<br/>The TORÉA Team</p>
        `,
      });
      return;
    } catch (err) {
      console.error("resend email error", err);
    }
  }

  if (mailgunTransport) {
    try {
      await mailgunTransport.sendMail({
        from: fromAddress,
        to,
        subject: "Thanks for subscribing to TORÉA Newsletter",
        html: `
          <p>Hi there,</p>
          <p>Thank you for joining the TORÉA newsletter. We'll keep you updated on new arrivals and exclusive offers.</p>
          <p>Cheers,<br/>The TORÉA Team</p>
        `,
      });
      return;
    } catch (err) {
      console.error("mailgun email error", err);
    }
  }
}
