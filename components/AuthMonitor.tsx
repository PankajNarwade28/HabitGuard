import { useLoginReminder } from '@/hooks/useLoginReminder';
import { useRouter } from 'expo-router';
import React from 'react';
import LoginReminder from './LoginReminder';

export default function AuthMonitor() {
  const { showReminder, dismissReminder } = useLoginReminder();
  const router = useRouter();

  const handleLogin = () => {
    dismissReminder();
    router.push('/login' as any);
  };

  const handleSkip = () => {
    dismissReminder();
  };

  return (
    <LoginReminder
      visible={showReminder}
      onLogin={handleLogin}
      onSkip={handleSkip}
    />
  );
}
