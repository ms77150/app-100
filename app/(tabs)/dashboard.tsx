import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { getDashboardStats, getCategoryStats, getTopAccounts, type DashboardStats, type CategoryStats } from '@/lib/database/statistics';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [topAccounts, setTopAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboardStats, categories, accounts] = await Promise.all([
        getDashboardStats(),
        getCategoryStats(),
        getTopAccounts(5),
      ]);
      
      setStats(dashboardStats);
      setCategoryStats(categories);
      setTopAccounts(accounts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  const netBalanceType = stats.netBalance > 0 ? 'credit' : stats.netBalance < 0 ? 'debit' : 'zero';

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[colors.primary[600], colors.primary[400]]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>لوحة التحكم</Text>
          <Text style={styles.headerSubtitle}>نظرة شاملة على الحسابات</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Main Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={styles.statCardGradient}
              >
                <MaterialIcons name="account-balance-wallet" size={32} color={colors.white} />
                <Text style={styles.statCardValue}>{stats.totalAccounts}</Text>
                <Text style={styles.statCardLabel}>إجمالي الحسابات</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={[colors.success[500], colors.success[600]]}
                style={styles.statCardGradient}
              >
                <MaterialIcons name="receipt" size={32} color={colors.white} />
                <Text style={styles.statCardValue}>{stats.totalTransactions}</Text>
                <Text style={styles.statCardLabel}>إجمالي العمليات</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Balance Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ملخص الأرصدة</Text>
            
            <View style={styles.balanceCard}>
              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <MaterialIcons name="arrow-upward" size={24} color={colors.success[600]} />
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>إجمالي له (دائن)</Text>
                    <Text style={[styles.balanceValue, { color: colors.success[700] }]}>
                      {stats.totalCredit.toLocaleString('ar-SA')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.balanceDivider} />

              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <MaterialIcons name="arrow-downward" size={24} color={colors.error[600]} />
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>إجمالي عليه (مدين)</Text>
                    <Text style={[styles.balanceValue, { color: colors.error[700] }]}>
                      {stats.totalDebit.toLocaleString('ar-SA')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.balanceDivider} />

              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <MaterialIcons 
                    name="account-balance" 
                    size={24} 
                    color={netBalanceType === 'credit' ? colors.success[600] : netBalanceType === 'debit' ? colors.error[600] : colors.neutral[600]} 
                  />
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>الرصيد الصافي</Text>
                    <Text style={[
                      styles.balanceValue,
                      { 
                        color: netBalanceType === 'credit' 
                          ? colors.success[700] 
                          : netBalanceType === 'debit' 
                          ? colors.error[700] 
                          : colors.neutral[700] 
                      }
                    ]}>
                      {Math.abs(stats.netBalance).toLocaleString('ar-SA')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Top Accounts */}
          {topAccounts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>أكبر الحسابات</Text>
              
              {topAccounts.map((account, index) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountItem}
                  onPress={() => router.push(`/account/${account.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.accountRank}>
                    <Text style={styles.accountRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={[
                      styles.accountBalance,
                      account.balanceType === 'credit' && { color: colors.success[600] },
                      account.balanceType === 'debit' && { color: colors.error[600] },
                    ]}>
                      {Math.abs(account.balance).toLocaleString('ar-SA')}
                      {' '}
                      {account.balanceType === 'credit' ? 'له' : account.balanceType === 'debit' ? 'عليه' : ''}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-left" size={24} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Category Stats */}
          {categoryStats.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الإحصائيات حسب التصنيف</Text>
              
              {categoryStats.map((category) => (
                <View key={category.categoryId} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.categoryName}</Text>
                    <Text style={styles.categoryCount}>{category.accountCount} حساب</Text>
                  </View>
                  
                  <View style={styles.categoryStats}>
                    <View style={styles.categoryStatItem}>
                      <Text style={styles.categoryStatLabel}>له</Text>
                      <Text style={[styles.categoryStatValue, { color: colors.success[600] }]}>
                        {category.totalCredit.toLocaleString('ar-SA')}
                      </Text>
                    </View>
                    
                    <View style={styles.categoryStatDivider} />
                    
                    <View style={styles.categoryStatItem}>
                      <Text style={styles.categoryStatLabel}>عليه</Text>
                      <Text style={[styles.categoryStatValue, { color: colors.error[600] }]}>
                        {category.totalDebit.toLocaleString('ar-SA')}
                      </Text>
                    </View>
                    
                    <View style={styles.categoryStatDivider} />
                    
                    <View style={styles.categoryStatItem}>
                      <Text style={styles.categoryStatLabel}>الصافي</Text>
                      <Text style={[
                        styles.categoryStatValue,
                        category.netBalance > 0 && { color: colors.success[600] },
                        category.netBalance < 0 && { color: colors.error[600] },
                      ]}>
                        {Math.abs(category.netBalance).toLocaleString('ar-SA')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Largest Accounts */}
          {(stats.largestCredit || stats.largestDebit) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>أبرز الحسابات</Text>
              
              {stats.largestCredit && (
                <View style={styles.highlightCard}>
                  <LinearGradient
                    colors={[colors.success[50], colors.success[100]]}
                    style={styles.highlightCardGradient}
                  >
                    <MaterialIcons name="trending-up" size={32} color={colors.success[600]} />
                    <View style={styles.highlightInfo}>
                      <Text style={styles.highlightLabel}>أكبر دائن (له)</Text>
                      <Text style={styles.highlightName}>{stats.largestCredit.accountName}</Text>
                      <Text style={[styles.highlightValue, { color: colors.success[700] }]}>
                        {stats.largestCredit.amount.toLocaleString('ar-SA')}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              )}
              
              {stats.largestDebit && (
                <View style={styles.highlightCard}>
                  <LinearGradient
                    colors={[colors.error[50], colors.error[100]]}
                    style={styles.highlightCardGradient}
                  >
                    <MaterialIcons name="trending-down" size={32} color={colors.error[600]} />
                    <View style={styles.highlightInfo}>
                      <Text style={styles.highlightLabel}>أكبر مدين (عليه)</Text>
                      <Text style={styles.highlightName}>{stats.largestDebit.accountName}</Text>
                      <Text style={[styles.highlightValue, { color: colors.error[700] }]}>
                        {stats.largestDebit.amount.toLocaleString('ar-SA')}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              )}
            </View>
          )}
        </View>
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  statCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.sm,
  },
  statCardLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  balanceRow: {
    paddingVertical: spacing.sm,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: fontSize.md,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  balanceDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.sm,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  accountRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  accountRankText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary[700],
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  accountBalance: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  categoryCount: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  categoryStatLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  categoryStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  categoryStatDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.sm,
  },
  highlightCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  highlightCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  highlightName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  highlightValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
});
