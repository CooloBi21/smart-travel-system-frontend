import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  Map,
  PauseCircle,
  RotateCw,
} from 'lucide-react';


import PageContainer from '../../components/layout/PageContainer';
import { getMyCompanyApi } from '../../api/company.api';
import { getMyToursApi } from '../../api/tours.api';
import { getCompanyBookingsApi } from '../../api/bookings.api';

import './company-pages.css';

function normalizeList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.tours)) {
    return response.tours;
  }

  if (Array.isArray(response?.bookings)) {
    return response.bookings;
  }

  return [];
}

export default function DashboardPage() {
  const [company, setCompany] = useState(null);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [companyResponse, toursResponse, bookingsResponse] =
          await Promise.all([
            getMyCompanyApi(),
            getMyToursApi(),
            getCompanyBookingsApi(),
          ]);

        if (cancelled) {
          return;
        }

        setCompany(companyResponse);
        setTours(normalizeList(toursResponse));
        setBookings(normalizeList(bookingsResponse));
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            'Không thể tải dữ liệu dashboard công ty.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const statistics = useMemo(() => {
    const publishedTours = tours.filter(
      (tour) => tour.status === 'PUBLISHED',
    ).length;

    const draftTours = tours.filter(
      (tour) => tour.status === 'DRAFT',
    ).length;

    const pausedTours = tours.filter(
      (tour) => tour.status === 'PAUSED',
    ).length;

    const pendingBookings = bookings.filter(
      (booking) => booking.status === 'PENDING',
    ).length;

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === 'CONFIRMED',
    ).length;

    const completedBookings = bookings.filter(
      (booking) => booking.status === 'COMPLETED',
    ).length;

    const cancelledBookings = bookings.filter(
      (booking) => booking.status === 'CANCELLED',
    ).length;
    const archivedTours = tours.filter(
      (tour) => tour.status === 'ARCHIVED',
    ).length;

    return {
      publishedTours,
      draftTours,
      pausedTours,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      archivedTours,
    };
  }, [tours, bookings]);

  if (loading) {
    return (
      <PageContainer>
        <div className="company-page-state" role="status">
          <LoaderCircle size={20} className="company-dashboard-spinner" />
          Đang tải dashboard...
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="company-page-state error" role="alert">
          <div>
            <h1>Không thể tải dashboard</h1>
            <p>{error}</p>
            <button
              type="button"
              className="company-dashboard-retry"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RotateCw size={16} />
              Thử lại
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="company-page company-dashboard-page">
        <div className="company-page-header">
          <div>
            <p className="company-dashboard-eyebrow">
              COMPANY OVERVIEW
            </p>

            <h1>
              {company?.name || 'Company Dashboard'}
            </h1>

            <p>
              Tổng quan hoạt động của doanh nghiệp trên
              Smart Travel System.
            </p>
          </div>
        </div>

        <section className="company-stats-grid">
          <div className="company-stat-card">
            <div className="company-stat-icon">
              <Map size={20} />
            </div>

            <div>
              <span>Tổng số tour</span>
              <strong>{tours.length}</strong>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon success">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Tour đã xuất bản</span>
              <strong>
                {statistics.publishedTours}
              </strong>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon warning">
              <FileText size={20} />
            </div>

            <div>
              <span>Tour nháp</span>
              <strong>{statistics.draftTours}</strong>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon muted">
              <PauseCircle size={20} />
            </div>

            <div>
              <span>Tour tạm dừng</span>
              <strong>{statistics.pausedTours}</strong>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon">
              <CalendarCheck size={20} />
            </div>

            <div>
              <span>Tổng booking</span>
              <strong>{bookings.length}</strong>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon warning">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Booking chờ xử lý</span>
              <strong>
                {statistics.pendingBookings}
              </strong>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon success">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Booking đã xác nhận</span>
              <strong>
                {statistics.confirmedBookings}
              </strong>
            </div>
          </div>

          <div className="company-stat-card">
            <div className="company-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Booking hoàn tất</span>
              <strong>{statistics.completedBookings}</strong>
            </div>
          </div>
        </section>

        <section className="company-dashboard-grid">
          <div className="company-dashboard-card">
            <div className="company-dashboard-card-header">
              <div>
                <h2>Tình trạng booking</h2>
                <p>
                  Phân bố booking hiện tại của doanh nghiệp.
                </p>
              </div>
            </div>

            <div className="company-dashboard-list">
              <div>
                <span>Chờ xử lý</span>
                <strong>
                  {statistics.pendingBookings}
                </strong>
              </div>

              <div>
                <span>Đã xác nhận</span>
                <strong>
                  {statistics.confirmedBookings}
                </strong>
              </div>

              <div>
                <span>Đã hoàn tất</span>
                <strong>
                  {statistics.completedBookings}
                </strong>
              </div>

              <div>
                <span>Đã hủy</span>
                <strong>{statistics.cancelledBookings}</strong>
              </div>
            </div>
            {bookings.length === 0 && (
              <p className="company-dashboard-empty">
                Chưa có booking để thống kê.
              </p>
            )}
          </div>

          <div className="company-dashboard-card">
            <div className="company-dashboard-card-header">
              <div>
                <h2>Tour của doanh nghiệp</h2>
                <p>
                  Tổng quan trạng thái các tour đang quản lý.
                </p>
              </div>
            </div>

            <div className="company-dashboard-list">
              <div>
                <span>Đã xuất bản</span>
                <strong>
                  {statistics.publishedTours}
                </strong>
              </div>

              <div>
                <span>Bản nháp</span>
                <strong>
                  {statistics.draftTours}
                </strong>
              </div>

              <div>
                <span>Tạm dừng</span>
                <strong>
                  {statistics.pausedTours}
                </strong>
              </div>

              <div>
                <span>Đã lưu trữ</span>
                <strong>{statistics.archivedTours}</strong>
              </div>
            </div>
            {tours.length === 0 && (
              <p className="company-dashboard-empty">
                Chưa có tour để thống kê.
              </p>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
