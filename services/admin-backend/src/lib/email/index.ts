import { EmailPayload, EmailProviderAdapter } from './types';
import { SmtpProvider } from './providers/smtpProvider';
import prisma from '../../config/database';

class EmailService {
  private adapters: Record<string, EmailProviderAdapter> = {
    smtp: new SmtpProvider(),
    // Initialize other providers here (e.g. brevo, mailgun, gmail)
  };

  /**
   * Main entry point for sending emails from any service.
   * Follows the fallback logic based on priorities.
   */
  async sendEmail(payload: EmailPayload): Promise<boolean> {
    try {
      // 1. Fetch system setting for email routing rules
      const routingSettingStr = await prisma.systemSetting.findUnique({
        where: { key: 'emailRoutingRules' }
      });
      
      let routingRules: Record<string, string> = {};
      if (routingSettingStr?.value) {
        try {
          routingRules = typeof routingSettingStr.value === 'string' 
            ? JSON.parse(routingSettingStr.value) 
            : routingSettingStr.value;
        } catch (e) {
          console.warn('[EmailService] Failed to parse routing rules, proceeding without direct route.', e);
        }
      }

      const assignedProviderName = routingRules[payload.emailCategory];

      // 2. Fetch all active email providers from Integration table
      // In this setup we assume the Integration table stores type='email_provider'
      let activeProviders = await prisma.integration.findMany({
        where: { 
          type: 'email_provider',
          isActive: true
        }
      });
      
      // If no providers configured in DB, try to fallback to environment bootstrap mode
      if (!activeProviders || activeProviders.length === 0) {
        return await this.sendEnvironmentFallback(payload);
      }

      // 3. Build Provider Order
      let providerOrder = [];
      
      if (assignedProviderName) {
        const primary = activeProviders.find(p => p.name === assignedProviderName);
        if (primary) {
          providerOrder.push(primary);
        }
      }

      // Add the rest sorted by priority (if configured in JSON config), or fallback generic sort
      const others = activeProviders.filter(p => p.name !== assignedProviderName);
      
      // Sort by priority assuming config has `priority` field
      others.sort((a, b) => {
        const configA = typeof a.config === 'string' ? JSON.parse(a.config) : a.config as any;
        const configB = typeof b.config === 'string' ? JSON.parse(b.config) : b.config as any;
        const prioA = configA?.priority || 999;
        const prioB = configB?.priority || 999;
        return prioA - prioB;
      });

      providerOrder = [...providerOrder, ...others];

      if (providerOrder.length === 0) {
        throw new Error('No active email providers found and no environment fallback worked.');
      }

      // 4. Send with Failover
      const errors = [];
      for (const provider of providerOrder) {
        try {
          // Determine the sub-type of the provider (e.g. smtp, brevo). Check config first, then default to name/plugin.
          const config = typeof provider.config === 'string' ? JSON.parse(provider.config) : provider.config as any;
          const providerAdapterType = config?.providerType || 'smtp'; // fallback to smtp if not defined
          
          const adapter = this.adapters[providerAdapterType];
          
          if (!adapter) {
            console.warn(`[EmailService] Adapter ${providerAdapterType} not found for provider ${provider.name}`);
            continue;
          }

          console.log(`[EmailService] Attempting to send via ${provider.name} (${providerAdapterType})`);
          const success = await adapter.send(config, payload);
          if (success) {
            return true;
          }
        } catch (error: any) {
          console.error(`[EmailService] Provider ${provider.name} failed:`, error.message);
          errors.push(error);
          // Proceed to next provider
        }
      }

      throw new Error(`All email providers failed. Errors: ${errors.map(e => e.message).join(' | ')}`);

    } catch (e: any) {
      console.error('[EmailService] Fatal send error:', e);
      throw e;
    }
  }

  // STEP 9 — ENVIRONMENT FALLBACK (BOOTSTRAP MODE)
  private async sendEnvironmentFallback(payload: EmailPayload): Promise<boolean> {
    console.log('[EmailService] No DB providers configured. Using ENV fallback.');
    
    if (!process.env.EMAIL_SMTP_HOST) {
      console.warn('[EmailService] EMAIL_SMTP_HOST not set, falling back to console log mode.');
      console.log('--- EMAIL PAYLOAD ---');
      console.dir(payload, { depth: null });
      console.log('---------------------');
      return true;
    }

    const adapter = this.adapters['smtp'];
    const config = {
      smtpHost: process.env.EMAIL_SMTP_HOST,
      smtpPort: process.env.EMAIL_SMTP_PORT,
      smtpUser: process.env.EMAIL_SMTP_USER,
      smtpPass: process.env.EMAIL_SMTP_PASS,
      fromEmail: process.env.DEFAULT_EMAIL_FROM
    };

    return await adapter.send(config, payload);
  }
}

export const emailService = new EmailService();