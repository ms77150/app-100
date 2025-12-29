import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDateBox } from '@/lib/utils/hijri-date';
import { colors, shadows, borderRadius, spacing } from '@/lib/theme/colors';

interface DateBoxProps {
  date: Date;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function DateBox({ date, onPress, size = 'medium' }: DateBoxProps) {
  const { gregorian, hijri, day } = formatDateBox(date);
  
  const sizeStyles = {
    small: { width: 80, padding: 8 },
    medium: { width: 100, padding: 12 },
    large: { width: 120, padding: 16 },
  };
  
  const fontSizes = {
    small: { gregorian: 12, hijri: 9, day: 9 },
    medium: { gregorian: 14, hijri: 10, day: 10 },
    large: { gregorian: 16, hijri: 11, day: 11 },
  };
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        sizeStyles[size],
        onPress && styles.touchable,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.gregorian, { fontSize: fontSizes[size].gregorian }]}>
        {gregorian}
      </Text>
      <Text style={[styles.hijri, { fontSize: fontSizes[size].hijri }]}>
        {hijri}
      </Text>
      <Text style={[styles.day, { fontSize: fontSizes[size].day }]}>
        {day}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  touchable: {
    borderColor: colors.primary[400],
  },
  gregorian: {
    fontWeight: '700',
    color: colors.primary[700],
    marginBottom: 2,
  },
  hijri: {
    color: colors.neutral[600],
    marginBottom: 2,
  },
  day: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});
