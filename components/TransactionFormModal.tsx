import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { CalculatorInput } from './CalculatorInput';
import { DateBox } from './DateBox';
import { searchTransactions } from '@/lib/database/transactions';

interface TransactionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => void;
  currency: string;
  initialData?: TransactionFormData;
}

export interface TransactionFormData {
  amount: number;
  description: string;
  details?: string;
  date: Date;
  type: 'debit' | 'credit';
}

export function TransactionFormModal({
  visible,
  onClose,
  onSave,
  currency,
  initialData,
}: TransactionFormModalProps) {
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [details, setDetails] = useState(initialData?.details || '');
  const [date, setDate] = useState(initialData?.date || new Date());
  const [type, setType] = useState<'debit' | 'credit'>(initialData?.type || 'credit');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleDescriptionChange = async (text: string) => {
    setDescription(text);
    if (text.length >= 2) {
      try {
        const results = await searchTransactions(text);
        const uniqueDescriptions = [...new Set(results.map(t => t.description))];
        setSuggestions(uniqueDescriptions.slice(0, 5));
        setShowSuggestions(uniqueDescriptions.length > 0);
      } catch (error) {
        console.error('Error searching descriptions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSave = () => {
    const amountNum = parseFloat(amount);
    if (!amount.trim() || isNaN(amountNum) || amountNum <= 0 || !description.trim()) {
      return;
    }

    onSave({
      amount: amountNum,
      description: description.trim(),
      details: details.trim() || undefined,
      date,
      type,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setDetails('');
    setDate(new Date());
    setType('credit');
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setDetails('');
    setDate(new Date());
    setType('credit');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modal}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[600]]}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>
              {initialData ? 'تعديل العملية' : 'عملية جديدة'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Type Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>نوع العملية *</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'credit' && styles.typeButtonActive,
                    type === 'credit' && styles.typeButtonCredit,
                  ]}
                  onPress={() => setType('credit')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="arrow-upward"
                    size={20}
                    color={type === 'credit' ? colors.white : colors.success[600]}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'credit' && styles.typeButtonTextActive,
                    ]}
                  >
                    له (دائن)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'debit' && styles.typeButtonActive,
                    type === 'debit' && styles.typeButtonDebit,
                  ]}
                  onPress={() => setType('debit')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="arrow-downward"
                    size={20}
                    color={type === 'debit' ? colors.white : colors.error[600]}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'debit' && styles.typeButtonTextActive,
                    ]}
                  >
                    عليه (مدين)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Input with Calculator */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>المبلغ * ({currency})</Text>
              <CalculatorInput
                value={amount}
                onValueChange={setAmount}
                placeholder="اضغط لإدخال المبلغ"
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>البيان *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="description"
                  size={20}
                  color={colors.neutral[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="وصف العملية"
                  value={description}
                  onChangeText={handleDescriptionChange}
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(suggestion)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="history" size={16} color={colors.neutral[500]} />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Details Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>التفاصيل</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <MaterialIcons
                  name="notes"
                  size={20}
                  color={colors.neutral[400]}
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="تفاصيل إضافية (اختياري)"
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
            </View>

            {/* Date Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>التاريخ *</Text>
              <View style={styles.dateContainer}>
                <DateBox date={date} size="large" />
                <TouchableOpacity style={styles.todayButton} activeOpacity={0.7}>
                  <Text style={styles.todayButtonText}>اليوم</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!amount.trim() || !description.trim()) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!amount.trim() || !description.trim()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  type === 'credit'
                    ? [colors.success[500], colors.success[700]]
                    : [colors.error[500], colors.error[700]]
                }
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>حفظ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  typeButtonActive: {
    borderColor: 'transparent',
  },
  typeButtonCredit: {
    backgroundColor: colors.success[500],
  },
  typeButtonDebit: {
    backgroundColor: colors.error[500],
  },
  typeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
    textAlign: 'right',
  },
  currencyLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary[600],
    marginRight: spacing.sm,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textAreaIcon: {
    marginTop: spacing.md,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  todayButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
  },
  todayButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary[700],
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  suggestionsContainer: {
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  suggestionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[700],
    textAlign: 'right',
  },
});
