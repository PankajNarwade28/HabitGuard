import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { AppIconData } from '../services/UsageStatsService';

interface AppIconProps {
  iconData: AppIconData;
  size?: number;
  defaultColor?: string;
}

export default function AppIcon({ iconData, size = 24, defaultColor = '#6B7280' }: AppIconProps) {
  if (!iconData) {
    return <Ionicons name="phone-portrait" size={size} color={defaultColor} />;
  }

  const { type, name, color } = iconData;
  const iconColor = color || defaultColor;

  switch (type) {
    case 'ionicon':
      return <Ionicons name={name as any} size={size} color={iconColor} />;
    case 'fontawesome':
    case 'material':
    default:
      // For now, fallback to Ionicons. Can add other icon libraries later if needed
      return <Ionicons name={name as any} size={size} color={iconColor} />;
  }
}