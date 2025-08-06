import React from 'react';
import Link from 'next/link';
import { getContactByDepartment, siteConfig } from '@/config/site';

interface ContactInfoProps {
  department?: keyof typeof siteConfig.contact.departments | 'general';
  showBusinessHours?: boolean;
  showResponseTime?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  department = 'general',
  showBusinessHours = false,
  showResponseTime = false,
  className = '',
  layout = 'horizontal'
}) => {
  const contactData = department === 'general' 
    ? siteConfig.contact.general 
    : getContactByDepartment(department as keyof typeof siteConfig.contact.departments);

  const responseTime = department !== 'general' 
    ? siteConfig.business.responseTime[department as keyof typeof siteConfig.business.responseTime]
    : siteConfig.business.responseTime.general;

  const layoutClass = layout === 'vertical' ? 'flex-col space-y-2' : 'space-x-6';

  return (
    <div className={`text-center ${className}`}>
      <div className={`flex justify-center text-sm ${layoutClass}`}>
        <Link 
          href={`mailto:${contactData.email}`} 
          className="text-primary hover:text-primary/80 flex items-center space-x-1"
        >
          <span>📧</span>
          <span>{contactData.email}</span>
        </Link>
        <Link 
          href={`tel:${contactData.phone}`} 
          className="text-primary hover:text-primary/80 flex items-center space-x-1"
        >
          <span>📞</span>
          <span>{contactData.phone}</span>
        </Link>
      </div>
      
      {(showBusinessHours || showResponseTime) && (
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          {showResponseTime && (
            <p>Response time: {responseTime}</p>
          )}
          {showBusinessHours && (
            <p>Business hours: {siteConfig.business.businessHours.weekdays}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
