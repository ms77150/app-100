import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { getSettings, updateSettings } from '@/lib/database/settings';
import type { AppSettings } from '@/lib/database/schema';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [editing, setEditing] = useState(false);

  // Form state
  const [companyNameAr, setCompanyNameAr] = useState('');
  const [companyNameEn, setCompanyNameEn] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('YER');
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettingsState(data);
      setCompanyNameAr(data.companyNameAr);
      setCompanyNameEn(data.companyNameEn);
      setPhoneNumber(data.phoneNumber || '');
      setAddress(data.address || '');
      setDefaultCurrency(data.defaultCurrency);
      setPinEnabled(data.pinEnabled);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        companyNameAr,
        companyNameEn,
        phoneNumber,
        address,
        defaultCurrency,
        pinEnabled,
      });
      
      Alert.alert('نجاح', 'تم حفظ الإعدادات بنجاح');
      setEditing(false);
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('خطأ', 'فشل حفظ الإعدادات');
    }
  };

  const handleChangePIN = () => {
    Alert.alert(
      'تغيير رمز PIN',
      'سيتم إضافة هذه الميزة قريباً',
      [{ text: 'حسناً' }]
    );
  };

  const handleBackup = () => {
    Alert.alert(
      'النسخ الاحتياطي',
      'سيتم إضافة هذه الميزة قريباً',
      [{ text: 'حسناً' }]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'استعادة النسخة الاحتياطية',
      'سيتم إضافة هذه الميزة قريباً',
      [{ text: 'حسناً' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'تصدير البيانات',
      'سيتم إضافة هذه الميزة قريباً',
      [{ text: 'حسناً' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <LinearGradient
        colors={[colors.primary[600], colors.primary[400]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <Text style={styles.headerSubtitle}>إدارة إعدادات التطبيق</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="business" size={24} color={colors.primary[600]} />
            <Text style={styles.sectionTitle}>معلومات الشركة</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم الشركة (عربي) *</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={companyNameAr}
                onChangeText={setCompanyNameAr}
                placeholder="اسم الشركة بالعربية"
                placeholderTextColor={colors.neutral[400]}
                editable={editing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم الشركة (إنجليزي) *</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={companyNameEn}
                onChangeText={setCompanyNameEn}
                placeholder="Company Name in English"
                placeholderTextColor={colors.neutral[400]}
                editable={editing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="777123456"
                keyboardType="phone-pad"
                placeholderTextColor={colors.neutral[400]}
                editable={editing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العنوان</Text>
              <TextInput
                style={[styles.input, styles.textArea, !editing && styles.inputDisabled]}
                value={address}
                onChangeText={setAddress}
                placeholder="عنوان الشركة"
                placeholderTextColor={colors.neutral[400]}
                multiline
                numberOfLines={3}
                editable={editing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العملة الافتراضية</Text>
              <View style={styles.currencySelector}>
                {['YER', 'SAR', 'USD', 'EUR'].map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.currencyButton,
                      defaultCurrency === currency && styles.currencyButtonActive,
                      !editing && styles.currencyButtonDisabled,
                    ]}
                    onPress={() => editing && setDefaultCurrency(currency)}
                    activeOpacity={0.7}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.currencyButtonText,
                      defaultCurrency === currency && styles.currencyButtonTextActive,
                    ]}>
                      {currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {editing ? (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditing(false);
                    loadSettings();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
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
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit" size={20} color={colors.primary[600]} />
                <Text style={styles.editButtonText}>تعديل المعلومات</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="security" size={24} color={colors.primary[600]} />
            <Text style={styles.sectionTitle}>الأمان</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>رمز PIN</Text>
                <Text style={styles.settingDescription}>
                  {pinEnabled ? 'مفعّل' : 'معطّل'}
                </Text>
              </View>
              <Switch
                value={pinEnabled}
                onValueChange={(value) => {
                  setPinEnabled(value);
                  updateSettings({ pinEnabled: value });
                }}
                trackColor={{ false: colors.neutral[300], true: colors.primary[400] }}
                thumbColor={pinEnabled ? colors.primary[600] : colors.neutral[100]}
              />
            </View>

            {pinEnabled && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleChangePIN}
                activeOpacity={0.7}
              >
                <MaterialIcons name="lock" size={20} color={colors.primary[600]} />
                <Text style={styles.actionButtonText}>تغيير رمز PIN</Text>
                <MaterialIcons name="chevron-left" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="storage" size={24} color={colors.primary[600]} />
            <Text style={styles.sectionTitle}>إدارة البيانات</Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBackup}
              activeOpacity={0.7}
            >
              <MaterialIcons name="backup" size={20} color={colors.success[600]} />
              <Text style={styles.actionButtonText}>نسخ احتياطي</Text>
              <MaterialIcons name="chevron-left" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRestore}
              activeOpacity={0.7}
            >
              <MaterialIcons name="restore" size={20} color={colors.primary[600]} />
              <Text style={styles.actionButtonText}>استعادة نسخة احتياطية</Text>
              <MaterialIcons name="chevron-left" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExportData}
              activeOpacity={0.7}
            >
              <MaterialIcons name="file-download" size={20} color={colors.primary[600]} />
              <Text style={styles.actionButtonText}>تصدير البيانات</Text>
              <MaterialIcons name="chevron-left" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={24} color={colors.primary[600]} />
            <Text style={styles.sectionTitle}>حول التطبيق</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>الإصدار</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>المطور</Text>
              <Text style={styles.aboutValue}>تطبيق منزل المحاسب</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>المصمم</Text>
              <Text style={styles.aboutValue}>يونس سعيد عبدالله المرح</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>رقم الهاتف</Text>
              <Text style={styles.aboutValue}>771222301</Text>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.light,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    color: colors.primary[500],
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    textAlign: 'right',
  },
  inputDisabled: {
    backgroundColor: colors.neutral[100],
    color: colors.neutral[600],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  currencySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  currencyButtonDisabled: {
    opacity: 0.6,
  },
  currencyButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  currencyButtonTextActive: {
    color: colors.white,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    marginTop: spacing.md,
  },
  editButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary[600],
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  actionButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.sm,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  aboutLabel: {
    fontSize: fontSize.md,
    color: colors.neutral[600],
  },
  aboutValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[900],
  },
});
