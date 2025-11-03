import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StudentFloatingButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animation, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        friction: 6,
      }),
      Animated.spring(rotateAnimation, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        friction: 6,
      }),
    ]).start();
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const handleNavigation = (route: string) => {
    setIsOpen(false);
    router.push(route as any);
  };

  const menuItems = [
    {
      id: 1,
      label: 'Student Profile',
      icon: 'person-circle-outline',
      route: '/student/education-setup',
      color: '#3b82f6',
    },
    {
      id: 2,
      label: 'Quizzes',
      icon: 'school-outline',
      route: '/student/quiz-list',
      color: '#8b5cf6',
    },
    {
      id: 3,
      label: 'Courses',
      icon: 'library-outline',
      route: '/student/recommendations',
      color: '#ec4899',
    },
    {
      id: 4,
      label: 'Study Time',
      icon: 'time-outline',
      route: '/student/study-time',
      color: '#f59e0b',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      {menuItems.map((item, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(70 * (index + 1))],
        });

        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.menuItem,
              {
                transform: [{ translateY }, { scale }],
                opacity: animation,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleNavigation(item.route)}
              style={[styles.menuButton, { backgroundColor: item.color }]}
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon as any} size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </Animated.View>
        );
      })}

      {/* Main Floating Button */}
      <TouchableOpacity
        onPress={toggleMenu}
        style={[styles.mainButton, isOpen && styles.mainButtonOpen]}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons
            name={isOpen ? 'close' : 'school'}
            size={32}
            color="#fff"
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Backdrop */}
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  mainButtonOpen: {
    backgroundColor: '#dc2626',
  },
  menuItem: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  menuButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuLabel: {
    position: 'absolute',
    right: 64,
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
});
