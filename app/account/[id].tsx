import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { DateBox } from '@/components/DateBox';
import { getAccountWithBalance } from '@/lib/database/accounts';
import { getTransactionsByAccount, deleteTransaction } from '@/lib/database/transactions';
import type { AccountWithBalance } from '@/lib/database/accounts';
import type { Transaction } from '@/lib/database/schema';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { TransactionFormModal, type TransactionFormData } from '@/components/TransactionFormModal';
import { createTransaction } from '@/lib/database/transactions';
import { getHijriDate, getDayName } from '@/lib/utils/hijri';
import { generateAccountStatement } from '@/lib/pdf/generator';
import * as Sharing from 'expo-sharing';
import { Platform, Linking } from 'react-native';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [account, setAccount] = useState<AccountWithBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const accountData = await getAccountWithBalance(Number(id));
      setAccount(accountData);

      if (accountData) {
        const txns = await getTransactionsByAccount(accountData.id);
        setTransactions(txns);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = (transaction: Transaction) => {
    Alert.alert(
      'خيارات العملية',
      `العملية رقم ${transaction.globalTransactionNumber}`,
      [
        {
          text: 'تعديل',
          onPress: () => {
            // Navigate to edit transaction screen
          },
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => handleDelete(transaction.id),
        },
        {
          text: 'إلغاء',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDelete = async (transactionId: number) => {
    try {
      await deleteTransaction(transactionId);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('خطأ', 'فشل حذف العملية');
    }
  };

  const handleSaveTransaction = async (data: TransactionFormData) => {
    try {
      if (!account) return;
      const hijriDate = getHijriDate(data.date);
      const dayName = getDayName(data.date);
      await createTransaction(
        account.id,
        data.amount,
        data.description,
        data.date.toISOString(),
        data.type,
        'YER', // Default currency
        data.details
      );
      setShowTransactionModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('خطأ', 'فشل إضافة العملية');
    }
  };

  const handleGeneratePDF = async () => {
    try {
      if (!account) return;
      
      // Get date range (all transactions)
      const startDate = transactions.length > 0 
        ? transactions[transactions.length - 1].date 
        : new Date().toISOString();
      const endDate = new Date().toISOString();
      
      Alert.alert('جاري إنشاء PDF...', 'الرجاء الانتظار...');
      
      const filePath = await generateAccountStatement({
        accountId: account.id,
        startDate,
        endDate,
        showTafqeet: true,
      });
      
      if (Platform.OS === 'web') {
        Alert.alert('نجاح', 'تم إنشاء كشف الحساب بنجاح');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(filePath);
        } else {
          Alert.alert('نجاح', `تم حفظ الملف في: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('خطأ', 'فشل إنشاء كشف الحساب');
    }
  };

  const handleCall = () => {
    if (account) {
      Linking.openURL(`tel:${account.phoneNumber}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!account) {
    return (
      <ScreenContainer>
        <Text style={styles.errorText}>الحساب غير موجود</Text>
      </ScreenContainer>
    );
  }

  const isDebit = account.balance < 0;
  const isCredit = account.balance > 0;

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const txDate = new Date(item.date);
    const isDebitTx = item.type === 'debit';

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionNumberBadge}>
            <Text style={styles.transactionNumber}>#{item.globalTransactionNumber}</Text>
          </View>
          <DateBox date={txDate} size="small" />
        </View>

        <View style={styles.transactionBody}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          {item.details && (
            <Text style={styles.transactionDetails}>{item.details}</Text>
          )}
        </View>

        <View style={styles.transactionFooter}>
          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                isDebitTx ? styles.debitAmount : styles.creditAmount,
              ]}
            >
              {isDebitTx ? '-' : '+'} {item.amount.toLocaleString('ar-SA')}
            </Text>
            <Text style={styles.transactionCurrency}>{item.currency}</Text>
          </View>

          <View style={styles.transactionBalanceContainer}>
            <Text style={styles.transactionBalanceLabel}>الرصيد:</Text>
            <Text
              style={[
                styles.transactionBalance,
                item.balance > 0 && styles.creditBalance,
                item.balance < 0 && styles.debitBalance,
              ]}
            >
              {item.balance.toLocaleString('ar-SA')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <LinearGradient
        colors={
          isCredit
            ? [colors.success[500], colors.success[400]]
            : isDebit
            ? [colors.error[500], colors.error[400]]
            : [colors.neutral[500], colors.neutral[400]]
        }
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountPhone}>{account.phoneNumber}</Text>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
            <Text style={styles.balanceAmount}>
              {Math.abs(account.balance).toLocaleString('ar-SA')}
            </Text>
            <Text style={styles.balanceStatus}>
              {isCredit ? 'له (دائن)' : isDebit ? 'عليه (مدين)' : 'متوازن'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <MaterialIcons name="phone" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleGeneratePDF}
            activeOpacity={0.7}
          >
            <MaterialIcons name="picture-as-pdf" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleGeneratePDF}
            activeOpacity={0.7}
          >
            <MaterialIcons name="share" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>
          العمليات ({transactions.length})
        </Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyStateText}>لا توجد عمليات</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.transactionsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* FAB Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => setShowTransactionModal(true)}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={32} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Transaction Form Modal */}
      <TransactionFormModal
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSave={handleSaveTransaction}
        currency="YER"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.error[500],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  accountName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  accountPhone: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  balanceContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.white,
  },
  balanceStatus: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  headerActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  transactionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  transactionsList: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  transactionNumberBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  transactionNumber: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary[700],
  },
  transactionBody: {
    marginBottom: spacing.md,
  },
  transactionDescription: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  transactionDetails: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  transactionAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  transactionAmount: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  debitAmount: {
    color: colors.error[600],
  },
  creditAmount: {
    color: colors.success[600],
  },
  transactionCurrency: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  transactionBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  transactionBalanceLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  transactionBalance: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  creditBalance: {
    color: colors.success[600],
  },
  debitBalance: {
    color: colors.error[600],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    color: colors.neutral[500],
    marginTop: spacing.md,
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
