import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

import { getPublicToursApi } from '../../api/tours.api';
import TourCard from '../../components/tours/TourCard';
import PageContainer from '../../components/layout/PageContainer';

import './customer-pages.css';

export default function ExplorePage() {
  const [tours, setTours] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const response =
          await getPublicToursApi();

        const data =
          response?.data ||
          response?.tours ||
          response ||
          [];

        setTours(
          Array.isArray(data) ? data : [],
        );
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  const filteredTours = useMemo(() => {
    const normalized =
      keyword.trim().toLowerCase();

    if (!normalized) {
      return tours;
    }

    return tours.filter((tour) => {
      const searchable = [
        tour.title,
        tour.description,
        tour.destinationName,
        tour.categoryCode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalized);
    });
  }, [keyword, tours]);

  return (
    <PageContainer>
      <section className="explore-header">
        <div>
          <span className="section-eyebrow">
            EXPLORE
          </span>

          <h1>Khám phá tour du lịch</h1>

          <p>
            Tìm hành trình phù hợp với điểm đến
            và nhu cầu của bạn.
          </p>
        </div>
      </section>

      <section className="search-panel">
        <div className="search-input-wrapper">
          <Search size={19} />

          <input
            value={keyword}
            onChange={(event) =>
              setKeyword(event.target.value)
            }
            placeholder="Tìm kiếm tour, điểm đến..."
          />
        </div>

        <button
          type="button"
          className="filter-button"
        >
          <SlidersHorizontal size={18} />
          Bộ lọc
        </button>
      </section>

      {loading ? (
        <div className="state-message">
          Đang tải tour...
        </div>
      ) : (
        <>
          <div className="results-count">
            {filteredTours.length} tour
          </div>

          {filteredTours.length === 0 ? (
            <div className="state-message">
              Không tìm thấy tour phù hợp.
            </div>
          ) : (
            <div className="tour-grid">
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
