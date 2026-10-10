import { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  MapPin,
  Users,
} from 'lucide-react';
import {
  getPublicDeparturesApi,
  getPublicTourApi,
} from '../../api/tours.api';
import { createBookingApi } from '../../api/bookings.api';
import { useAuth } from '../../context/useAuth';
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

export default function BookingPage() {
  const { companySlug, tourSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const departureId = searchParams.get('departureId');

  const [tour, setTour] = useState(null);
  const [departure, setDeparture] = useState(null);

  const [guestCount, setGuestCount] = useState(1);
  const [contactName, setContactName] = useState(
    user?.fullName || '',
  );
  const [contactEmail, setContactEmail] = useState(
    user?.email || '',
  );
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBookingData = async () => {
      if (!departureId) {
        setError('Thiếu lịch khởi hành.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [tourResponse, departuresResponse] = await Promise.all([
          getPublicTourApi(companySlug, tourSlug),
          getPublicDeparturesApi(companySlug, tourSlug),
        ]);

        if (cancelled) {
          return;
        }

        const tourData = tourResponse?.tour || tourResponse;
        const departureData =
          departuresResponse?.departures ||
          departuresResponse ||
          [];

        const selectedDeparture = departureData.find(
          (item) => String(item.id) === String(departureId),
        );

        setTour(tourData);
        setDeparture(selectedDeparture || null);

        if (!selectedDeparture) {
          setError(
            'Không tìm thấy lịch khởi hành được chọn.',
          );
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Không thể tải thông tin đặt tour.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookingData();

    return () => {
      cancelled = true;
    };
  }, [companySlug, tourSlug, departureId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!departure) {
      setError('Vui lòng chọn lịch khởi hành hợp lệ.');
      return;
    }

    const normalizedGuestCount = Number(guestCount);

    if (
      !Number.isInteger(normalizedGuestCount) ||
      normalizedGuestCount < 1
    ) {
      setError('Số lượng khách phải từ 1 người trở lên.');
      return;
    }

    const availableSlots =
      departure?.availableSlots ??
      departure?.capacity;

    if (
      availableSlots !== undefined &&
      availableSlots !== null &&
      normalizedGuestCount > Number(availableSlots)
    ) {
      setError(
        `Số lượng khách không được vượt quá ${availableSlots} người còn trống.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const booking = await createBookingApi({
        tourDepartureId: Number(departure.id),
        guestCount: normalizedGuestCount,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        specialRequest: specialRequest.trim() || undefined,
      });

      const bookingData = booking?.booking || booking;

      navigate(`/payment/${bookingData.id}`, {
        state: {
          tourTitle: tour.title,
          companyName: tour.companyName,
          departureDate: departure.departureDate,
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Không thể tạo booking. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <h1>Đăng nhập để đặt tour</h1>
          <p>
            Bạn cần đăng nhập tài khoản khách hàng trước khi
            đặt tour.
          </p>

          <Link to="/auth" className="primary-button">
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-loading">
          Đang tải thông tin đặt tour...
        </div>
      </main>
    );
  }

  if (error && (!tour || !departure)) {
    return (
      <main className="page-container">
        <div className="error-state">
          <h1>Không thể đặt tour</h1>
          <p>{error}</p>

          <Link to={`/tours/${companySlug}/${tourSlug}`}>
            Quay lại tour
          </Link>
        </div>
      </main>
    );
  }

  const totalPreview =
    Number(departure?.pricePerPerson || 0) *
    Number(guestCount || 1);

  return (
    <main className="page-container booking-page">
      <Link
        to={`/tours/${companySlug}/${tourSlug}`}
        className="back-link"
      >
        <ArrowLeft size={18} />
        Quay lại tour
      </Link>

      <div className="booking-layout">
        <section className="booking-form-section">
          <div className="section-heading">
            <span className="section-eyebrow">BOOKING</span>
            <h1>Thông tin đặt tour</h1>
            <p>
              Điền thông tin liên hệ để hoàn tất yêu cầu đặt
              tour.
            </p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            <label>
              Họ và tên
              <input
                type="text"
                value={contactName}
                onChange={(event) =>
                  setContactName(event.target.value)
                }
                required
                placeholder="Nguyễn Văn A"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={contactEmail}
                onChange={(event) =>
                  setContactEmail(event.target.value)
                }
                required
                placeholder="email@example.com"
              />
            </label>

            <label>
              Số điện thoại
              <input
                type="tel"
                value={contactPhone}
                onChange={(event) =>
                  setContactPhone(event.target.value)
                }
                required
                placeholder="0901234567"
              />
            </label>

            <label>
              Số lượng khách
              <input
                type="number"
                min="1"
                max={ departure?.availableSlots ?? departure?.capacity ?? undefined }
                value={guestCount}
                onChange={(event) =>
                  setGuestCount(
                    Math.max(
                      1,
                      Number(event.target.value) || 1,
                    ),
                  )
                }
                required
              />
            </label>

            <label>
              Yêu cầu đặc biệt
              <textarea
                value={specialRequest}
                onChange={(event) =>
                  setSpecialRequest(event.target.value)
                }
                rows="4"
                placeholder="Ví dụ: yêu cầu ăn chay, ghi chú..."
              />
            </label>

            <button
              type="submit"
              className="primary-button booking-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="spin"
                  />
                  Đang tạo booking...
                </>
              ) : (
                'Tiếp tục thanh toán'
              )}
            </button>
          </form>
        </section>

        <aside className="booking-summary">
          <div className="booking-summary-image">
            <span>{tour?.travelStyle || 'TOUR'}</span>
          </div>

          <h2>{tour?.title}</h2>

          <div className="booking-summary-item">
            <MapPin size={18} />
            <span>
              {tour?.destinationName || 'Chưa xác định'}
            </span>
          </div>

          <div className="booking-summary-item">
            <CalendarDays size={18} />
            <span>
              {formatDate(departure?.departureDate)}
            </span>
          </div>

          <div className="booking-summary-item">
            <Users size={18} />
            <span>{guestCount} khách</span>
          </div>

          <div className="booking-summary-price">
            <span>Tạm tính</span>
            <strong>{formatPrice(totalPreview)}</strong>
          </div>

          <p className="booking-note">
            Giá cuối cùng được backend xác định theo lịch
            khởi hành hiện tại.
          </p>
        </aside>
      </div>
    </main>
  );
}
