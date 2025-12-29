import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { verifyPinCode } from '@/lib/database/settings';

interface PinLockScreenProps {
  onUnlock: () => void;
}

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberPress = async (num: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newPin = pin + num;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4 || newPin.length === 6) {
      const isValid = await verifyPinCode(newPin);
      if (isValid) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onUnlock();
      } else {
        setError(true);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Vibration.vibrate([0, 100, 50, 100]);
        }
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <LinearGradient
      colors={[colors.primary[700], colors.primary[500], colors.primary[300]]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🏠</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>منزل المحاسب</Text>
        <Text style={styles.subtitle}>أدخل رمز الدخول</Text>

        {/* PIN Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                pin.length > index && styles.dotFilled,
                error && styles.dotError,
              ]}
            />
          ))}
        </View>

        {error && (
          <Text style={styles.errorText}>رمز خاطئ، حاول مرة أخرى</Text>
        )}

        {/* Number Pad */}
        <View style={styles.numberPad}>
          {numbers.map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num)}
              activeOpacity={0.7}
            >
              <View style={styles.numberButtonInner}>
                <Text style={styles.numberText}>{num}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Empty space */}
          <View style={styles.numberButton} />
          
          {/* Delete button */}
          <TouchableOpacity
            style={styles.numberButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <View style={styles.numberButtonInner}>
              <Text style={styles.deleteText}>⌫</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotFilled: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  dotError: {
    backgroundColor: colors.error[500],
    borderColor: colors.error[500],
  },
  errorText: {
    color: colors.error[100],
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    justifyContent: 'center',
    gap: spacing.md,
  },
  numberButton: {
    width: 70,
    height: 70,
    margin: spacing.sm,
  },
  numberButtonInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.md,
  },
  numberText: {
    fontSize: fontSize.xxxl,
    fontWeight: '600',
    color: colors.white,
  },
  deleteText: {
    fontSize: fontSize.xxl,
    color: colors.white,
  },
});
