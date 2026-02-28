/**
 * Maps nav-item `icon` string keys → React icon components.
 * Used by AdminLayoutContent to render nav icons from rbac.ts config.
 */
import React from 'react';
import {
  HomeIcon, DocumentTextIcon, UsersIcon, ChartBarIcon,
  ChatBubbleIcon, MegaphoneIcon, EnvelopeIcon, PhotoIcon,
  CpuChipIcon, CogIcon, CodeBracketIcon, ShieldCheckIcon,
  CurrencyIcon, SparklesIcon, BoltIcon, GlobeIcon, PlusIcon,
  ClockIcon, EyeIcon, ServerIcon, ArrowTrendingUpIcon,
} from '@/components/icons/AdminIcons';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  home:      HomeIcon,
  document:  DocumentTextIcon,
  users:     UsersIcon,
  chart:     ChartBarIcon,
  chat:      ChatBubbleIcon,
  megaphone: MegaphoneIcon,
  envelope:  EnvelopeIcon,
  photo:     PhotoIcon,
  cpu:       CpuChipIcon,
  cog:       CogIcon,
  code:      CodeBracketIcon,
  shield:    ShieldCheckIcon,
  currency:  CurrencyIcon,
  sparkles:  SparklesIcon,
  bolt:      BoltIcon,
  globe:     GlobeIcon,
  plus:      PlusIcon,
  clock:     ClockIcon,
  eye:       EyeIcon,
  server:    ServerIcon,
  trendUp:   ArrowTrendingUpIcon,
};

export function NavIcon({ name, className = 'w-[18px] h-[18px]' }: { name: string; className?: string }) {
  const Icon = iconMap[name];
  if (!Icon) return <DocumentTextIcon className={className} />;
  return <Icon className={className} />;
}

export default NavIcon;
