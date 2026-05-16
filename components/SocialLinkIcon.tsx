'use client';

import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { presetIdFromLabel } from '@/lib/social-links';

const ICON_BY_PRESET: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
  x: Twitter,
  whatsapp: MessageCircle,
};

type SocialLinkIconProps = {
  label: string;
  className?: string;
  strokeWidth?: number;
};

export function SocialLinkIcon({ label, className = 'h-5 w-5', strokeWidth = 1.75 }: SocialLinkIconProps) {
  const preset = presetIdFromLabel(label);
  const Icon = ICON_BY_PRESET[preset] ?? Instagram;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
