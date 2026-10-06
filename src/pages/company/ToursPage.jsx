import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Map,
  PauseCircle,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import PageContainer from '../../components/layout/PageContainer';
import {
  archiveMyTourApi,
  getMyToursApi,
  pauseMyTourApi,
  publishMyTourApi,
} from '../../api/tours.api';

import './company-pages.css';

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Bản nháp',
    className: 'draft',
    icon: Clock3,
  },
  PUBLISHED: {
    label: 'Đang xuất bản',
    className: 'published',
    icon: CheckCircle2,
  },
  PAUSED: {
    label: 'Tạm dừng',
    className: 'paused',
    icon: PauseCircle,
  },
  ARCHIVED: {
    label: 'Đã lưu trữ',
    className: 'archived',
    icon: Archive,
  },
};

const TRAVEL_STYLE_LABELS = {
  BEACH: 'Biển',
  CULTURE: 'Văn hóa',
  EXPLORE: 'Khám phá',
  RELAX: 'Nghỉ dưỡng',
  ADVENTURE: 'Mạo hiểm',
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Không xác định',
    className: 'unknown',
    icon: Clock3,
  };

  const Icon = config.icon;

  return (
    <span className={`company-tour-status ${config.className}`}>
      <Icon size={15} />
      {config.label}
    </span>
  );
}

export default function ToursPage() {
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadTours = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getMyToursApi();

      setTours(
        Array.isArray(response)
          ? response
          : response?.tours || [],
      );
    } catch (requestError) {
      console.error(requestError);
      setError('Không thể tải danh sách tour. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchTours = async () => {
      try {
        setError('');

        const response = await getMyToursApi();

        if (cancelled) return;

        setTours(
          Array.isArray(response)
            ? response
            : response?.tours || [],
        );
      } catch (requestError) {
        if (cancelled) return;

        console.error(requestError);
        setError('Không thể tải danh sách tour. Vui lòng thử lại.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTours();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTours = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tours.filter((tour) => {
      const matchesSearch =
        !keyword ||
        tour.title?.toLowerCase().includes(keyword) ||
        tour.slug?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'ALL' ||
        tour.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tours, search, statusFilter]);

  const statistics = useMemo(
    () => ({
      total: tours.length,
      published: tours.filter(
        (tour) => tour.status === 'PUBLISHED',
      ).length,
      draft: tours.filter(
        (tour) => tour.status === 'DRAFT',
      ).length,
      paused: tours.filter(
        (tour) => tour.status === 'PAUSED',
      ).length,
      archived: tours.filter(
        (tour) => tour.status === 'ARCHIVED',
      ).length,
    }),
    [tours],
  );

  const handleStatusAction = async (tour, action) => {
    try {
      setActionLoading(`${action}-${tour.id}`);
      setError('');

      if (action === 'publish') {
        await publishMyTourApi(tour.id);
      }

      if (action === 'pause') {
        await pauseMyTourApi(tour.id);
      }

      if (action === 'archive') {
        await archiveMyTourApi(tour.id);
      }

      await loadTours();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError?.response?.data?.message ||
          'Không thể cập nhật trạng thái tour.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageContainer>
      <section className="section company-page-section">
        <div className="company-page-header">
          <div>
            <span className="section-eyebrow">
              TOUR MANAGEMENT
            </span>

            <h1>Quản lý tour</h1>

            <p>
              Quản lý các tour thuộc company hiện tại.
            </p>
          </div>

          <Link
            to="/company/tours/new"
            className="company-primary-button"
          >
            <Plus size={18} />
            Tạo tour
          </Link>
        </div>

        <div className="company-tour-stat-grid">
          <button
            type="button"
            className={`company-tour-stat-card${
              statusFilter === 'ALL' ? ' active' : ''
            }`}
            onClick={() => setStatusFilter('ALL')}
          >
            <span className="company-tour-stat-icon">
              <Map size={19} />
            </span>

            <span>
              <strong>{statistics.total}</strong>
              <small>Tổng số tour</small>
            </span>
          </button>

          <button
            type="button"
            className={`company-tour-stat-card${
              statusFilter === 'PUBLISHED' ? ' active' : ''
            }`}
            onClick={() => setStatusFilter('PUBLISHED')}
          >
            <span className="company-tour-stat-icon">
              <CheckCircle2 size={19} />
            </span>

            <span>
              <strong>{statistics.published}</strong>
              <small>Đang xuất bản</small>
            </span>
          </button>

          <button
            type="button"
            className={`company-tour-stat-card${
              statusFilter === 'DRAFT' ? ' active' : ''
            }`}
            onClick={() => setStatusFilter('DRAFT')}
          >
            <span className="company-tour-stat-icon">
              <Clock3 size={19} />
            </span>

            <span>
              <strong>{statistics.draft}</strong>
              <small>Bản nháp</small>
            </span>
          </button>

          <button
            type="button"
            className={`company-tour-stat-card${
              statusFilter === 'PAUSED' ? ' active' : ''
            }`}
            onClick={() => setStatusFilter('PAUSED')}
          >
            <span className="company-tour-stat-icon">
              <PauseCircle size={19} />
            </span>

            <span>
              <strong>{statistics.paused}</strong>
              <small>Tạm dừng</small>
            </span>
          </button>

          <button
            type="button"
            className={`company-tour-stat-card${
              statusFilter === 'ARCHIVED' ? ' active' : ''
            }`}
            onClick={() => setStatusFilter('ARCHIVED')}
          >
            <span className="company-tour-stat-icon">
              <Archive size={19} />
            </span>

            <span>
              <strong>{statistics.archived}</strong>
              <small>Đã lưu trữ</small>
            </span>
          </button>
        </div>

        {error && (
          <div className="company-page-alert error">
            {error}
          </div>
        )}

        <div className="company-tour-toolbar">
          <div className="company-tour-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Tìm theo tên hoặc slug tour..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="company-tour-filter"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">
              Đang xuất bản
            </option>
            <option value="PAUSED">Tạm dừng</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </div>

        <div className="company-tour-table-card">
          {loading ? (
            <div className="company-tour-empty">
              <Clock3 size={24} />
              <strong>Đang tải danh sách tour...</strong>
              <span>
                Hệ thống đang lấy dữ liệu từ backend.
              </span>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="company-tour-empty">
              <Map size={28} />

              <strong>
                {tours.length === 0
                  ? 'Company chưa có tour'
                  : 'Không tìm thấy tour phù hợp'}
              </strong>

              <span>
                {tours.length === 0
                  ? 'Hãy tạo tour đầu tiên để bắt đầu quản lý sản phẩm du lịch.'
                  : 'Thử thay đổi từ khóa hoặc bộ lọc trạng thái.'}
              </span>

              {tours.length === 0 && (
                <Link
                  to="/company/tours/new"
                  className="company-primary-button"
                >
                  <Plus size={17} />
                  Tạo tour đầu tiên
                </Link>
              )}
            </div>
          ) : (
            <div className="company-tour-table-wrapper">
              <table className="company-tour-table">
                <thead>
                  <tr>
                    <th>Tour</th>
                    <th>Phong cách</th>
                    <th>Thời lượng</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredTours.map((tour) => (
                    <tr key={tour.id}>
                      <td>
                        <div className="company-tour-name">
                          <div className="company-tour-avatar">
                            <Map size={18} />
                          </div>

                          <div>
                            <strong>{tour.title}</strong>

                            <span>
                              /{tour.slug}
                            </span>

                            <small>
                              Destination #{tour.destinationId}
                              {' · '}
                              Category #{tour.categoryId}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="company-tour-style">
                          {TRAVEL_STYLE_LABELS[
                            tour.travelStyle
                          ] || tour.travelStyle || '—'}
                        </span>
                      </td>

                      <td>
                        {tour.durationDays} ngày
                      </td>

                      <td>
                        <StatusBadge status={tour.status} />
                      </td>

                      <td>
                        {formatDate(tour.updatedAt)}
                      </td>

                      <td>
                        <div className="company-tour-actions">
                          <button
                            type="button"
                            title="Chỉnh sửa"
                            onClick={() =>
                              navigate(
                                `/company/tours/${tour.id}/edit`,
                              )
                            }
                          >
                            <Edit3 size={17} />
                          </button>

                          {tour.status === 'PUBLISHED' && (
                            <button
                              type="button"
                              title="Tạm dừng"
                              disabled={
                                actionLoading ===
                                `pause-${tour.id}`
                              }
                              onClick={() =>
                                handleStatusAction(
                                  tour,
                                  'pause',
                                )
                              }
                            >
                              <PauseCircle size={17} />
                            </button>
                          )}

                          {tour.status === 'PAUSED' && (
                            <button
                              type="button"
                              title="Xuất bản lại"
                              disabled={
                                actionLoading ===
                                `publish-${tour.id}`
                              }
                              onClick={() =>
                                handleStatusAction(
                                  tour,
                                  'publish',
                                )
                              }
                            >
                              <RotateCcw size={17} />
                            </button>
                          )}

                          {tour.status === 'DRAFT' && (
                            <button
                              type="button"
                              title="Xuất bản"
                              disabled={
                                actionLoading ===
                                `publish-${tour.id}`
                              }
                              onClick={() =>
                                handleStatusAction(
                                  tour,
                                  'publish',
                                )
                              }
                            >
                              <CheckCircle2 size={17} />
                            </button>
                          )}

                          {tour.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              title="Lưu trữ"
                              disabled={
                                actionLoading ===
                                `archive-${tour.id}`
                              }
                              onClick={() =>
                                handleStatusAction(
                                  tour,
                                  'archive',
                                )
                              }
                            >
                              <Archive size={17} />
                            </button>
                          )}

                          {tour.status === 'PUBLISHED' && (
                            <Link
                              to={`/tours/${tour.companySlug}/${tour.slug}`}
                              title="Xem tour"
                            >
                              <Eye size={17} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
