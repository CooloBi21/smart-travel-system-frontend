import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Receipt,
  Star,
  Users,
} from 'lucide-react';

import { getMyBookingsApi } from '../../api/bookings.api';
import {
  createReviewApi,
  getMyReviewsApi,
} from '../../api/reviews.api';
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

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

const bookingTabs = [
  {
    id: 'upcoming',
    label: 'Upcoming',
    statuses: ['PENDING', 'CONFIRMED'],
  },
  {
    id: 'completed',
    label: 'Completed',
    statuses: ['COMPLETED'],
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    statuses: ['CANCELLED'],
  },
];

function getPaymentStatusLabel(status) {
  switch (status) {
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'SUCCESS':
      return 'Đã thanh toán';
    case 'FAILED':
      return 'Thanh toán thất bại';
    case 'CANCELLED':
      return 'Đã hủy thanh toán';
    default:
      return status;
  }
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
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewedBookingIds, setReviewedBookingIds] =
    useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewBookingId, setReviewBookingId] =
    useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const activeBookingTab = bookingTabs.find(
    (tab) => tab.id === activeTab,
  );
  const filteredBookings = bookings.filter((booking) =>
    activeBookingTab.statuses.includes(booking.status),
  );

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError('');

        const [response, reviewsResponse] =
          await Promise.all([
            getMyBookingsApi(),
            getMyReviewsApi(),
          ]);

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

        const reviewsData = Array.isArray(reviewsResponse)
          ? reviewsResponse
          : [];

        const reviewedIds = new Set(
          reviewsData.map((review) =>
            Number(review.bookingId),
          ),
        );

        setReviewedBookingIds(reviewedIds);
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

  const handleSubmitReview = async (bookingId) => {
    try {
      setReviewLoading(true);
      setReviewError('');
      setReviewSuccess('');

      const normalizedRating = Number(reviewRating);
      const normalizedComment = reviewComment.trim();

      if (
        !Number.isInteger(normalizedRating) ||
        normalizedRating < 1 ||
        normalizedRating > 5
      ) {
        setReviewError('Đánh giá phải từ 1 đến 5 sao.');
        return;
      }

      if (!normalizedComment) {
        setReviewError('Vui lòng nhập nội dung đánh giá.');
        return;
      }

      await createReviewApi({
        bookingId: Number(bookingId),
        rating: normalizedRating,
        comment: normalizedComment,
      });

      setReviewedBookingIds((previousIds) =>
        new Set(previousIds).add(Number(bookingId)),
      );
      setReviewSuccess(
        'Đánh giá đã được gửi thành công.',
      );
      setReviewComment('');
      setReviewRating(5);
      setReviewBookingId(null);
    } catch (requestError) {
      setReviewError(
        requestError.response?.data?.message ||
          'Không thể gửi đánh giá.',
      );
    } finally {
      setReviewLoading(false);
    }
  };

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

        <Link
          to="/my-reviews"
          className="secondary-button"
        >
          <MessageSquare size={16} />
          Đánh giá của tôi
        </Link>
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

      {!loading && !error && (
        <>
          <div className="booking-tabs" role="tablist" aria-label="Lọc booking">
            {bookingTabs.map((tab) => {
              const count = bookings.filter((booking) =>
                tab.statuses.includes(booking.status),
              ).length;

              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`booking-tab ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <Receipt size={42} />

              <h2>Chưa có booking</h2>

              <p>Bạn chưa thực hiện đặt tour nào.</p>

              <Link
                to="/explore"
                className="primary-button"
              >
                Khám phá tour
              </Link>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="empty-state">
              <Receipt size={42} />
              <h2>Không có booking {activeBookingTab.label}</h2>
              <p>Booking thuộc trạng thái này sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="booking-list">
            {reviewSuccess && (
              <p className="state-message">
                {reviewSuccess}
              </p>
            )}

            {filteredBookings.map((booking) => (
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
                      {booking.tourTitle ||
                        'Tên tour chưa có trong dữ liệu booking'}
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
                    <CalendarDays size={18} />

                    <span>
                      Ngày khởi hành:{' '}
                      {booking.departureDate
                        ? formatDate(booking.departureDate)
                        : 'Chưa có trong dữ liệu booking'}
                    </span>
                  </div>

                  <div>
                    <Users size={18} />

                    <span>
                      {booking.guestCount} khách
                    </span>
                  </div>

                  <div>
                    <CreditCard size={18} />

                    <span>
                      Tổng tiền: {formatPrice(booking.totalAmount)}
                    </span>
                  </div>

                  {typeof booking.paymentStatus === 'string' &&
                    booking.paymentStatus && (
                      <div>
                        <CreditCard size={18} />
                        <span>
                          Thanh toán:{' '}
                          {getPaymentStatusLabel(booking.paymentStatus)}
                        </span>
                      </div>
                    )}
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
                    {booking.status === 'COMPLETED' &&
                      !reviewedBookingIds.has(
                        Number(booking.id),
                      ) && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setReviewBookingId(booking.id);
                          setReviewError('');
                          setReviewSuccess('');
                          setReviewRating(5);
                          setReviewComment('');
                        }}
                      >
                        <Star size={16} />
                        Đánh giá
                      </button>
                    )}

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

                {reviewBookingId === booking.id && (
                  <div className="review-form">
                    <h3>Đánh giá tour</h3>

                    <div className="review-rating">
                      <label htmlFor={`rating-${booking.id}`}>
                        Số sao
                      </label>

                      <select
                        id={`rating-${booking.id}`}
                        value={reviewRating}
                        onChange={(event) =>
                          setReviewRating(Number(event.target.value))
                        }
                        disabled={reviewLoading}
                      >
                        <option value={5}>5 sao</option>
                        <option value={4}>4 sao</option>
                        <option value={3}>3 sao</option>
                        <option value={2}>2 sao</option>
                        <option value={1}>1 sao</option>
                      </select>
                    </div>

                    <div className="review-comment">
                      <label htmlFor={`comment-${booking.id}`}>
                        Nội dung đánh giá
                      </label>

                      <textarea
                        id={`comment-${booking.id}`}
                        value={reviewComment}
                        onChange={(event) =>
                          setReviewComment(event.target.value)
                        }
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        maxLength={5000}
                        rows={4}
                        disabled={reviewLoading}
                      />
                    </div>

                    {reviewError && (
                      <p className="error-state">
                        {reviewError}
                      </p>
                    )}

                    <div className="booking-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleSubmitReview(booking.id)
                        }
                        disabled={reviewLoading}
                      >
                        {reviewLoading
                          ? 'Đang gửi...'
                          : 'Gửi đánh giá'}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setReviewBookingId(null);
                          setReviewError('');
                        }}
                        disabled={reviewLoading}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
