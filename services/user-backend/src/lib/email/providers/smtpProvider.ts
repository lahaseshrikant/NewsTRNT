import nodemailer from 'nodemailer';
import { EmailProviderAdapter, EmailPayload } from '@/lib/email/types';

export class SmtpProvider implements EmailProviderAdapter {
  name = 'smtp';

  async send(config: any, payload: Omit<EmailPayload, 'emailCategory'>): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort || '587'),
        secure: parseInt(config.smtpPort || '587') === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: payload.from || config.fromEmail || process.env.DEFAULT_EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });

      console.log(`[SMTP Provider] Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[SMTP Provider] Email sending failed:', error);
      throw error;
    }
  }
}
