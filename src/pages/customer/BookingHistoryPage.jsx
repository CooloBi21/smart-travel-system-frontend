import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Receipt,
  Users,
} from 'lucide-react';

import { getMyBookingsApi } from '../../api/bookings.api';
import './customer-pages.css';

function formatPrice(value) {
  return `${new Intl.NumberFormat('vi-VN').format(
    Number(value || 0),
  )} ₫`;
}

function formatDate(value) {
  if (!value) {
    return 'Chưa xác định';
  }

  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStatusLabel(status) {
  switch (status) {
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'COMPLETED':
      return 'Đã hoàn thành';
    default:
      return status || 'Không xác định';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'CONFIRMED':
      return 'status-confirmed';
    case 'PENDING':
      return 'status-pending';
    case 'CANCELLED':
      return 'status-cancelled';
    case 'COMPLETED':
      return 'status-completed';
    default:
      return 'status-default';
  }
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getMyBookingsApi();

        if (cancelled) {
          return;
        }

        const data =
          response?.bookings ||
          response?.data ||
          response ||
          [];

        setBookings(
          Array.isArray(data) ? data : [],
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Không thể tải lịch sử đặt tour.',
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

  return (
    <main className="page-container booking-history-page">
      <div className="page-header">
        <div>
          <span className="section-eyebrow">
            MY BOOKINGS
          </span>

          <h1>Lịch sử đặt tour</h1>

          <p>
            Theo dõi các booking của bạn trên Smart Travel
            System.
          </p>
        </div>
      </div>

      {loading && (
        <div className="state-message">
          Đang tải lịch sử đặt tour...
        </div>
      )}

      {!loading && error && (
        <div className="error-state">
          <h2>Không thể tải lịch sử đặt tour</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        bookings.length === 0 && (
          <div className="empty-state">
            <Receipt size={42} />

            <h2>Chưa có booking</h2>

            <p>
              Bạn chưa thực hiện đặt tour nào.
            </p>

            <Link
              to="/explore"
              className="primary-button"
            >
              Khám phá tour
            </Link>
          </div>
        )}

      {!loading &&
        !error &&
        bookings.length > 0 && (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article
                className="booking-card"
                key={booking.id}
              >
                <div className="booking-card-header">
                  <div>
                    <span className="booking-label">
                      Booking #{booking.id}
                    </span>

                    <h2>
                      Tour departure #
                      {booking.tourDepartureId}
                    </h2>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      booking.status,
                    )}`}
                  >
                    {getStatusLabel(
                      booking.status,
                    )}
                  </span>
                </div>

                <div className="booking-info-grid">
                  <div>
                    <Users size={18} />

                    <span>
                      {booking.guestCount} khách
                    </span>
                  </div>

                  <div>
                    <CreditCard size={18} />

                    <span>
                      {formatPrice(
                        booking.totalAmount,
                      )}
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={18} />

                    <span>
                      {formatDate(
                        booking.createdAt,
                      )}
                    </span>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <span>
                    Đơn giá:{' '}
                    <strong>
                      {formatPrice(
                        booking.unitPrice,
                      )}
                    </strong>
                  </span>

                  <div className="booking-actions">
                    {booking.status ===
                      'PENDING' && (
                      <Link
                        to={`/payment/${booking.id}`}
                        className="primary-button"
                      >
                        Thanh toán
                        <ArrowRight size={16} />
                      </Link>
                    )}

                    <Link
                      to={`/payment/${booking.id}`}
                      className="secondary-button"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
    </main>
  );
}
