import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Clock3,
  Wallet,
  ArrowRight,
} from 'lucide-react';

import { getRecommendationsApi } from '../../api/recommendations.api';
import './customer-pages.css';

function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return 'Liên hệ';
  }

  return (
    `${Number(value).toLocaleString('vi-VN')} ₫`
  );
}

function getTourFromRecommendation(item) {
  return item?.tour || item?.tourDeparture?.tour || item;
}

function getRecommendationScore(item) {
  return (
    item?.breakdown?.finalScore ??
    item?.finalScore ??
    item?.score ??
    item?.recommendationScore ??
    null
  );
}

function getDestination(tour) {
  return (
    tour?.destination?.name ||
    tour?.destinationName ||
    tour?.destination ||
    'Chưa cập nhật'
  );
}

function getDuration(tour) {
  return (
    tour?.durationDays ??
    tour?.duration ??
    null
  );
}

function getPrice(tour) {
  return (
    tour?.minPrice ??
    tour?.sellingPrice ??
    tour?.price ??
    tour?.unitPrice ??
    null
  );
}

export default function RecommendationPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadRecommendations() {
      try {
        setLoading(true);
        setError('');

        const response = await getRecommendationsApi();

        if (!mounted) {
          return;
        }

        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.recommendations)
              ? response.recommendations
              : [];

        setRecommendations(items);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              'Không thể tải gợi ý tour.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="page-container recommendation-page">
      <section className="recommendation-hero">
        <div>
          <div className="recommendation-title">
            <Sparkles size={24} />
            <span>SMART RECOMMENDATION</span>
          </div>

          <h1>Tour được gợi ý dành cho bạn</h1>

          <p>
            Hệ thống phân tích sở thích, ngân sách, thời lượng
            và lịch sử tương tác để tìm những tour phù hợp.
          </p>
        </div>
      </section>

      {loading && (
        <div className="state-message">
          <Sparkles size={24} />
          <p>Đang phân tích và tải gợi ý...</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-message error-state">
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        recommendations.length === 0 && (
          <div className="state-message recommendation-empty">
            <Sparkles size={42} />

            <h2>Chưa có gợi ý phù hợp</h2>

            <p>
              Hãy khám phá thêm các tour để hệ thống có thêm
              dữ liệu cá nhân hóa.
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
        recommendations.length > 0 && (
          <section className="recommendation-grid">
            {recommendations.map((item, index) => {
              const tour = getTourFromRecommendation(item);
              const score = getRecommendationScore(item);
              const destination = getDestination(tour);
              const duration = getDuration(tour);
              const price = getPrice(tour);

              const companySlug =
                tour?.companySlug ||
                tour?.company?.slug;

              const tourSlug =
                tour?.slug ||
                tour?.tourSlug;

              const title =
                tour?.title ||
                tour?.name ||
                'Tour du lịch';

              return (
                <article
                  className="recommendation-card"
                  key={item?.id || tour?.id || index}
                >
                  <div className="recommendation-card-top">
                    <span className="recommendation-rank">
                      #{index + 1}
                    </span>

                    {score !== null && (
                      <span className="recommendation-score">
                        Phù hợp{' '}
                        {Math.round(Number(score) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="recommendation-card-body">
                    <div className="recommendation-icon">
                      <Sparkles size={26} />
                    </div>

                    <h2>{title}</h2>

                    <div className="recommendation-meta">
                      <span>
                        <MapPin size={16} />
                        {destination}
                      </span>

                      {duration && (
                        <span>
                          <Clock3 size={16} />
                          {duration} ngày
                        </span>
                      )}

                      {price !== null && (
                        <span>
                          <Wallet size={16} />
                          {formatPrice(price)}
                        </span>
                      )}
                    </div>

                    {item?.reason && (
                      <p className="recommendation-reason">
                        {item.reason}
                      </p>
                    )}
                  </div>

                  {companySlug && tourSlug && (
                    <div className="recommendation-card-footer">
                      <Link
                        to={`/tours/${companySlug}/${tourSlug}`}
                        className="primary-button"
                      >
                        Xem tour
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
    </main>
  );
}
