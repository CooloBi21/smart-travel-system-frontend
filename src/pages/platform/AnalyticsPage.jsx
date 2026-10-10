
import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  RefreshCw,
  Users,
} from 'lucide-react';

import { getPlatformAnalyticsApi } from '../../api/analytics.api';

const STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

function getValidNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : null;
}

function formatNumber(value) {
  const number = getValidNumber(value);

  if (number === null) {
    return '—';
  }

  return new Intl.NumberFormat('vi-VN').format(number);
}

function formatCurrency(value) {
  const number = getValidNumber(value);

  if (number === null) {
    return '—';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(number);
}

function formatMonth(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) {
    return '—';
  }

  const [year, month] = value.split('-').map(Number);

  if (month < 1 || month > 12) {
    return '—';
  }

  return `Tháng ${String(month).padStart(2, '0')}/${year}`;
}

function AnalyticsState({ children, isError = false }) {
  return (
    <div
      className={`platform-analytics-state${isError ? ' is-error' : ''}`}
      role={isError ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getPlatformAnalyticsApi();

      if (!result || typeof result !== 'object') {
        throw new Error('Dữ liệu phân tích trả về không hợp lệ.');
      }

      setData(result);
    } catch (err) {
      console.error('Không thể tải dữ liệu phân tích:', err);

      setData(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể tải dữ liệu phân tích.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnalytics();
  }, [loadAnalytics]);

  const overview = data?.overview;
  const bookingStatuses = data?.bookingStatuses;
  const monthlyBookings = data?.monthlyBookings;

  const hasOverview =
    overview !== null &&
    typeof overview === 'object' &&
    !Array.isArray(overview);

  const hasBookingStatuses = Array.isArray(bookingStatuses);
  const hasMonthlyBookings = Array.isArray(monthlyBookings);

  const stats = [
    {
      label: 'Tổng booking',
      value: overview?.totalBookings,
      icon: CalendarCheck2,
    },
    {
      label: 'Booking hoàn thành',
      value: overview?.completedBookings,
      icon: CheckCircle2,
    },
    {
      label: 'Giá trị booking xác nhận/hoàn thành',
      value: overview?.totalRevenue,
      icon: CircleDollarSign,
      currency: true,
    },
    {
      label: 'Tổng tour',
      value: overview?.totalTours,
      icon: BarChart3,
    },
    {
      label: 'Công ty hoạt động',
      value: overview?.activeCompanies,
      icon: Building2,
    },
    {
      label: 'Khách hàng',
      value: overview?.totalCustomers,
      icon: Users,
    },
  ];

  return (
    <div className="platform-page platform-analytics-page">
      <header className="platform-page-header">
        <div>
          <span className="platform-page-eyebrow">
            PLATFORM ADMIN
          </span>

          <h1>Phân tích hệ thống</h1>

          <p>
            Tổng quan hoạt động của nền tảng Smart Travel System.
          </p>
        </div>

        <button
          type="button"
          className="platform-refresh-button"
          onClick={loadAnalytics}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? 'platform-spin' : ''}
            aria-hidden="true"
          />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </header>

      {error && (
        <div className="platform-analytics-feedback">
          <AnalyticsState isError>
            {error}
          </AnalyticsState>

          <button
            type="button"
            className="platform-refresh-button"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      )}

      {loading && !data ? (
        <AnalyticsState>
          <RefreshCw
            size={18}
            className="platform-spin"
            aria-hidden="true"
          />
          Đang tải dữ liệu phân tích...
        </AnalyticsState>
      ) : !data ? (
        !error && (
          <AnalyticsState>
            Chưa có dữ liệu phân tích để hiển thị.
          </AnalyticsState>
        )
      ) : (
        <>
          <section
            className="platform-analytics-stats"
            aria-label="Thống kê tổng quan"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              const value = stat.currency
                ? formatCurrency(stat.value)
                : formatNumber(stat.value);

              return (
                <article
                  className="platform-analytics-stat-card"
                  key={stat.label}
                >
                  <span className="platform-analytics-stat-icon">
                    <Icon size={21} aria-hidden="true" />
                  </span>

                  <div className="platform-analytics-stat-content">
                    <span>{stat.label}</span>
                    <strong>{loading ? '—' : value}</strong>
                  </div>
                </article>
              );
            })}
          </section>

          {!hasOverview && (
            <AnalyticsState isError>
              Dữ liệu thống kê tổng quan không hợp lệ hoặc chưa được cung cấp.
            </AnalyticsState>
          )}

          <div className="platform-analytics-grid">
            <section className="platform-section">
              <div className="platform-section-header">
                <div>
                  <h2>Trạng thái booking</h2>
                  <p>
                    Phân bố booking theo trạng thái hiện tại.
                  </p>
                </div>
              </div>

              {!hasBookingStatuses || bookingStatuses.length === 0 ? (
                <AnalyticsState>
                  Chưa có dữ liệu trạng thái booking.
                </AnalyticsState>
              ) : (
                <div className="platform-analytics-status-list">
                  {bookingStatuses.map((item, index) => (
                    <div
                      className="platform-analytics-status-row"
                      key={`${item.status ?? 'unknown'}-${index}`}
                    >
                      <span>
                        {STATUS_LABELS[item.status] ?? item.status ?? 'Không xác định'}
                      </span>

                      <strong>{formatNumber(item.count)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="platform-section">
              <div className="platform-section-header">
                <div>
                  <h2>Hoạt động tour</h2>
                  <p>
                    Tình trạng tour trên nền tảng.
                  </p>
                </div>
              </div>

              {!hasOverview ? (
                <AnalyticsState>
                  Chưa có dữ liệu tổng quan tour.
                </AnalyticsState>
              ) : (
                <div className="platform-analytics-status-list">
                  <div className="platform-analytics-status-row">
                    <span>Tổng tour</span>
                    <strong>{formatNumber(overview.totalTours)}</strong>
                  </div>

                  <div className="platform-analytics-status-row">
                    <span>Đang xuất bản</span>
                    <strong>{formatNumber(overview.publishedTours)}</strong>
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="platform-section platform-analytics-monthly">
            <div className="platform-section-header">
              <div>
                <h2>Booking theo tháng</h2>

                <p>
                  Số booking được tạo và giá trị booking xác nhận/hoàn thành
                  theo tháng tạo booking.
                </p>
              </div>
            </div>

            {!hasMonthlyBookings || monthlyBookings.length === 0 ? (
              <AnalyticsState>
                Chưa có dữ liệu booking theo tháng.
              </AnalyticsState>
            ) : (
              <div className="platform-analytics-table-wrapper">
                <table className="platform-analytics-table">
                  <thead>
                    <tr>
                      <th scope="col">Tháng tạo booking</th>
                      <th scope="col">Số booking</th>
                      <th scope="col">
                        Giá trị booking xác nhận/hoàn thành
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthlyBookings.map((item, index) => (
                      <tr
                        key={`${item.month ?? 'unknown'}-${index}`}
                      >
                        <td>{formatMonth(item.month)}</td>
                        <td>{formatNumber(item.bookingCount)}</td>
                        <td>{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="platform-analytics-note">
              Giá trị booking được tính từ số khách nhân với giá mỗi khách
              của các booking đã xác nhận hoặc hoàn thành. Đây không phải
              số tiền đã thu thực tế. Dữ liệu theo tháng được nhóm theo
              thời điểm tạo booking.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
