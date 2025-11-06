import { projectData } from '@/constants/projectData';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const BANNER_SHOWN_KEY = 'project_banner_shown';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface ProjectInfoBannerProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function ProjectInfoBanner({ 
  visible: externalVisible, 
  onClose: externalOnClose 
}: ProjectInfoBannerProps = {}) {
  const [internalVisible, setInternalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use external props if provided, otherwise use internal state
  const visible = externalVisible !== undefined ? externalVisible : internalVisible;
  const handleClose = externalOnClose || (() => setInternalVisible(false));

  useEffect(() => {
    // Only check first-time display if not externally controlled
    if (externalVisible === undefined) {
      checkFirstTimeDisplay();
    }

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [externalVisible]);

  const checkFirstTimeDisplay = async () => {
    try {
      const hasShown = await AsyncStorage.getItem(BANNER_SHOWN_KEY);
      if (!hasShown) {
        setInternalVisible(true);
        await AsyncStorage.setItem(BANNER_SHOWN_KEY, 'true');
      }
    } catch (error) {
      console.error('Error checking banner status:', error);
    }
  };

  const formatDateTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return currentTime.toLocaleDateString('en-IN', options);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <View style={{ 
          backgroundColor: '#667eea', 
          paddingTop: 40,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: isSmallDevice ? 20 : 24, 
                fontWeight: 'bold', 
                color: '#fff',
                marginBottom: 4,
              }}>
                {projectData.projectName.split('-')[0].trim()}
              </Text>
              <Text style={{ 
                fontSize: isSmallDevice ? 11 : 12, 
                color: 'rgba(255,255,255,0.9)',
              }}>
                {formatDateTime()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: 20, 
                padding: 8,
                marginLeft: 10,
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Institution & Guide Row */}
          <View style={{ 
            flexDirection: 'row', 
            marginBottom: 16,
            gap: 12,
          }}>
            {/* Institution Card */}
            <View style={{ 
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="school" size={16} color="#667eea" />
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600', 
                  color: '#667eea',
                  marginLeft: 6,
                }}>
                  Institution
                </Text>
              </View>
              <Text style={{ 
                fontSize: isSmallDevice ? 10 : 11, 
                color: '#666',
                lineHeight: 16,
              }}>
                {projectData.department}
              </Text>
              <Text style={{ 
                fontSize: isSmallDevice ? 9 : 10, 
                color: '#999',
                marginTop: 2,
              }}>
                Academic Year: {projectData.academicYear}
              </Text>
            </View>

            {/* Guide Card */}
            <View style={{ 
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="person" size={16} color="#667eea" />
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600', 
                  color: '#667eea',
                  marginLeft: 6,
                }}>
                  Project Guide
                </Text>
              </View>
              <Text style={{ 
                fontSize: isSmallDevice ? 10 : 11, 
                color: '#333',
                fontWeight: '600',
              }}>
                {projectData.guide.name}
              </Text>
              <Text style={{ 
                fontSize: isSmallDevice ? 9 : 10, 
                color: '#666',
                lineHeight: 14,
              }}>
                {projectData.guide.designation}
              </Text>
            </View>
          </View>

          {/* Team Members */}
          <View style={{ 
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="people" size={16} color="#667eea" />
              <Text style={{ 
                fontSize: 13, 
                fontWeight: '600', 
                color: '#667eea',
                marginLeft: 6,
              }}>
                Research Team
              </Text>
            </View>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {projectData.teamMembers.map((member: any, index: number) => (
                <View 
                  key={index} 
                  style={{ 
                    width: width > 400 ? '48%' : '100%',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 8,
                    padding: 10,
                    borderLeftWidth: 3,
                    borderLeftColor: '#667eea',
                  }}
                >
                  <Text style={{ 
                    fontSize: isSmallDevice ? 11 : 12, 
                    fontWeight: '600', 
                    color: '#333',
                  }}>
                    {member.name}
                  </Text>
                  <Text style={{ 
                    fontSize: isSmallDevice ? 9 : 10, 
                    color: '#667eea',
                    marginTop: 2,
                  }}>
                    {member.role}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Features & Tech Stack Row */}
          <View style={{ 
            flexDirection: 'row',
            marginBottom: 16,
            gap: 12,
          }}>
            {/* Features */}
            <View style={{ 
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="bulb" size={14} color="#667eea" />
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600', 
                  color: '#667eea',
                  marginLeft: 6,
                }}>
                  Key Features
                </Text>
              </View>
              {projectData.features.slice(0, 4).map((feature, index) => (
                <View 
                  key={index} 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <View style={{ 
                    width: 4, 
                    height: 4, 
                    borderRadius: 2, 
                    backgroundColor: '#667eea',
                    marginRight: 6,
                  }} />
                  <Text style={{ 
                    fontSize: isSmallDevice ? 9 : 10, 
                    color: '#666',
                    flex: 1,
                  }}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Tech Stack */}
            <View style={{ 
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="code-slash" size={14} color="#667eea" />
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600', 
                  color: '#667eea',
                  marginLeft: 6,
                }}>
                  Technology
                </Text>
              </View>
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#333', marginBottom: 2 }}>
                  Frontend
                </Text>
                <Text style={{ fontSize: isSmallDevice ? 9 : 10, color: '#666' }}>
                  {projectData.techStack.frontend.join(', ')}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#333', marginBottom: 2 }}>
                  Backend
                </Text>
                <Text style={{ fontSize: isSmallDevice ? 9 : 10, color: '#666' }}>
                  {projectData.techStack.backend.join(', ')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ 
          backgroundColor: '#fff',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <Text style={{ 
              fontSize: 11, 
              color: '#999',
            }}>
              Version {projectData.version}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{ 
                backgroundColor: '#667eea',
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ 
                color: '#fff', 
                fontSize: 13, 
                fontWeight: '600',
              }}>
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper function to manually trigger the banner (for settings button)
export const showProjectBanner = async () => {
  await AsyncStorage.removeItem(BANNER_SHOWN_KEY);
};
