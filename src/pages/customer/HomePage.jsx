import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { getPublicToursApi } from '../../api/tours.api';
import TourCard from '../../components/tours/TourCard';
import PageContainer from '../../components/layout/PageContainer';

export default function HomePage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);

        const response =
          await getPublicToursApi();

        const data =
          response?.data ||
          response?.tours ||
          response ||
          [];

        setTours(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(
          'Không thể tải danh sách tour.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  return (
    <PageContainer>
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">
            SMART TRAVEL SYSTEM
          </span>

          <h1>
            Khám phá hành trình
            <br />
            <span>phù hợp với bạn</span>
          </h1>

          <p>
            Tìm kiếm tour du lịch, khám phá điểm đến
            và nhận gợi ý được cá nhân hóa dựa trên
            nhu cầu của bạn.
          </p>

          <div className="hero-actions">
            <Link
              to="/explore"
              className="primary-button"
            >
              <Search size={18} />
              Khám phá tour
            </Link>

            <Link
              to="/recommendations"
              className="secondary-button"
            >
              <Sparkles size={18} />
              Gợi ý cho tôi
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              EXPLORE
            </span>

            <h2>Tour nổi bật</h2>

            <p>
              Những hành trình đang được cung cấp
              trên Smart Travel.
            </p>
          </div>

          <Link
            to="/explore"
            className="section-link"
          >
            Xem tất cả
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading && (
          <div className="state-message">
            Đang tải tour...
          </div>
        )}

        {!loading && error && (
          <div className="state-message error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          tours.length === 0 && (
            <div className="state-message">
              Chưa có tour đang được công bố.
            </div>
          )}

        {!loading &&
          !error &&
          tours.length > 0 && (
            <div className="tour-grid">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                />
              ))}
            </div>
          )}
      </section>
    </PageContainer>
  );
}
