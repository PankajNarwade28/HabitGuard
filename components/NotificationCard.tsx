import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  emoji?: string;
  title: string;
  message?: string;
  color?: string; // primary color for actions/badge
  gradientColors?: [string, string];
  percentage?: number;
  onPrimary?: () => void;
  primaryLabel?: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export default function NotificationCard({
  emoji,
  title,
  message,
  color = '#2563eb',
  gradientColors = ['#ffffff', '#f3f4f6'],
  percentage,
  onPrimary,
  primaryLabel = 'Primary',
  onSecondary,
  secondaryLabel = 'Secondary',
  onDismiss,
  dismissLabel = 'Dismiss',
}: Props) {
  return (
    <LinearGradient
      colors={gradientColors}
      className="rounded-t-3xl p-6 pb-8"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-3">
            {emoji ? (
              <Text className="text-4xl mr-3">{emoji}</Text>
            ) : null}
            <Text className="text-white text-xl font-bold flex-shrink">
              {title}
            </Text>
          </View>

          {percentage !== undefined ? (
            <View className="mb-3">
              <View className="bg-white/20 h-3 rounded-full overflow-hidden">
                <View
                  className="bg-white h-full rounded-full"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </View>
              <Text className="text-white/90 text-sm font-semibold mt-2">
                {Math.round(percentage)}% of Daily Goal
              </Text>
            </View>
          ) : null}

          {message ? (
            <Text className="text-white/90 text-base leading-6 mb-4">{message}</Text>
          ) : null}
        </View>

        {/* Thin color accent */}
        <View style={{ width: 8, borderRadius: 8, backgroundColor: color }} />
      </View>

      <View className="space-y-3 mt-2">
        {onPrimary ? (
          <Pressable onPress={onPrimary} className="bg-white rounded-2xl p-4 active:opacity-80">
            <Text className="text-center font-semibold" style={{ color }}>
              {primaryLabel}
            </Text>
          </Pressable>
        ) : null}

        {onSecondary ? (
          <Pressable onPress={onSecondary} className="bg-white/20 rounded-2xl p-4 active:opacity-80">
            <Text className="text-white text-center font-semibold">{secondaryLabel}</Text>
          </Pressable>
        ) : null}

        {onDismiss ? (
          <Pressable onPress={onDismiss} className="bg-transparent rounded-2xl p-4 active:opacity-80">
            <Text className="text-white text-center font-medium">{dismissLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
}
