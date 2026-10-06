import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock3,
  Map,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import PageContainer from '../../components/layout/PageContainer';
import { getMyCompanyApi } from '../../api/company.api';
import { getMyToursApi } from '../../api/tours.api';

import './company-pages.css';

export default function DashboardPage() {
  const [company, setCompany] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [companyResponse, toursResponse] =
          await Promise.all([
            getMyCompanyApi(),
            getMyToursApi(),
          ]);

        setCompany(companyResponse?.company || companyResponse);
        setTours(
          Array.isArray(toursResponse)
            ? toursResponse
            : toursResponse?.tours || [],
        );
      } catch (requestError) {
        console.error(requestError);
        setError(
          'Không thể tải dữ liệu quản trị công ty.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const publishedCount = useMemo(
    () =>
      tours.filter(
        (tour) => tour.status === 'PUBLISHED',
      ).length,
    [tours],
  );

  const draftCount = useMemo(
    () =>
      tours.filter(
        (tour) => tour.status === 'DRAFT',
      ).length,
    [tours],
  );

  const archivedCount = useMemo(
    () =>
      tours.filter(
        (tour) => tour.status === 'ARCHIVED',
      ).length,
    [tours],
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="company-state">
          Đang tải dashboard...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="company-page-heading">
        <div>
          <span className="section-eyebrow">
            COMPANY DASHBOARD
          </span>

          <h1>
            {company?.name || 'Company Dashboard'}
          </h1>

          <p>
            Tổng quan tour và trạng thái hoạt động
            của doanh nghiệp.
          </p>
        </div>

        <Link
          to="/company/tours/new"
          className="company-primary-button"
        >
          <Plus size={17} />
          Tạo tour
        </Link>
      </section>

      {error && (
        <div className="company-error">
          {error}
        </div>
      )}

      <section className="company-kpi-grid">
        <article className="company-kpi-card">
          <div className="company-kpi-icon">
            <Map size={20} />
          </div>

          <div>
            <span>Tổng số tour</span>
            <strong>{tours.length}</strong>
          </div>
        </article>

        <article className="company-kpi-card">
          <div className="company-kpi-icon success">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Đang công khai</span>
            <strong>{publishedCount}</strong>
          </div>
        </article>

        <article className="company-kpi-card">
          <div className="company-kpi-icon warning">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Bản nháp</span>
            <strong>{draftCount}</strong>
          </div>
        </article>

        <article className="company-kpi-card">
          <div className="company-kpi-icon muted">
            <Building2 size={20} />
          </div>

          <div>
            <span>Đã lưu trữ</span>
            <strong>{archivedCount}</strong>
          </div>
        </article>
      </section>

      <section className="company-panel">
        <div className="company-panel-header">
          <div>
            <h2>Tour của doanh nghiệp</h2>
            <p>
              Danh sách tour thuộc company hiện tại.
            </p>
          </div>

          <Link
            to="/company/tours"
            className="company-text-link"
          >
            Xem tất cả
          </Link>
        </div>

        {tours.length === 0 ? (
          <div className="company-empty">
            Chưa có tour nào.
          </div>
        ) : (
          <div className="company-table-wrapper">
            <table className="company-table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Trạng thái</th>
                  <th>Thời lượng</th>
                  <th>Giá từ</th>
                </tr>
              </thead>

              <tbody>
                {tours.slice(0, 8).map((tour) => (
                  <tr key={tour.id}>
                    <td>
                      <strong>
                        {tour.title}
                      </strong>
                      <span>
                        {tour.destinationName ||
                          'Chưa có điểm đến'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`company-status status-${String(
                          tour.status || '',
                        ).toLowerCase()}`}
                      >
                        {tour.status || 'UNKNOWN'}
                      </span>
                    </td>

                    <td>
                      {tour.durationDays
                        ? `${tour.durationDays} ngày`
                        : '—'}
                    </td>

                    <td>
                      {tour.minPrice
                        ? `${Number(
                            tour.minPrice,
                          ).toLocaleString(
                            'vi-VN',
                          )} ₫`
                        : 'Liên hệ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="company-info-panel">
        <div>
          <span>COMPANY STATUS</span>
          <strong>
            {company?.status || 'UNKNOWN'}
          </strong>
        </div>

        <div>
          <span>COMPANY SLUG</span>
          <strong>
            {company?.slug || '—'}
          </strong>
        </div>
      </section>
    </PageContainer>
  );
}
