import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface CalculatorInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CalculatorInput({ value, onValueChange, placeholder }: CalculatorInputProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [display, setDisplay] = useState(value || '0');
  const [expression, setExpression] = useState('');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);

  const handleNumberPress = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (display === '0' || operator) {
      setDisplay(num);
      if (operator) {
        setExpression(prev => prev + ' ' + num);
        setOperator(null);
      }
    } else {
      setDisplay(display + num);
      setExpression(prev => prev + num);
    }
  };

  const handleOperatorPress = (op: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (previousValue && !operator) {
      handleEquals();
    }
    
    setPreviousValue(display);
    setOperator(op);
    setExpression(display + ' ' + op);
  };

  const handleEquals = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (!previousValue || !operator) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result = 0;

    switch (operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        result = current !== 0 ? prev / current : 0;
        break;
    }

    const resultStr = result.toString();
    setDisplay(resultStr);
    setExpression(previousValue + ' ' + operator + ' ' + display + ' = ' + resultStr);
    setPreviousValue(null);
    setOperator(null);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDisplay('0');
    setExpression('');
    setOperator(null);
    setPreviousValue(null);
  };

  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression('');
    }
  };

  const handleDecimal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setExpression(prev => prev + '.');
    }
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onValueChange(display);
    setShowCalculator(false);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDisplay(value || '0');
    setExpression('');
    setOperator(null);
    setPreviousValue(null);
    setShowCalculator(false);
  };

  const renderButton = (label: string, onPress: () => void, style?: any, textStyle?: any) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderOperatorButton = (label: string, op: string) => (
    <TouchableOpacity
      style={[styles.button, styles.operatorButton]}
      onPress={() => handleOperatorPress(op)}
      activeOpacity={0.7}
    >
      <Text style={styles.operatorButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowCalculator(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="calculate" size={24} color={colors.primary[600]} />
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value || placeholder || 'اضغط لإدخال المبلغ'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showCalculator}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable style={styles.calculatorContainer} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
                <MaterialIcons name="close" size={28} color={colors.neutral[600]} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>الآلة الحاسبة</Text>
              <TouchableOpacity onPress={handleConfirm} activeOpacity={0.7}>
                <MaterialIcons name="check" size={28} color={colors.primary[600]} />
              </TouchableOpacity>
            </View>

            {/* Display */}
            <View style={styles.display}>
              {expression ? (
                <Text style={styles.expressionText} numberOfLines={1}>
                  {expression}
                </Text>
              ) : null}
              <Text style={styles.displayText} numberOfLines={1}>
                {display}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {/* Row 1 */}
              <View style={styles.row}>
                {renderButton('C', handleClear, styles.functionButton, styles.functionButtonText)}
                {renderButton('⌫', handleBackspace, styles.functionButton, styles.functionButtonText)}
                {renderButton('%', () => {}, styles.functionButton, styles.functionButtonText)}
                {renderOperatorButton('÷', '÷')}
              </View>

              {/* Row 2 */}
              <View style={styles.row}>
                {renderButton('7', () => handleNumberPress('7'))}
                {renderButton('8', () => handleNumberPress('8'))}
                {renderButton('9', () => handleNumberPress('9'))}
                {renderOperatorButton('×', '×')}
              </View>

              {/* Row 3 */}
              <View style={styles.row}>
                {renderButton('4', () => handleNumberPress('4'))}
                {renderButton('5', () => handleNumberPress('5'))}
                {renderButton('6', () => handleNumberPress('6'))}
                {renderOperatorButton('-', '-')}
              </View>

              {/* Row 4 */}
              <View style={styles.row}>
                {renderButton('1', () => handleNumberPress('1'))}
                {renderButton('2', () => handleNumberPress('2'))}
                {renderButton('3', () => handleNumberPress('3'))}
                {renderOperatorButton('+', '+')}
              </View>

              {/* Row 5 */}
              <View style={styles.row}>
                {renderButton('00', () => handleNumberPress('00'), styles.doubleButton)}
                {renderButton('0', () => handleNumberPress('0'))}
                {renderButton('.', handleDecimal)}
                <TouchableOpacity
                  style={[styles.button, styles.equalsButton]}
                  onPress={handleEquals}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[700]]}
                    style={styles.equalsGradient}
                  >
                    <Text style={styles.equalsButtonText}>=</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputText: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
    textAlign: 'right',
    fontWeight: '600',
  },
  placeholder: {
    color: colors.neutral[400],
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  calculatorContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  display: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.neutral[50],
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  expressionText: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  displayText: {
    fontSize: fontSize.xxxl * 1.2,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'right',
  },
  buttonsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  doubleButton: {
    flex: 2,
    aspectRatio: 2,
  },
  buttonText: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  functionButton: {
    backgroundColor: colors.neutral[100],
  },
  functionButtonText: {
    color: colors.neutral[700],
  },
  operatorButton: {
    backgroundColor: colors.primary[50],
  },
  operatorButtonText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary[600],
  },
  equalsButton: {
    overflow: 'hidden',
  },
  equalsGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  equalsButtonText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.white,
  },
});
