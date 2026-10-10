import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import {
  getCompanyBookingApi,
  getCompanyBookingsApi,
  updateCompanyBookingStatusApi,
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
  COMPLETED: {
    label: 'Đã hoàn thành',
    className: 'confirmed',
    icon: CheckCircle2,
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
  const [reloadKey, setReloadKey] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailBookingId, setDetailBookingId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailReloadKey, setDetailReloadKey] = useState(0);

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
  }, [reloadKey]);

  const statistics = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter(
        (booking) => booking.status === 'CONFIRMED',
      ).length,
      pending: bookings.filter(
        (booking) => booking.status === 'PENDING',
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === 'COMPLETED',
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
        booking.userId,
        booking.tourDepartureId,
        booking.tourId,
        booking.tourTitle,
        booking.departureDate,
        booking.contactName,
        booking.contactEmail,
        booking.contactPhone,
        booking.guestCount,
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

  useEffect(() => {
    if (detailBookingId === null) {
      return undefined;
    }

    let cancelled = false;

    const loadBookingDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError('');

        const response = await getCompanyBookingApi(detailBookingId);

        if (!cancelled) {
          setSelectedBooking(response?.booking || response);
        }
      } catch (requestError) {
        if (!cancelled) {
          setDetailError(
            requestError?.response?.data?.message ||
              'Không thể tải thông tin booking.',
          );
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    };

    loadBookingDetail();

    return () => {
      cancelled = true;
    };
  }, [detailBookingId, detailReloadKey]);

  const handleViewBooking = (bookingId) => {
    setSelectedBooking(null);
    setDetailBookingId(bookingId);
    setDetailLoading(true);
    setDetailError('');
    setActionError('');
    setActionSuccess('');
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    let statusUpdated = false;

    try {
      setActionLoading(true);
      setActionError('');
      setActionSuccess('');

      await updateCompanyBookingStatusApi(bookingId, status);
      statusUpdated = true;

      const [updatedBookings, updatedBookingResponse] =
        await Promise.all([
          getCompanyBookingsApi(),
          getCompanyBookingApi(bookingId),
        ]);

      setBookings(normalizeBookings(updatedBookings));
      setSelectedBooking(
        updatedBookingResponse?.booking || updatedBookingResponse,
      );
      setActionSuccess('Trạng thái booking đã được cập nhật.');
    } catch (err) {
      setActionError(
        statusUpdated
          ? 'Trạng thái đã được cập nhật nhưng không thể tải lại dữ liệu booking.'
          : err?.response?.data?.message ||
              'Không thể cập nhật trạng thái booking.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedBooking(null);
    setDetailBookingId(null);
    setDetailError('');
    setActionError('');
    setActionSuccess('');
  };

  return (
    <PageContainer>
      <section className="section company-page-section company-bookings-page">
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
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Đã hoàn thành</span>
              <strong>{statistics.completed}</strong>
            </div>
          </div>

          <div className="company-tour-stat-card">
            <div className="company-tour-stat-icon">
              <XCircle size={20} />
            </div>

            <div>
              <span>Đã hủy</span>
              <strong>{statistics.cancelled}</strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="company-page-alert error company-booking-feedback">
            {error}
            {!loading && (
              <button
                type="button"
                className="company-secondary-button"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                <RotateCcw size={15} />
                Thử tải lại
              </button>
            )}
          </div>
        )}

        {actionSuccess && (
          <div
            className="company-booking-feedback success"
            role="status"
          >
            {actionSuccess}
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
              placeholder="Tìm mã booking, khách, tour, ngày khởi hành..."
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

              <option value="COMPLETED">
                Đã hoàn thành
              </option>

              <option value="CANCELLED">
                Đã hủy
              </option>
            </select>
          </label>
        </div>

        {loading && (
          <div className="company-booking-loading" role="status">
            <LoaderCircle size={19} className="company-booking-spinner" />
            Đang tải danh sách booking...
          </div>
        )}

        {!loading && !error && (
        <div className="company-tour-table-card">
          <div className="company-tour-table-wrapper">
            <table className="company-tour-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Khách hàng</th>
                  <th>Tour</th>
                  <th>Số khách</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="company-tour-empty"
                    >
                      {bookings.length === 0
                        ? 'Chưa có booking nào.'
                        : 'Không có booking phù hợp với tìm kiếm và bộ lọc.'}
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
                          <div>
                            <strong>{booking.contactName || '—'}</strong>
                            {booking.contactEmail && (
                              <div className="company-booking-secondary-text">
                                {booking.contactEmail}
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <div>
                            <strong>{booking.tourTitle || '—'}</strong>

                            <div className="company-booking-secondary-text">
                              Departure #{booking.tourDepartureId ?? '—'}
                            </div>

                            {booking.departureDate && (
                              <div className="company-booking-secondary-text">
                                Khởi hành: {formatDate(booking.departureDate)}
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          {booking.guestCount ?? '—'}
                        </td>

                        <td>
                          {formatCurrency(
                            booking.totalAmount,
                          )}
                          <div className="company-booking-secondary-text">
                            Tổng tiền booking, chưa xác minh thanh toán
                          </div>
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
                              disabled={detailLoading}
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
        )}
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
                  onClick={() => setDetailReloadKey((key) => key + 1)}
                >
                  <RotateCcw size={15} />
                  Thử lại
                </button>

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
                    <span>Khách hàng</span>
                    <strong>
                      {selectedBooking?.contactName || '—'}
                    </strong>
                  </div>

                  <div>
                    <span>User ID</span>
                    <strong>
                      #{selectedBooking?.userId ?? '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Tour</span>
                    <strong>
                      {selectedBooking?.tourTitle || '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Tour ID</span>
                    <strong>
                      #{selectedBooking?.tourId ?? '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Departure ID</span>
                    <strong>
                      #{selectedBooking?.tourDepartureId ?? '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Ngày khởi hành</span>
                    <strong>
                      {formatDate(selectedBooking?.departureDate)}
                    </strong>
                  </div>

                  <div>
                    <span>Số khách</span>
                    <strong>
                      {selectedBooking?.guestCount ?? '—'}
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
                    <span>Giá departure</span>
                    <strong>
                      {formatCurrency(
                        selectedBooking?.departurePrice,
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
                    <small>
                      Tổng tiền booking; API không cung cấp trạng thái thanh toán.
                    </small>
                  </div>

                  <div>
                    <span>Trạng thái</span>
                    <strong>
                      {getStatusConfig(
                        selectedBooking?.status,
                      ).label}
                    </strong>
                    {selectedBooking?.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleUpdateBookingStatus(
                              selectedBooking.id,
                              'CONFIRMED',
                            )
                          }
                          className="company-primary-button"
                        >
                          {actionLoading && (
                            <LoaderCircle
                              size={15}
                              className="company-booking-spinner"
                            />
                          )}
                          Xác nhận booking
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleUpdateBookingStatus(
                              selectedBooking.id,
                              'CANCELLED',
                            )
                          }
                          className="company-secondary-button"
                        >
                          Hủy booking
                        </button>
                      </>
                    )}

                    {selectedBooking?.status === 'CONFIRMED' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleUpdateBookingStatus(
                              selectedBooking.id,
                              'COMPLETED',
                            )
                          }
                          className="company-primary-button"
                        >
                          {actionLoading && (
                            <LoaderCircle
                              size={15}
                              className="company-booking-spinner"
                            />
                          )}
                          Hoàn tất booking
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleUpdateBookingStatus(
                              selectedBooking.id,
                              'CANCELLED',
                            )
                          }
                          className="company-secondary-button"
                        >
                          Hủy booking
                        </button>
                      </>
                    )}
                  </div>

                  {actionError && (
                    <div className="company-page-alert error" role="alert">
                      {actionError}
                    </div>
                  )}

                  {actionSuccess && (
                    <div
                      className="company-booking-feedback success"
                      role="status"
                    >
                      {actionSuccess}
                    </div>
                  )}

                  <div>
                    <span>Trạng thái departure</span>
                    <strong>
                      {selectedBooking?.departureStatus || '—'}
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

                {selectedBooking?.contactEmail && (
                  <div className="company-booking-contact">
                    <span>Email</span>
                    <strong>{selectedBooking.contactEmail}</strong>
                  </div>
                )}

                {selectedBooking?.contactPhone && (
                  <div className="company-booking-contact">
                    <span>Số điện thoại</span>
                    <strong>{selectedBooking.contactPhone}</strong>
                  </div>
                )}

                {selectedBooking?.specialRequest && (
                  <div className="company-booking-contact">
                    <span>Yêu cầu đặc biệt</span>
                    <strong>{selectedBooking.specialRequest}</strong>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
