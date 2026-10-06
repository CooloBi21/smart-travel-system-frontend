import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
} from 'lucide-react';
import { getBookingApi } from '../../api/bookings.api';
import {
  createPaymentApi,
  simulatePaymentApi,
} from '../../api/payments.api';
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

function formatBookingStatus(status) {
  const statusMap = {
    PENDING: 'Chờ thanh toán',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy',
    COMPLETED: 'Hoàn thành',
  };

  return statusMap[status] || status || 'Chưa xác định';
}

export default function PaymentPage() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBooking = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getBookingApi(bookingId);

        if (cancelled) {
          return;
        }

        const bookingData =
          response?.booking || response;

        setBooking(bookingData);

        if (bookingData?.status === 'CONFIRMED') {
          setSuccess(true);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Không thể tải thông tin booking.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handlePayment = async () => {
    if (!booking || processing) {
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess(false);

      const paymentResponse = await createPaymentApi({
        bookingId: Number(booking.id),
      });

      const createdPayment =
        paymentResponse?.payment ||
        paymentResponse;

      setPayment(createdPayment);

      const paymentId = createdPayment?.id;

      if (!paymentId) {
        throw new Error(
          'Không nhận được payment id từ backend.',
        );
      }

      const simulatedResponse =
        await simulatePaymentApi(
          paymentId,
          'SUCCESS',
        );

      const simulatedPayment =
        simulatedResponse?.payment ||
        simulatedResponse;

      setPayment(simulatedPayment);

      const refreshedBookingResponse =
        await getBookingApi(booking.id);

      const refreshedBooking =
        refreshedBookingResponse?.booking ||
        refreshedBookingResponse;

      setBooking(refreshedBooking);

      setSuccess(
        refreshedBooking?.status === 'CONFIRMED',
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Thanh toán thất bại. Vui lòng thử lại.',
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-loading">
          Đang tải thông tin thanh toán...
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="page-container">
        <div className="error-state">
          <h1>Không thể tải booking</h1>
          <p>{error}</p>

          <Link to="/my-bookings">
            Xem lịch sử booking
          </Link>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <h1>Không tìm thấy booking</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container payment-page">
      <Link
        to="/my-bookings"
        className="back-link"
      >
        <ArrowLeft size={18} />
        Lịch sử booking
      </Link>

      <div className="payment-layout">
        <section className="payment-main">
          {success ? (
            <div className="payment-success">
              <CheckCircle2
                size={64}
                className="payment-success-icon"
              />

              <h1>Thanh toán thành công</h1>

              <p>
                Booking của bạn đã được xác nhận.
              </p>

              <div className="payment-success-status">
                <span>Booking</span>
                <strong>#{booking.id}</strong>
              </div>

              <div className="payment-success-status">
                <span>Trạng thái</span>
                <strong>
                  {formatBookingStatus(
                    booking.status,
                  )}
                </strong>
              </div>

              <Link
                to="/my-bookings"
                className="primary-button"
              >
                Xem booking của tôi
              </Link>
            </div>
          ) : (
            <>
              <div className="section-heading">
                <span className="section-eyebrow">
                  PAYMENT
                </span>

                <h1>Thanh toán</h1>

                <p>
                  Kiểm tra thông tin trước khi xác nhận
                  thanh toán.
                </p>
              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <div className="payment-method-card">
                <div className="payment-method-icon">
                  <CreditCard size={24} />
                </div>

                <div>
                  <strong>
                    Thanh toán mô phỏng
                  </strong>

                  <p>
                    Đây là phương thức thanh toán mô
                    phỏng phục vụ prototype tốt nghiệp.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="primary-button payment-button"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="spin"
                    />
                    Đang xử lý thanh toán...
                  </>
                ) : (
                  'Xác nhận thanh toán'
                )}
              </button>
            </>
          )}
        </section>

        <aside className="payment-summary">
          <h2>Thông tin booking</h2>

          <div className="summary-row">
            <span>Mã booking</span>
            <strong>#{booking.id}</strong>
          </div>

          <div className="summary-row">
            <span>Số khách</span>
            <strong>{booking.guestCount}</strong>
          </div>

          <div className="summary-row">
            <span>Giá / người</span>
            <strong>
              {formatPrice(booking.unitPrice)}
            </strong>
          </div>

          <div className="summary-row total">
            <span>Tổng tiền</span>
            <strong>
              {formatPrice(booking.totalAmount)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Trạng thái</span>
            <strong>
              {formatBookingStatus(
                booking.status,
              )}
            </strong>
          </div>

          {booking.createdAt && (
            <div className="summary-row">
              <span>Ngày tạo</span>
              <strong>
                {formatDate(booking.createdAt)}
              </strong>
            </div>
          )}

          {payment && (
            <div className="summary-payment">
              <span>Payment ID</span>
              <strong>#{payment.id}</strong>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
