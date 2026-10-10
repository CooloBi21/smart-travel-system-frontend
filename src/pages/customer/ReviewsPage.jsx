import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  MessageSquare,
  Star,
} from 'lucide-react';

import {
  getMyReviewsApi,
  updateReviewApi,
} from '../../api/reviews.api';
import './customer-pages.css';

function formatDate(value) {
  if (!value) {
    return 'Chưa xác định';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Chưa xác định';
  }

  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getSentimentLabel(label) {
  switch (label) {
    case 'POSITIVE':
      return 'Tích cực';
    case 'NEGATIVE':
      return 'Tiêu cực';
    case 'NEUTRAL':
      return 'Trung lập';
    default:
      return 'Chưa phân tích';
  }
}

function getSentimentClass(label) {
  switch (label) {
    case 'POSITIVE':
      return 'status-confirmed';
    case 'NEGATIVE':
      return 'status-cancelled';
    case 'NEUTRAL':
      return 'status-pending';
    default:
      return 'status-default';
  }
}

function formatConfidence(value) {
  if (value === null || value === undefined) {
    return 'Chưa xác định';
  }

  return `${(Number(value) * 100).toFixed(1)}%`;
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={18}
      fill={index < Number(rating) ? 'currentColor' : 'none'}
      aria-hidden="true"
    />
  ));
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [savingReviewId, setSavingReviewId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getMyReviewsApi();

        if (cancelled) {
          return;
        }

        const data = Array.isArray(response)
          ? response
          : response?.reviews;

        setReviews(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            'Không thể tải danh sách đánh giá.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const beginEditing = (review) => {
    setEditingReviewId(review.id);
    setEditRating(Number(review.rating));
    setEditComment(review.comment || '');
    setActionError('');
    setActionSuccess('');
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setActionError('');
  };

  const handleSaveReview = async (reviewId) => {
    const rating = Number(editRating);
    const comment = editComment.trim();

    setActionError('');
    setActionSuccess('');

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setActionError('Đánh giá phải từ 1 đến 5 sao.');
      return;
    }

    if (!comment) {
      setActionError('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    try {
      setSavingReviewId(reviewId);

      const response = await updateReviewApi(reviewId, {
        rating,
        comment,
      });
      const updatedReview = response?.review || response;

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === reviewId
            ? { ...review, ...updatedReview }
            : review,
        ),
      );
      setEditingReviewId(null);
      setActionSuccess('Đánh giá đã được cập nhật thành công.');
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          'Không thể cập nhật đánh giá.',
      );
    } finally {
      setSavingReviewId(null);
    }
  };

  return (
    <main className="page-container reviews-page">
      <div className="page-header">
        <div>
          <span className="section-eyebrow">MY REVIEWS</span>

          <h1>Đánh giá của tôi</h1>

          <p>
            Xem và chỉnh sửa đánh giá bạn đã gửi cho các tour.
          </p>
        </div>

        <Link to="/my-bookings" className="secondary-button">
          <ArrowLeft size={16} />
          Lịch sử booking
        </Link>
      </div>

      {actionSuccess && (
        <div className="reviews-feedback success" role="status">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="reviews-feedback error" role="alert">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="state-message" role="status">
          Đang tải đánh giá...
        </div>
      )}

      {!loading && error && (
        <div className="error-state" role="alert">
          <h2>Không thể tải đánh giá</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="empty-state reviews-empty">
          <MessageSquare size={42} />

          <h2>Chưa có đánh giá</h2>

          <p>
            Bạn có thể đánh giá booking đã hoàn thành và chưa có đánh giá
            trong lịch sử booking.
          </p>

          <Link to="/my-bookings" className="primary-button">
            Xem booking
          </Link>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="booking-list">
          {reviews.map((review) => {
            const isEditing = editingReviewId === review.id;
            const isSaving = savingReviewId === review.id;

            return (
              <article className="booking-card review-card" key={review.id}>
                <div className="booking-card-header">
                  <div>
                    <span className="booking-label">
                      Review #{review.id} · Booking #{review.bookingId}
                    </span>

                    <h2>
                      {review.tourTitle || `Tour #${review.tourId}`}
                    </h2>
                  </div>

                  <div className="review-card-actions">
                    <span
                      className={`status-badge ${getSentimentClass(
                        review.sentimentLabel,
                      )}`}
                    >
                      {getSentimentLabel(review.sentimentLabel)}
                    </span>

                    {!isEditing && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => beginEditing(review)}
                      >
                        <Edit3 size={16} />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>

                <div className="booking-info-grid">
                  <div className="review-rating-display">
                    <Star size={18} aria-hidden="true" />
                    <span className="review-stars">
                      {renderStars(review.rating)}
                    </span>
                    <strong>{review.rating}/5</strong>
                  </div>

                  <div>
                    <CalendarDays size={18} />
                    <span>Ngày khởi hành: {formatDate(review.departureDate)}</span>
                  </div>

                  <div>
                    <CalendarDays size={18} />
                    <span>Ngày đánh giá: {formatDate(review.createdAt)}</span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="review-form">
                    <h3>Chỉnh sửa đánh giá</h3>

                    <div className="review-rating">
                      <label htmlFor={`review-rating-${review.id}`}>
                        Số sao
                      </label>
                      <select
                        id={`review-rating-${review.id}`}
                        value={editRating}
                        onChange={(event) =>
                          setEditRating(Number(event.target.value))
                        }
                        disabled={isSaving}
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} sao
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="review-comment">
                      <label htmlFor={`review-comment-${review.id}`}>
                        Nội dung đánh giá
                      </label>
                      <textarea
                        id={`review-comment-${review.id}`}
                        value={editComment}
                        onChange={(event) =>
                          setEditComment(event.target.value)
                        }
                        maxLength={5000}
                        rows={4}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="booking-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleSaveReview(review.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="review-content">
                    <p>{review.comment}</p>
                  </div>
                )}

                <div className="booking-card-footer review-analysis-footer">
                  <span>
                    Độ tin cậy:{' '}
                    <strong>
                      {formatConfidence(review.sentimentConfidence)}
                    </strong>
                  </span>

                  <span>
                    Model:{' '}
                    <strong>
                      {review.sentimentModelVersion || 'Chưa xác định'}
                    </strong>
                  </span>
                </div>

                {review.sentimentAnalyzedAt && (
                  <div className="review-analysis-meta">
                    Phân tích cảm xúc: {formatDate(review.sentimentAnalyzedAt)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
