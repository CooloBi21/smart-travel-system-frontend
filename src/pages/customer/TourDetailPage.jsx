import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from 'lucide-react';

import {
  getPublicDeparturesApi,
  getPublicTourApi,
} from '../../api/tours.api';

import './customer-pages.css';

function formatPrice(value) {
  if (value === null || value === undefined) {
    return 'Liên hệ';
  }

  return (
    new Intl.NumberFormat('vi-VN').format(Number(value)) +
    ' ₫'
  );
}

function formatDate(value) {
  if (!value) {
    return 'Chưa xác định';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export default function TourDetailPage() {
  const { companySlug, tourSlug } = useParams();

  const [tour, setTour] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [selectedDepartureId, setSelectedDepartureId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadTour = async () => {
      setLoading(true);
      setError('');
      setNotFound(false);
      setTour(null);
      setDepartures([]);
      setSelectedDepartureId('');

      try {
        const [
          tourResponse,
          departuresResponse,
        ] = await Promise.all([
          getPublicTourApi(companySlug, tourSlug),
          getPublicDeparturesApi(
            companySlug,
            tourSlug,
          ),
        ]);

        if (cancelled) {
          return;
        }

        const tourData =
          tourResponse?.tour || tourResponse;

        const departureData =
          departuresResponse?.departures ||
          departuresResponse ||
          [];

        setTour(tourData);

        setDepartures(
          Array.isArray(departureData)
            ? departureData
            : [],
        );

        if (departureData?.length) {
          setSelectedDepartureId(
            String(departureData[0].id),
          );
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Không thể tải thông tin tour.',
        );
        setNotFound(requestError.response?.status === 404);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTour();

    return () => {
      cancelled = true;
    };
  }, [companySlug, tourSlug]);

  const selectedDeparture = useMemo(
    () =>
      departures.find(
        (departure) =>
          String(departure.id) ===
          String(selectedDepartureId),
      ),
    [departures, selectedDepartureId],
  );

  if (loading) {
    return (
      <main className="page-container">
        <div className="page-loading">
          Đang tải thông tin tour...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <div className="error-state">
          <h1>{notFound ? 'Không tìm thấy tour' : 'Không thể tải tour'}</h1>
          <p>{error}</p>

          <Link to="/explore">
            Quay lại khám phá tour
          </Link>
        </div>
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <h1>Không tìm thấy tour</h1>

          <Link to="/explore">
            Quay lại khám phá
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container tour-detail-page">
      <Link
        to="/explore"
        className="back-link"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách tour
      </Link>

      <section className="tour-detail-hero">
        <div className="tour-detail-image">
          <span>
            {tour.travelStyle || 'TRAVEL'}
          </span>
        </div>

        <div className="tour-detail-content">
          <div className="tour-detail-badge">
            {tour.categoryCode || 'TOUR'}
          </div>

          <h1>{tour.title}</h1>

          <p className="tour-detail-description">
            {tour.description ||
              'Chưa có mô tả cho tour này.'}
          </p>

          <div className="tour-detail-meta">
            <span>
              <MapPin size={18} />
              {tour.destinationName ||
                'Chưa xác định'}
            </span>

            <span>
              <Clock3 size={18} />
              {tour.durationDays || '--'} ngày
            </span>

            <span>
              Công ty:{' '}
              {tour.companyName || companySlug}
            </span>
          </div>

          {tour.cancellationPolicy && (
            <div className="tour-policy">
              <strong>Chính sách hủy:</strong>

              <p>
                {tour.cancellationPolicy}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="departure-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              LỊCH KHỞI HÀNH
            </span>

            <h2>Chọn ngày khởi hành</h2>
          </div>
        </div>

        {departures.length === 0 ? (
          <div className="empty-state">
            Hiện chưa có lịch khởi hành cho
            tour này.
          </div>
        ) : (
          <div className="departure-list">
            {departures.map((departure) => {
              const isSelected =
                String(departure.id) ===
                String(selectedDepartureId);

              return (
                <button
                  key={departure.id}
                  type="button"
                  aria-pressed={isSelected}
                  className={`departure-card ${
                    isSelected
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedDepartureId(
                      String(departure.id),
                    )
                  }
                >
                  <div>
                    <CalendarDays size={20} />

                    <strong>
                      {formatDate(
                        departure.departureDate,
                      )}
                    </strong>
                  </div>

                  <div>
                    <Users size={20} />

                    <span>
                      {departure.availableSlots !== null &&
                      departure.availableSlots !== undefined
                        ? `Còn ${departure.availableSlots} chỗ`
                        : 'Số chỗ còn lại chưa được cung cấp'}
                    </span>
                  </div>

                  <strong className="departure-price">
                    {formatPrice(
                      departure.pricePerPerson,
                    )}
                  </strong>

                  <span className="departure-status">
                    {departure.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedDeparture && (
        <section className="booking-cta">
          <div>
            <span>Ngày đã chọn</span>

            <strong>
              {formatDate(
                selectedDeparture.departureDate,
              )}
            </strong>
          </div>

          <div>
            <span>Giá / người</span>

            <strong>
              {formatPrice(
                selectedDeparture.pricePerPerson,
              )}
            </strong>
          </div>

          <Link
            to={`/tours/${companySlug}/${tourSlug}/booking?departureId=${selectedDeparture.id}`}
            className="primary-button"
          >
            Đặt tour
          </Link>
        </section>
      )}
    </main>
  );
}
