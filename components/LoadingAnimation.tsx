import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface LoadingAnimationProps {
  text?: string;
  size?: number;
}

/**
 * Reusable circular rotating loader with orbiting dots
 * Based on CSS loader animation pattern
 * 
 * Features:
 * - Central colored circle with rotating shadow dots
 * - 8 dots orbiting in sequence (clockwise)
 * - Smooth 2-second animation loop
 * - Customizable text and size
 * 
 * Usage:
 * <LoadingAnimation text="Loading..." size={28} />
 */
export default function LoadingAnimation({ 
  text = 'Loading...', 
  size = 28 
}: LoadingAnimationProps) {
  const animValues = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Start staggered animations for each dot
    const animations = animValues.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 250), // 250ms delay between each dot (2000ms / 8 dots)
          Animated.timing(anim, {
            toValue: 1,
            duration: 500, // Dot visible for 500ms
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0, // Instant disappear
            useNativeDriver: true,
          }),
          Animated.delay(1500), // Wait for other dots (total cycle = 2000ms)
        ])
      );
    });

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, []);

  const radius = size * 0.57; // 16px for 28px size (maintains ratio)

  // Create 8 dots in circular positions
  const dots = Array.from({ length: 8 }, (_, index) => {
    // Calculate angle for each dot position (start from top, go clockwise)
    const angleOffset = (index / 8) * Math.PI * 2 - Math.PI / 2;

    // Calculate position based on angle
    const x = Math.cos(angleOffset) * radius;
    const y = Math.sin(angleOffset) * radius;

    // Alternate colors between yellow and pink
    const colors = ['#F4DD51', '#E3AAD6'];
    const color = colors[index % 2];

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: animValues[index],
            transform: [
              { translateX: x },
              { translateY: y },
            ],
          },
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      <View style={[styles.loaderContainer, { width: radius * 3, height: radius * 3 }]}>
        {/* Orbiting dots */}
        {dots}
        
        {/* Center dot (red) */}
        <View
          style={[
            styles.centerDot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#F10C49',
            },
          ]}
        />
      </View>
      
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
  },
  centerDot: {
    position: 'absolute',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 24,
    fontWeight: '500',
  },
});
