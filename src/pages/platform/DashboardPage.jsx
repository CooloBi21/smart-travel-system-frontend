import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  Compass,
  FolderTree,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import { getCompaniesApi } from '../../api/company.api';
import { getAdminCategoriesApi } from '../../api/reference-data.api';
import { getPlatformAnalyticsApi } from '../../api/analytics.api';

import './platform-pages.css';

function formatCount(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const count = Number(value);

  return Number.isFinite(count)
    ? new Intl.NumberFormat('vi-VN').format(count)
    : '—';
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(amount)
    : '—';
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [companyData, categoryData, analyticsData] =
        await Promise.all([
          getCompaniesApi(),
          getAdminCategoriesApi(),
          getPlatformAnalyticsApi(),
        ]);

      setCompanies(
        Array.isArray(companyData)
          ? companyData
          : [],
      );

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : [],
      );

      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Không thể tải dữ liệu dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  const totalCompanies = companies.length;

  const pendingCompanies = companies.filter(
    (company) => company.status === 'PENDING',
  ).length;

  const activeCompanies = companies.filter(
    (company) => company.status === 'ACTIVE',
  ).length;

  const inactiveCompanies = companies.filter(
    (company) =>
      company.status === 'SUSPENDED' ||
      company.status === 'ARCHIVED',
  ).length;

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCategories =
    totalCategories - activeCategories;

  const overview = analytics?.overview;
  const dashboardIsEmpty =
    !loading &&
    !error &&
    companies.length === 0 &&
    categories.length === 0 &&
    [
      overview?.totalCompanies,
      overview?.totalTours,
      overview?.totalCustomers,
      overview?.totalBookings,
      overview?.totalRevenue,
    ].every((value) => value === 0);

  const metrics = [
    {
      label: 'Tổng công ty',
      value: totalCompanies,
      icon: Building2,
      group: 'company',
    },
    {
      label: 'Chờ duyệt',
      value: pendingCompanies,
      icon: Clock3,
      group: 'company',
    },
    {
      label: 'Đang hoạt động',
      value: activeCompanies,
      icon: CheckCircle2,
      group: 'company',
    },
    {
      label: 'Tạm ngưng / lưu trữ',
      value: inactiveCompanies,
      icon: XCircle,
      group: 'company',
    },
    {
      label: 'Tổng danh mục',
      value: totalCategories,
      icon: FolderTree,
      group: 'category',
    },
    {
      label: 'Danh mục đang dùng',
      value: activeCategories,
      icon: CheckCircle2,
      group: 'category',
    },
    {
      label: 'Tổng khách hàng',
      value: overview?.totalCustomers,
      icon: Users,
      group: 'analytics',
    },
    {
      label: 'Tổng tour',
      value: overview?.totalTours,
      icon: Compass,
      group: 'analytics',
    },
    {
      label: 'Tour đang xuất bản',
      value: overview?.publishedTours,
      icon: CheckCircle2,
      group: 'analytics',
    },
    {
      label: 'Tổng booking',
      value: overview?.totalBookings,
      icon: CalendarCheck2,
      group: 'analytics',
    },
    {
      label: 'Booking đã xác nhận',
      value: overview?.confirmedBookings,
      icon: CheckCircle2,
      group: 'analytics',
    },
    {
      label: 'Booking hoàn thành',
      value: overview?.completedBookings,
      icon: CheckCircle2,
      group: 'analytics',
    },
    {
      label: 'Booking đã hủy',
      value: overview?.cancelledBookings,
      icon: XCircle,
      group: 'analytics',
    },
    {
      label: 'Giá trị booking xác nhận / hoàn thành',
      value: overview?.totalRevenue,
      icon: CircleDollarSign,
      group: 'analytics',
      currency: true,
    },
  ];

  return (
    <PageContainer>
      <section className="platform-page-header">
        <div>
          <span className="platform-page-eyebrow">
            PLATFORM OVERVIEW
          </span>

          <h1>Dashboard</h1>

          <p>
            Tổng quan quản trị nền tảng Smart Travel.
          </p>
        </div>

        <button
          type="button"
          className="platform-refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? 'platform-spin' : ''}
          />
          {loading ? 'Đang tải' : 'Làm mới'}
        </button>
      </section>

      {error && (
        <div className="platform-error platform-dashboard-feedback" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="platform-refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Thử tải lại
          </button>
        </div>
      )}

      {loading && (
        <div className="platform-dashboard-state" role="status">
          <RefreshCw size={18} className="platform-spin" />
          Đang tải số liệu nền tảng...
        </div>
      )}

      {dashboardIsEmpty && (
        <div className="platform-dashboard-empty" role="status">
          Nền tảng chưa có dữ liệu tổng quan.
        </div>
      )}

      <section className="platform-dashboard-grid">
        {metrics.map(({ label, value, icon: Icon, group, currency }) => (
          <article
            className={`platform-stat-card ${group ? `platform-stat-${group}` : ''}`}
            key={label}
          >
            <span className="platform-stat-icon">
              <Icon size={20} />
            </span>
            <div className="platform-stat-content">
              <span>{label}</span>
              <strong>
                {loading || error
                  ? '—'
                  : currency
                    ? formatCurrency(value)
                    : formatCount(value)}
              </strong>
            </div>
          </article>
        ))}
      </section>

      <section className="platform-section platform-dashboard-categories">
        <div className="platform-section-header">
          <div>
            <h2>Danh mục</h2>
            <p>Trạng thái hoạt động lấy từ dữ liệu danh mục hiện có.</p>
          </div>
        </div>

        {loading ? (
          <div className="platform-empty-state" role="status">
            Đang tải danh mục...
          </div>
        ) : error ? (
          <div className="platform-empty-state">
            Không thể hiển thị thống kê danh mục khi dữ liệu chưa tải thành công.
          </div>
        ) : totalCategories === 0 ? (
          <div className="platform-empty-state">
            Chưa có danh mục nào trên nền tảng.
          </div>
        ) : (
          <div className="platform-category-summary">
            <span>
              Đang hoạt động: {formatCount(activeCategories)}
            </span>

            <span>
              Ngừng hoạt động: {formatCount(inactiveCategories)}
            </span>
          </div>
        )}

      </section>

      {!loading && !error && overview && (
        <p className="platform-dashboard-note">
          Giá trị booking được tổng hợp từ booking có trạng thái CONFIRMED
          hoặc COMPLETED; API không cung cấp dữ liệu thanh toán thực thu riêng.
        </p>
      )}
    </PageContainer>
  );
}
