/**
 * Reporting & Analytics Service
 * Provides comprehensive reporting for beneficiaries, donations, and aid distribution
 */

import { appwriteApi } from '@/shared/lib/api/appwrite-api';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SummaryMetrics {
  totalBeneficiaries: number;
  totalDonations: number;
  totalDonationAmount: number;
  totalAidApplications: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalMeetings: number;
  upcomingMeetings: number;
}

export interface DonationTrend {
  date: string;
  amount: number;
  count: number;
}

export interface BeneficiaryCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface AidDistribution {
  type: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string;
  beneficiaries: number;
  donations: number;
  aidApplications: number;
  tasks: number;
}

export interface ReportData {
  summary: SummaryMetrics;
  donationTrends: DonationTrend[];
  beneficiaryCategories: BeneficiaryCategory[];
  aidDistribution: AidDistribution[];
  monthlyStats: MonthlyStats[];
}

/**
 * Get summary metrics for dashboard
 */
export async function getSummaryMetrics(dateRange?: DateRange): Promise<SummaryMetrics> {
  try {
    const [beneficiariesRes, donationsRes, aidApplicationsRes, usersRes, tasksRes, meetingsRes] =
      await Promise.all([
        appwriteApi.beneficiaries.getBeneficiaries({ limit: 1 }),
        appwriteApi.donations.getDonations({ limit: 1000 }), // Get all for calculation
        getAidApplicationsCount(),
        appwriteApi.users.getUsers({ limit: 1 }),
        appwriteApi.tasks.getTasks({ limit: 1000 }),
        appwriteApi.meetings.getMeetings({ limit: 1000 })
      ]);

    // Calculate donation amount
    const donations = donationsRes.data || [];
    const totalDonationAmount = donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    // Calculate task statistics
    const tasks = tasksRes.data || [];
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;

    // Calculate meeting statistics
    const meetings = meetingsRes.data || [];
    const upcomingMeetings = meetings.filter(
      m => m.status === 'scheduled' && new Date(m.meeting_date) >= new Date()
    ).length;

    return {
      totalBeneficiaries: beneficiariesRes.total || 0,
      totalDonations: donationsRes.total || 0,
      totalDonationAmount,
      totalAidApplications: aidApplicationsRes.total || 0,
      activeUsers: usersRes.total || 0,
      totalTasks: tasksRes.total || 0,
      completedTasks,
      pendingTasks,
      totalMeetings: meetingsRes.total || 0,
      upcomingMeetings
    };
  } catch (error) {
    console.error('Error getting summary metrics:', error);
    throw error;
  }
}

/**
 * Get donation trends over time
 */
export async function getDonationTrends(
  dateRange: DateRange,
  interval: 'day' | 'week' | 'month' = 'day'
): Promise<DonationTrend[]> {
  try {
    const donationsRes = await appwriteApi.donations.getDonations({ limit: 1000 });
    const donations = donationsRes.data || [];

    // Filter by date range
    const filteredDonations = donations.filter(d => {
      const donationDate = new Date(d.$createdAt);
      return donationDate >= dateRange.from && donationDate <= dateRange.to;
    });

    // Group by interval
    const grouped = new Map<string, { amount: number; count: number }>();

    filteredDonations.forEach(donation => {
      const date = new Date(donation.$createdAt);
      let key: string;

      switch (interval) {
        case 'day':
          key = format(date, 'yyyy-MM-dd', { locale: tr });
          break;
        case 'week':
          key = format(date, 'yyyy-ww', { locale: tr });
          break;
        case 'month':
          key = format(date, 'yyyy-MM', { locale: tr });
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { amount: 0, count: 0 });
      }

      const entry = grouped.get(key)!;
      entry.amount += donation.amount;
      entry.count += 1;
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count
    }));
  } catch (error) {
    console.error('Error getting donation trends:', error);
    throw error;
  }
}

/**
 * Get beneficiary categories distribution
 */
export async function getBeneficiaryCategories(): Promise<BeneficiaryCategory[]> {
  try {
    const beneficiariesRes = await appwriteApi.beneficiaries.getBeneficiaries({ limit: 1000 });
    const beneficiaries = beneficiariesRes.data || [];

    // Group by category (using aid_type or other relevant field)
    const categories = new Map<string, number>();
    beneficiaries.forEach(b => {
      const category = b.aid_type || 'Diğer';
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    const total = beneficiaries.length;

    return Array.from(categories.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  } catch (error) {
    console.error('Error getting beneficiary categories:', error);
    throw error;
  }
}

/**
 * Get aid distribution statistics
 */
export async function getAidDistribution(): Promise<AidDistribution[]> {
  try {
    const aidApplicationsRes = await appwriteApi.aidApplications.getAidApplications({ limit: 1000 });
    const applications = aidApplicationsRes.data || [];

    const distribution = new Map<string, { amount: number; count: number }>();

    applications.forEach(app => {
      const types = [
        { key: 'one_time_aid', label: 'Tek Seferlik Yardım' },
        { key: 'regular_financial_aid', label: 'Düzenli Nakdi Yardım' },
        { key: 'regular_food_aid', label: 'Düzenli Gıda Yardımı' },
        { key: 'in_kind_aid', label: 'Ayni Yardım' },
        { key: 'service_referral', label: 'Hizmet Sevk' }
      ];

      types.forEach(type => {
        const value = app[type.key as keyof typeof app] as number;
        if (value) {
          if (!distribution.has(type.label)) {
            distribution.set(type.label, { amount: 0, count: 0 });
          }
          const entry = distribution.get(type.label)!;
          entry.amount += value;
          entry.count += 1;
        }
      });
    });

    const total = Array.from(distribution.values()).reduce((sum, d) => sum + d.amount, 0);

    return Array.from(distribution.entries()).map(([type, data]) => ({
      type,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0
    }));
  } catch (error) {
    console.error('Error getting aid distribution:', error);
    throw error;
  }
}

/**
 * Get monthly statistics for the current year
 */
export async function getMonthlyStats(): Promise<MonthlyStats[]> {
  try {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());

    const [beneficiariesRes, donationsRes, aidApplicationsRes, tasksRes] = await Promise.all([
      appwriteApi.beneficiaries.getBeneficiaries({ limit: 1000 }),
      appwriteApi.donations.getDonations({ limit: 1000 }),
      appwriteApi.aidApplications.getAidApplications({ limit: 1000 }),
      appwriteApi.tasks.getTasks({ limit: 1000 })
    ]);

    const beneficiaries = beneficiariesRes.data || [];
    const donations = donationsRes.data || [];
    const applications = aidApplicationsRes.data || [];
    const tasks = tasksRes.data || [];

    const months = Array.from({ length: 12 }, (_, i) => i);

    return months.map(month => {
      const monthStart = new Date(new Date().getFullYear(), month, 1);
      const monthEnd = endOfMonth(monthStart);

      const monthBeneficiaries = beneficiaries.filter(
        b => new Date(b.$createdAt) >= monthStart && new Date(b.$createdAt) <= monthEnd
      ).length;

      const monthDonations = donations.filter(
        d => new Date(d.$createdAt) >= monthStart && new Date(d.$createdAt) <= monthEnd
      ).length;

      const monthApplications = applications.filter(
        a => new Date(a.$createdAt) >= monthStart && new Date(a.$createdAt) <= monthEnd
      ).length;

      const monthTasks = tasks.filter(
        t => new Date(t.$createdAt) >= monthStart && new Date(t.$createdAt) <= monthEnd
      ).length;

      return {
        month: format(monthStart, 'MMM', { locale: tr }),
        beneficiaries: monthBeneficiaries,
        donations: monthDonations,
        aidApplications: monthApplications,
        tasks: monthTasks
      };
    });
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    throw error;
  }
}

/**
 * Get comprehensive report data
 */
export async function getComprehensiveReport(
  dateRange?: DateRange
): Promise<ReportData> {
  const [summary, donationTrends, beneficiaryCategories, aidDistribution, monthlyStats] =
    await Promise.all([
      getSummaryMetrics(dateRange),
      dateRange
        ? getDonationTrends(dateRange)
        : getDonationTrends({
            from: subDays(new Date(), 30),
            to: new Date()
          }),
      getBeneficiaryCategories(),
      getAidDistribution(),
      getMonthlyStats()
    ]);

  return {
    summary,
    donationTrends,
    beneficiaryCategories,
    aidDistribution,
    monthlyStats
  };
}

/**
 * Helper function to get aid applications count
 */
async function getAidApplicationsCount(): Promise<{ total: number }> {
  try {
    const response = await appwriteApi.aidApplications.getAidApplications({ limit: 1 });
    return { total: response.total || 0 };
  } catch (error) {
    console.error('Error getting aid applications count:', error);
    return { total: 0 };
  }
}

/**
 * Export report to CSV format
 */
export function exportToCsv(reportData: ReportData): string {
  const lines: string[] = [];

  // Summary section
  lines.push('Özet Raporu');
  lines.push(`Toplam İhtiyaç Sahibi,${reportData.summary.totalBeneficiaries}`);
  lines.push(`Toplam Bağış,${reportData.summary.totalDonations}`);
  lines.push(`Toplam Bağış Tutarı,${reportData.summary.totalDonationAmount}`);
  lines.push(`Toplam Yardım Başvurusu,${reportData.summary.totalAidApplications}`);
  lines.push(`Aktif Kullanıcı,${reportData.summary.activeUsers}`);
  lines.push('');

  // Donation trends
  lines.push('Bağış Trendleri');
  lines.push('Tarih,Tutar,Adet');
  reportData.donationTrends.forEach(trend => {
    lines.push(`${trend.date},${trend.amount},${trend.count}`);
  });
  lines.push('');

  // Beneficiary categories
  lines.push('İhtiyaç Sahibi Kategorileri');
  lines.push('Kategori,Adet,Yüzde');
  reportData.beneficiaryCategories.forEach(cat => {
    lines.push(`${cat.category},${cat.count},${cat.percentage.toFixed(2)}%`);
  });

  return lines.join('\n');
}

/**
 * Generate PDF report (placeholder - would need PDF library like jsPDF or Puppeteer)
 */
export async function generatePdfReport(reportData: ReportData): Promise<Blob> {
  // This is a placeholder implementation
  // In a real app, you would use a library like jsPDF, Puppeteer, or server-side PDF generation
  throw new Error('PDF generation not implemented. Use exportToCsv() or integrate PDF library.');
}
