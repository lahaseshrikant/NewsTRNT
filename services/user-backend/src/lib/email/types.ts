export type EmailCategory = 
  | 'AUTH_RESET_PASSWORD'
  | 'AUTH_VERIFY_EMAIL'
  | 'NEWSLETTER'
  | 'TRANSACTIONAL'
  | 'SYSTEM';

export interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  emailCategory: EmailCategory;
}

export interface EmailProviderAdapter {
  name: string;
  send: (config: any, payload: Omit<EmailPayload, 'emailCategory'>) => Promise<boolean>;
}
