import { logger } from '../../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SMSOptions {
  to: string;
  message: string;
}

export class NotificationService {
  async sendEmail(options: EmailOptions) {
    // Placeholder for real email provider (e.g., Resend, SendGrid)
    logger.info(`📧 Sending email to ${options.to}: ${options.subject}`);
    // Simulate async operation
    return Promise.resolve({ success: true, messageId: 'msg_123' });
  }

  async sendSMS(options: SMSOptions) {
    // Placeholder for real SMS provider (e.g., Twilio)
    logger.info(`📱 Sending SMS to ${options.to}: ${options.message}`);
    return Promise.resolve({ success: true, sid: 'sms_456' });
  }
}

export const notificationService = new NotificationService();
