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

interface AccountFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => void;
  categoryId: number;
  initialData?: AccountFormData;
}

export interface AccountFormData {
  name: string;
  phoneNumber: string;
  notes?: string;
}

export function AccountFormModal({
  visible,
  onClose,
  onSave,
  categoryId,
  initialData,
}: AccountFormModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSave = () => {
    if (!name.trim() || !phoneNumber.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      notes: notes.trim() || undefined,
    });

    // Reset form
    setName('');
    setPhoneNumber('');
    setNotes('');
  };

  const handleClose = () => {
    setName('');
    setPhoneNumber('');
    setNotes('');
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
              {initialData ? 'تعديل الحساب' : 'حساب جديد'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم الحساب *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color={colors.neutral[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="مثال: محمد أحمد"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الجوال *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="phone"
                  size={20}
                  color={colors.neutral[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="مثال: 771234567"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ملاحظات</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <MaterialIcons
                  name="notes"
                  size={20}
                  color={colors.neutral[400]}
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="ملاحظات إضافية (اختياري)"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={colors.neutral[400]}
                />
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
                (!name.trim() || !phoneNumber.trim()) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!name.trim() || !phoneNumber.trim()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
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
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textAreaIcon: {
    marginTop: spacing.md,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
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
});
