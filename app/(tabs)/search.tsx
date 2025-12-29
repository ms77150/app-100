import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { searchTransactions } from '@/lib/database/transactions';
import { colors, shadows, borderRadius, spacing, fontSize } from '@/lib/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { formatDate } from '@/lib/utils/hijri';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedType, setSelectedType] = useState<'all' | 'debit' | 'credit'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchTransactions(searchQuery);
      
      // Apply filters
      let filtered = searchResults;
      
      if (selectedType !== 'all') {
        filtered = filtered.filter(t => t.type === selectedType);
      }
      
      if (startDate) {
        filtered = filtered.filter(t => t.date >= startDate);
      }
      
      if (endDate) {
        filtered = filtered.filter(t => t.date <= endDate);
      }
      
      if (minAmount) {
        const min = parseFloat(minAmount);
        filtered = filtered.filter(t => t.amount >= min);
      }
      
      if (maxAmount) {
        const max = parseFloat(maxAmount);
        filtered = filtered.filter(t => t.amount <= max);
      }
      
      setResults(filtered);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedType('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const txDate = new Date(item.date);
    const isDebit = item.type === 'debit';

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => router.push(`/account/${item.accountId}`)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionNumberBadge}>
            <Text style={styles.transactionNumber}>#{item.globalTransactionNumber}</Text>
          </View>
          <Text style={styles.transactionDate}>{formatDate(txDate)}</Text>
        </View>

        <View style={styles.transactionBody}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          {item.accountName && (
            <Text style={styles.transactionAccount}>الحساب: {item.accountName}</Text>
          )}
          {item.details && (
            <Text style={styles.transactionDetails}>{item.details}</Text>
          )}
        </View>

        <View style={styles.transactionFooter}>
          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                isDebit ? styles.debitAmount : styles.creditAmount,
              ]}
            >
              {isDebit ? '-' : '+'} {item.amount.toLocaleString('ar-SA')}
            </Text>
            <Text style={styles.transactionCurrency}>{item.currency}</Text>
          </View>

          <View style={styles.transactionType}>
            <MaterialIcons
              name={isDebit ? 'arrow-downward' : 'arrow-upward'}
              size={16}
              color={isDebit ? colors.error[600] : colors.success[600]}
            />
            <Text style={[
              styles.transactionTypeText,
              isDebit ? { color: colors.error[600] } : { color: colors.success[600] },
            ]}>
              {isDebit ? 'عليه' : 'له'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <LinearGradient
        colors={[colors.primary[600], colors.primary[400]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>البحث المتقدم</Text>
        <Text style={styles.headerSubtitle}>ابحث في جميع العمليات</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={24} color={colors.neutral[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث في البيان أو التفاصيل..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.neutral[400]}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="filter-list" 
              size={24} 
              color={showFilters ? colors.primary[600] : colors.neutral[600]} 
            />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>النوع:</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'all' && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === 'all' && styles.typeButtonTextActive,
                  ]}>
                    الكل
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'credit' && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType('credit')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === 'credit' && styles.typeButtonTextActive,
                  ]}>
                    له
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'debit' && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType('debit')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === 'debit' && styles.typeButtonTextActive,
                  ]}>
                    عليه
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>المبلغ:</Text>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="من"
                  value={minAmount}
                  onChangeText={setMinAmount}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.neutral[400]}
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="إلى"
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>مسح الفلاتر</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleSearch}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[700]]}
                  style={styles.applyButtonGradient}
                >
                  <Text style={styles.applyButtonText}>تطبيق</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Button */}
        {!showFilters && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              style={styles.searchButtonGradient}
            >
              <MaterialIcons name="search" size={24} color={colors.white} />
              <Text style={styles.searchButtonText}>بحث</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Results */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>جاري البحث...</Text>
          </View>
        ) : results.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              النتائج: {results.length} عملية
            </Text>
            <FlatList
              data={results}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : searchQuery && !loading ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyStateText}>لا توجد نتائج</Text>
            <Text style={styles.emptyStateSubtext}>جرب كلمات بحث أخرى</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="search" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyStateText}>ابدأ البحث</Text>
            <Text style={styles.emptyStateSubtext}>اكتب كلمة البحث واضغط على زر البحث</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
    textAlign: 'right',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  filterRow: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  typeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  rangeSeparator: {
    fontSize: fontSize.lg,
    color: colors.neutral[500],
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  applyButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
  searchButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  searchButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    color: colors.primary[500],
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.md,
  },
  resultsList: {
    paddingBottom: spacing.xl,
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
  transactionDate: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
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
  transactionAccount: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
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
  transactionType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  transactionTypeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
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
    textAlign: 'center',
  },
});
