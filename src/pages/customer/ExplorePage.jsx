import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

import { getPublicToursApi } from '../../api/tours.api';
import TourCard from '../../components/tours/TourCard';
import PageContainer from '../../components/layout/PageContainer';

import './customer-pages.css';

export default function ExplorePage() {
  const [tours, setTours] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [destinationFilter, setDestinationFilter] = useState('');
  const [travelStyleFilter, setTravelStyleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadTours = async () => {
      try {
        setError('');
        const response =
          await getPublicToursApi();

        const data =
          response?.data ||
          response?.tours ||
          response ||
          [];

        if (!cancelled) {
          setTours(Array.isArray(data) ? data : []);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              'Không thể tải danh sách tour.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTours();

    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions = useMemo(() => {
    const uniqueValues = (field) =>
      [...new Set(
        tours
          .map((tour) => tour[field])
          .filter((value) => typeof value === 'string' && value.trim()),
      )].sort((first, second) => first.localeCompare(second, 'vi'));

    return {
      destinations: uniqueValues('destinationName'),
      travelStyles: uniqueValues('travelStyle'),
      companies: uniqueValues('companyName'),
    };
  }, [tours]);

  const filteredTours = useMemo(() => {
    const normalized =
      keyword.trim().toLowerCase();


    return tours.filter((tour) => {
      const searchable = [
        tour.title,
        tour.description,
        tour.destinationName,
        tour.categoryCode,
        tour.companyName,
        tour.travelStyle,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!normalized || searchable.includes(normalized)) &&
        (!destinationFilter ||
          tour.destinationName === destinationFilter) &&
        (!travelStyleFilter ||
          tour.travelStyle === travelStyleFilter) &&
        (!companyFilter || tour.companyName === companyFilter)
      );
    });
  }, [
    companyFilter,
    destinationFilter,
    keyword,
    tours,
    travelStyleFilter,
  ]);

  const hasActiveFilters =
    Boolean(destinationFilter || travelStyleFilter || companyFilter);
  const activeFilterCount = [
    destinationFilter,
    travelStyleFilter,
    companyFilter,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setDestinationFilter('');
    setTravelStyleFilter('');
    setCompanyFilter('');
  };

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
          className={`filter-button ${filtersOpen ? 'active' : ''}`}
          aria-expanded={filtersOpen}
          aria-controls="tour-filter-options"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={18} />
          Bộ lọc
          {hasActiveFilters && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
        </button>
      </section>

      {filtersOpen && (
        <section
          className="tour-filter-panel"
          id="tour-filter-options"
          aria-label="Bộ lọc tour"
        >
          <label>
            Điểm đến
            <select
              value={destinationFilter}
              onChange={(event) =>
                setDestinationFilter(event.target.value)
              }
            >
              <option value="">Tất cả điểm đến</option>
              {filterOptions.destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </label>

          <label>
            Phong cách tour
            <select
              value={travelStyleFilter}
              onChange={(event) =>
                setTravelStyleFilter(event.target.value)
              }
            >
              <option value="">Tất cả phong cách</option>
              {filterOptions.travelStyles.map((travelStyle) => (
                <option key={travelStyle} value={travelStyle}>
                  {travelStyle}
                </option>
              ))}
            </select>
          </label>

          <label>
            Công ty
            <select
              value={companyFilter}
              onChange={(event) =>
                setCompanyFilter(event.target.value)
              }
            >
              <option value="">Tất cả công ty</option>
              {filterOptions.companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Xóa bộ lọc
          </button>
        </section>
      )}

      {loading ? (
        <div className="state-message">
          Đang tải tour...
        </div>
      ) : error ? (
        <div className="error-state">
          <h2>Không thể tải danh sách tour</h2>
          <p>{error}</p>
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
