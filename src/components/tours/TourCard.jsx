import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import './tour-card.css';

export default function TourCard({ tour }) {
  const {
    companySlug,
    slug,
    title,
    description,
    durationDays,
    travelStyle,
    destinationName,
    categoryCode,
    minPrice,
  } = tour;

  return (
    <article className="tour-card">
      <div className="tour-card-image">
        <div className="tour-card-placeholder">
          <MapPin size={34} strokeWidth={1.6} />
          <span>{destinationName || 'Điểm đến'}</span>
        </div>

        {travelStyle && (
          <span className="tour-card-badge">
            <Sparkles size={13} />
            {travelStyle}
          </span>
        )}
      </div>

      <div className="tour-card-content">
        <div className="tour-card-category">
          {categoryCode || 'TOUR'}
        </div>

        <h3>{title}</h3>

        <p className="tour-card-description">
          {description ||
            'Khám phá hành trình du lịch được tuyển chọn trên Smart Travel.'}
        </p>

        <div className="tour-card-meta">
          {destinationName && (
            <span>
              <MapPin size={15} />
              {destinationName}
            </span>
          )}

          {durationDays && (
            <span>
              <Clock3 size={15} />
              {durationDays} ngày
            </span>
          )}
        </div>

        <div className="tour-card-footer">
          <div className="tour-card-price">
            <small>Giá từ</small>

            <strong>
              {minPrice
                ? `${Number(minPrice).toLocaleString('vi-VN')} ₫`
                : 'Liên hệ'}
            </strong>
          </div>

          <Link
            to={`/tours/${companySlug}/${slug}`}
            className="tour-card-link"
          >
            Xem tour
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
