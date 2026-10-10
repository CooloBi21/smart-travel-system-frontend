import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Landmark,
  LoaderCircle,
  QrCode,
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
    return null;
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

function formatPaymentStatus(status) {
  const statusMap = {
    PENDING: 'Đang chờ thanh toán',
    SUCCESS: 'Đã thanh toán',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
  };

  return statusMap[status] || status || 'Chưa có dữ liệu thanh toán';
}

const paymentMethods = [
  {
    id: 'vnpay',
    label: 'VNPay Demo',
    description: 'Mô phỏng thanh toán qua VNPay.',
    Icon: CreditCard,
  },
  {
    id: 'qr',
    label: 'QR Demo',
    description: 'Mô phỏng thanh toán bằng mã QR.',
    Icon: QrCode,
  },
  {
    id: 'bank-transfer',
    label: 'Bank Transfer Simulation',
    description: 'Mô phỏng chuyển khoản ngân hàng.',
    Icon: Landmark,
  },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const paymentContext = location.state || {};

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('vnpay');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const success = payment?.status === 'SUCCESS';

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
      setBooking(refreshedBooking);

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

  const unavailableValue = 'Chưa có trong dữ liệu booking';
  const tourName = paymentContext.tourTitle || unavailableValue;
  const companyName = paymentContext.companyName || unavailableValue;
  const departureDate =
    formatDate(paymentContext.departureDate) || unavailableValue;
  const bookingDetails = [
    { label: 'Tour', value: tourName },
    { label: 'Công ty', value: companyName },
    { label: 'Ngày khởi hành', value: departureDate },
    { label: 'Số khách', value: booking.guestCount },
    { label: 'Tổng tiền', value: formatPrice(booking.totalAmount) },
    { label: 'Tiền đặt cọc', value: 'API chưa hỗ trợ' },
  ];
  const paymentSucceeded = payment?.status === 'SUCCESS';
  const amountPaid = payment
    ? formatPrice(paymentSucceeded ? payment.amount : 0)
    : 'Chưa có dữ liệu thanh toán';

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

              <div className="payment-success-details">
                <div className="payment-success-status">
                  <span>Mã booking</span>
                  <strong>#{booking.id}</strong>
                </div>

                {bookingDetails
                  .filter(({ label }) => label !== 'Tiền đặt cọc')
                  .map(({ label, value }) => (
                    <div
                      className="payment-success-status"
                      key={label}
                    >
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}

                <div className="payment-success-status">
                  <span>Số tiền đã trả</span>
                  <strong>{amountPaid}</strong>
                </div>

                <div className="payment-success-status">
                  <span>Trạng thái booking</span>
                  <strong>
                    {formatBookingStatus(booking.status)}
                  </strong>
                </div>

                <div className="payment-success-status">
                  <span>Trạng thái thanh toán</span>
                  <strong>
                    {payment
                      ? formatPaymentStatus(payment.status)
                      : 'Chưa có dữ liệu thanh toán'}
                  </strong>
                </div>
              </div>

              <Link
                to="/my-bookings"
                className="primary-button"
              >
                View Booking
              </Link>
            </div>
          ) : booking.status === 'CONFIRMED' ? (
            <div className="payment-unverified">
              <h1>Booking đã được xác nhận</h1>
              <p>
                Chưa có dữ liệu payment để xác minh việc thanh toán.
              </p>
              <div className="payment-success-status">
                <span>Trạng thái booking</span>
                <strong>
                  {formatBookingStatus(booking.status)}
                </strong>
              </div>

              <div className="payment-success-status">
                <span>Trạng thái thanh toán</span>
                <strong>
                  {payment
                    ? formatPaymentStatus(payment.status)
                    : 'Chưa có dữ liệu thanh toán'}
                </strong>
              </div>

              <Link
                to="/my-bookings"
                className="primary-button"
              >
                View Booking
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

              <div className="payment-method-section">
                <h2>Phương thức thanh toán</h2>

                <div className="payment-method-options">
                  {paymentMethods.map(({ id, label, description, Icon }) => (
                    <label
                      className={`payment-method-option ${
                        selectedMethod === id ? 'selected' : ''
                      }`}
                      key={id}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={id}
                        checked={selectedMethod === id}
                        onChange={() => setSelectedMethod(id)}
                        disabled={processing}
                      />
                      <span className="payment-method-icon">
                        <Icon size={22} />
                      </span>
                      <span className="payment-method-copy">
                        <strong>{label}</strong>
                        <span>{description}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <p className="payment-demo-note">
                  Các lựa chọn chỉ minh họa giao diện. Backend hiện xử lý mọi
                  lựa chọn bằng phương thức thanh toán mô phỏng.
                </p>
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
                    Processing...
                  </>
                ) : (
                  `Pay Now — ${formatPrice(booking.totalAmount)}`
                )}
              </button>
            </>
          )}
        </section>

        <aside className="payment-summary">
          <h2>{success ? 'Booking Summary' : 'Summary'}</h2>

          <div className="summary-row">
            <span>Mã booking</span>
            <strong>#{booking.id}</strong>
          </div>

          {bookingDetails.map(({ label, value }) => (
            <div
              className={`summary-row ${
                label === 'Tổng tiền' ? 'total' : ''
              }`}
              key={label}
            >
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}

          <div className="summary-row">
            <span>Trạng thái booking</span>
            <strong>{formatBookingStatus(booking.status)}</strong>
          </div>

          {payment && (
            <div className="summary-payment">
              <span>Trạng thái thanh toán</span>
              <strong>{formatPaymentStatus(payment.status)}</strong>
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
