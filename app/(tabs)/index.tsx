import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { PinLockScreen } from '@/components/PinLockScreen';
import { useApp } from '@/lib/context/AppContext';
import { getAllCategories } from '@/lib/database/categories';
import { getAccountsByCategory, type AccountWithBalance } from '@/lib/database/accounts';
import type { Category } from '@/lib/database/schema';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { AccountFormModal, type AccountFormData } from '@/components/AccountFormModal';
import { createAccount } from '@/lib/database/accounts';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { isReady, isLocked, unlock } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isLocked) {
      loadCategories();
    }
  }, [isReady, isLocked]);

  useEffect(() => {
    if (selectedCategory) {
      loadAccounts(selectedCategory.id);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async (categoryId: number) => {
    try {
      const accs = await getAccountsByCategory(categoryId);
      setAccounts(accs);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (isLocked) {
    return <PinLockScreen onUnlock={unlock} />;
  }

  const renderCategoryTab = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
        onPress={() => setSelectedCategory(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}>
          {item.name}
        </Text>
        <Text style={[styles.categoryTabCurrency, isSelected && styles.categoryTabCurrencySelected]}>
          {item.currency}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSaveAccount = async (data: AccountFormData) => {
    try {
      if (!selectedCategory) return;
      await createAccount(selectedCategory.id, data.name, data.phoneNumber, data.notes);
      setShowAccountModal(false);
      loadAccounts(selectedCategory.id);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const renderAccount = ({ item }: { item: AccountWithBalance }) => {
    const isDebit = item.balance < 0;
    const isCredit = item.balance > 0;
    
    return (
      <TouchableOpacity 
        style={styles.accountCard} 
        activeOpacity={0.7}
        onPress={() => router.push(`/account/${item.id}`)}
      >
        <LinearGradient
          colors={isCredit ? [colors.success[50], colors.success[100]] : isDebit ? [colors.error[50], colors.error[100]] : [colors.neutral[50], colors.neutral[100]]}
          style={styles.accountCardGradient}
        >
          <View style={styles.accountCardHeader}>
            <View style={styles.accountCardTitleRow}>
              <Text style={styles.accountCardName}>{item.name}</Text>
              {isCredit && (
                <MaterialIcons name="arrow-upward" size={20} color={colors.success[600]} />
              )}
              {isDebit && (
                <MaterialIcons name="arrow-downward" size={20} color={colors.error[600]} />
              )}
            </View>
            <Text style={styles.accountCardPhone}>{item.phoneNumber}</Text>
          </View>

          <View style={styles.accountCardFooter}>
            <View>
              <Text style={styles.accountCardBalanceLabel}>الرصيد</Text>
              <Text style={[
                styles.accountCardBalance,
                isCredit && { color: colors.success[700] },
                isDebit && { color: colors.error[700] },
              ]}>
                {Math.abs(item.balance).toLocaleString('ar-SA')}
              </Text>
            </View>
            <View style={styles.accountCardTransactions}>
              <MaterialIcons name="receipt" size={16} color={colors.neutral[500]} />
              <Text style={styles.accountCardTransactionsText}>
                {item.transactionCount} عملية
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <LinearGradient
        colors={[colors.primary[600], colors.primary[400]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>منزل المحاسب</Text>
        <Text style={styles.headerSubtitle}>إدارة الحسابات والديون</Text>
      </LinearGradient>

      {/* Categories Tabs */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Accounts List */}
      <View style={styles.accountsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} />
        ) : accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="account-balance-wallet" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyStateText}>لا توجد حسابات</Text>
            <Text style={styles.emptyStateSubtext}>اضغط + لإضافة حساب جديد</Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            renderItem={renderAccount}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.accountsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* FAB Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => setShowAccountModal(true)}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={32} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Account Form Modal */}
      {selectedCategory && (
        <AccountFormModal
          visible={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onSave={handleSaveAccount}
          categoryId={selectedCategory.id}
        />
      )}
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
  categoriesContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  categoriesList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  categoryTabSelected: {
    backgroundColor: colors.primary[500],
    ...shadows.md,
  },
  categoryTabText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  categoryTabTextSelected: {
    color: colors.white,
  },
  categoryTabCurrency: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  categoryTabCurrencySelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  accountsContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  accountsList: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  accountCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  accountCardGradient: {
    padding: spacing.lg,
  },
  accountCardHeader: {
    marginBottom: spacing.md,
  },
  accountCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  accountCardName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
  },
  accountCardPhone: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  accountCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  accountCardBalanceLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  accountCardBalance: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  accountCardTransactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accountCardTransactionsText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.neutral[600],
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: fontSize.md,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...shadows.xl,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
});
