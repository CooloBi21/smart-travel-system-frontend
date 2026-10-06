import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Eye,
  Search,
  XCircle,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import {
  getCompanyBookingApi,
  getCompanyBookingsApi,
} from '../../api/bookings.api';

import './company-pages.css';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xử lý',
    className: 'pending',
    icon: Clock3,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'confirmed',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'cancelled',
    icon: XCircle,
  },
  FAILED: {
    label: 'Thất bại',
    className: 'failed',
    icon: XCircle,
  },
};

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '—';
  }

  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || 'Không xác định',
      className: 'unknown',
      icon: Clock3,
    }
  );
}

function normalizeBookings(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.bookings)) {
    return response.bookings;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getCompanyBookingsApi();

        if (cancelled) {
          return;
        }

        setBookings(normalizeBookings(response));
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(requestError);

        setError(
          requestError?.response?.data?.message ||
            'Không thể tải danh sách booking.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const statistics = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter(
        (booking) => booking.status === 'CONFIRMED',
      ).length,
      pending: bookings.filter(
        (booking) => booking.status === 'PENDING',
      ).length,
      failed: bookings.filter(
        (booking) => booking.status === 'FAILED',
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status === 'CANCELLED',
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        booking.status === statusFilter;

      if (!keyword) {
        return matchesStatus;
      }

      const searchableText = [
        booking.id,
        booking.guestId,
        booking.tourId,
        booking.status,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined,
        )
        .join(' ')
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(keyword)
      );
    });
  }, [bookings, search, statusFilter]);

  const handleViewBooking = async (bookingId) => {
    try {
      setDetailLoading(true);
      setDetailError('');
      setSelectedBooking(null);

      const response = await getCompanyBookingApi(
        bookingId,
      );

      setSelectedBooking(
        response?.booking || response,
      );
    } catch (requestError) {
      console.error(requestError);

      setDetailError(
        requestError?.response?.data?.message ||
          'Không thể tải thông tin booking.',
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedBooking(null);
    setDetailError('');
  };

  return (
    <PageContainer>
      <section className="section company-page-section">
        <div className="company-page-header">
          <div>
            <span className="section-eyebrow">
              BOOKING MANAGEMENT
            </span>

            <h1>Quản lý booking</h1>

            <p>
              Theo dõi các đơn đặt tour được hệ thống
              ghi nhận.
            </p>
          </div>
        </div>

        <div className="company-tour-stat-grid">
          <div className="company-tour-stat-card">
            <div className="company-tour-stat-icon">
              <CalendarCheck size={20} />
            </div>

            <div>
              <span>Tổng booking</span>
              <strong>{statistics.total}</strong>
            </div>
          </div>

          <div className="company-tour-stat-card">
            <div className="company-tour-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Đã xác nhận</span>
              <strong>{statistics.confirmed}</strong>
            </div>
          </div>

          <div className="company-tour-stat-card">
            <div className="company-tour-stat-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Chờ xử lý</span>
              <strong>{statistics.pending}</strong>
            </div>
          </div>

          <div className="company-tour-stat-card">
            <div className="company-tour-stat-icon">
              <XCircle size={20} />
            </div>

            <div>
              <span>Thất bại / Hủy</span>
              <strong>
                {statistics.failed +
                  statistics.cancelled}
              </strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="company-page-alert error">
            {error}
          </div>
        )}

        <div className="company-tour-toolbar">
          <label className="company-tour-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Tìm theo booking, guest hoặc tour..."
            />
          </label>

          <label className="company-tour-filter">
            <span>Trạng thái</span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">
                Tất cả
              </option>

              <option value="PENDING">
                Chờ xử lý
              </option>

              <option value="CONFIRMED">
                Đã xác nhận
              </option>

              <option value="CANCELLED">
                Đã hủy
              </option>

              <option value="FAILED">
                Thất bại
              </option>
            </select>
          </label>
        </div>

        <div className="company-tour-table-card">
          <div className="company-tour-table-wrapper">
            <table className="company-tour-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Guest</th>
                  <th>Tour</th>
                  <th>Số lượng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="company-tour-empty"
                    >
                      Đang tải booking...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="company-tour-empty"
                    >
                      Không tìm thấy booking phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const status =
                      getStatusConfig(
                        booking.status,
                      );

                    const StatusIcon = status.icon;

                    return (
                      <tr key={booking.id}>
                        <td>
                          <strong>
                            #{booking.id}
                          </strong>
                        </td>

                        <td>
                          Guest #{booking.guestId ?? '—'}
                        </td>

                        <td>
                          Tour #{booking.tourId ?? '—'}
                        </td>

                        <td>
                          {booking.quantity ?? '—'}
                        </td>

                        <td>
                          {formatCurrency(
                            booking.totalAmount,
                          )}
                        </td>

                        <td>
                          <span
                            className={`company-tour-status ${status.className}`}
                          >
                            <StatusIcon size={15} />
                            {status.label}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            booking.createdAt,
                          )}
                        </td>

                        <td>
                          <div className="company-tour-actions">
                            <button
                              type="button"
                              className="company-secondary-button"
                              onClick={() =>
                                handleViewBooking(
                                  booking.id,
                                )
                              }
                            >
                              <Eye size={16} />
                              Xem
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {(selectedBooking ||
        detailLoading ||
        detailError) && (
        <div
          className="company-booking-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeDetail();
            }
          }}
        >
          <div
            className="company-booking-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Chi tiết booking"
          >
            {detailLoading ? (
              <div className="company-tour-empty">
                Đang tải chi tiết booking...
              </div>
            ) : detailError ? (
              <>
                <div className="company-page-alert error">
                  {detailError}
                </div>

                <button
                  type="button"
                  className="company-secondary-button"
                  onClick={closeDetail}
                >
                  Đóng
                </button>
              </>
            ) : (
              <>
                <div className="company-booking-modal-header">
                  <div>
                    <span className="section-eyebrow">
                      BOOKING DETAIL
                    </span>

                    <h2>
                      Booking #
                      {selectedBooking?.id}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="company-secondary-button"
                    onClick={closeDetail}
                  >
                    Đóng
                  </button>
                </div>

                <div className="company-booking-detail-grid">
                  <div>
                    <span>Guest ID</span>
                    <strong>
                      #{selectedBooking?.guestId ?? '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Tour ID</span>
                    <strong>
                      #{selectedBooking?.tourId ?? '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Số lượng</span>
                    <strong>
                      {selectedBooking?.quantity ?? '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Đơn giá</span>
                    <strong>
                      {formatCurrency(
                        selectedBooking?.unitPrice,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Tổng tiền</span>
                    <strong>
                      {formatCurrency(
                        selectedBooking?.totalAmount,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Trạng thái</span>
                    <strong>
                      {getStatusConfig(
                        selectedBooking?.status,
                      ).label}
                    </strong>
                  </div>

                  <div>
                    <span>Ngày tạo</span>
                    <strong>
                      {formatDate(
                        selectedBooking?.createdAt,
                      )}
                    </strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
