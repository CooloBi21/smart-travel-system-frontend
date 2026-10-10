import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Map,
  Save,
} from 'lucide-react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import PageContainer from '../../components/layout/PageContainer';
import {
  createTourApi,
  getMyTourApi,
  updateMyTourApi,
} from '../../api/tours.api';
import {
  getCategoriesApi,
  getDestinationsApi,
} from '../../api/reference-data.api';

import './company-pages.css';

const TRAVEL_STYLES = [
  {
    value: 'BEACH',
    label: 'Biển',
  },
  {
    value: 'CULTURE',
    label: 'Văn hóa',
  },
  {
    value: 'EXPLORE',
    label: 'Khám phá',
  },
  {
    value: 'RELAX',
    label: 'Nghỉ dưỡng',
  },
  {
    value: 'ADVENTURE',
    label: 'Mạo hiểm',
  },
];

const INITIAL_FORM = {
  destinationId: '',
  categoryId: '',
  title: '',
  slug: '',
  description: '',
  durationDays: '1',
  travelStyle: 'EXPLORE',
  cancellationPolicy: '',
};

function createSlug(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function TourFormPage() {
  const navigate = useNavigate();
  const { tourId } = useParams();

  const isEditMode = Boolean(tourId);

  const [form, setForm] = useState(INITIAL_FORM);

  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [referenceLoading, setReferenceLoading] =
    useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pageTitle = useMemo(
    () =>
      isEditMode
        ? 'Chỉnh sửa tour'
        : 'Tạo tour mới',
    [isEditMode],
  );

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setReferenceLoading(true);
        setError('');

        const [
          destinationsResponse,
          categoriesResponse,
        ] = await Promise.all([
          getDestinationsApi(),
          getCategoriesApi(),
        ]);

        setDestinations(
          Array.isArray(destinationsResponse)
            ? destinationsResponse
            : [],
        );

        setCategories(
          Array.isArray(categoriesResponse)
            ? categoriesResponse
            : [],
        );
      } catch (requestError) {
        console.error(requestError);

        setError(
          requestError?.response?.data?.message ||
            'Không thể tải danh sách điểm đến và danh mục.',
        );
      } finally {
        setReferenceLoading(false);
      }
    };

    loadReferenceData();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadTour = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getMyTourApi(tourId);
        const tour = response?.tour || response;

        if (!tour) {
          throw new Error('Tour không tồn tại.');
        }

        setForm({
          destinationId:
            tour.destinationId?.toString() || '',
          categoryId:
            tour.categoryId?.toString() || '',
          title: tour.title || '',
          slug: tour.slug || '',
          description: tour.description || '',
          durationDays:
            tour.durationDays?.toString() || '1',
          travelStyle:
            tour.travelStyle || 'EXPLORE',
          cancellationPolicy:
            tour.cancellationPolicy || '',
        });
      } catch (requestError) {
        console.error(requestError);

        setError(
          requestError?.response?.data?.message ||
            'Không thể tải thông tin tour.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [isEditMode, tourId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleTitleChange = (event) => {
    const title = event.target.value;

    setForm((current) => ({
      ...current,
      title,
      ...(isEditMode
        ? {}
        : {
            slug: createSlug(title),
          }),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        destinationId: Number(form.destinationId),
        categoryId: Number(form.categoryId),
        title: form.title.trim(),
        slug: form.slug.trim(),
        description:
          form.description.trim() || null,
        durationDays: Number(form.durationDays),
        travelStyle: form.travelStyle,
        cancellationPolicy:
          form.cancellationPolicy.trim() || null,
      };

      if (
        !payload.destinationId ||
        !payload.categoryId
      ) {
        setError(
          'Vui lòng chọn điểm đến và danh mục.',
        );
        return;
      }

      if (!payload.title || !payload.slug) {
        setError(
          'Vui lòng nhập đầy đủ tên tour và slug.',
        );
        return;
      }

      if (
        !Number.isInteger(payload.durationDays) ||
        payload.durationDays < 1
      ) {
        setError(
          'Thời lượng tour phải là số nguyên lớn hơn hoặc bằng 1.',
        );
        return;
      }

      if (isEditMode) {
        await updateMyTourApi(tourId, payload);
      } else {
        await createTourApi(payload);
      }

      navigate('/company/tours');
    } catch (requestError) {
      console.error(requestError);

      const message =
        requestError?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Không thể lưu tour. Vui lòng kiểm tra lại dữ liệu.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || referenceLoading) {
    return (
      <PageContainer>
        <section className="section company-page-section">
          <div className="company-tour-form-loading">
            <FileText size={28} />
            <strong>
              {loading
                ? 'Đang tải thông tin tour...'
                : 'Đang tải dữ liệu tour...'}
            </strong>
          </div>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="section company-page-section">
        <div className="company-page-header">
          <div>
            <span className="section-eyebrow">
              TOUR MANAGEMENT
            </span>

            <h1>{pageTitle}</h1>

            <p>
              {isEditMode
                ? 'Cập nhật thông tin tour của company.'
                : 'Tạo một tour mới cho company.'}
            </p>
          </div>

          <Link
            to="/company/tours"
            className="company-secondary-button"
          >
            <ArrowLeft size={17} />
            Quay lại
          </Link>
        </div>

        {error && (
          <div className="company-page-alert error">
            {error}
          </div>
        )}

        <form
          className="company-tour-form"
          onSubmit={handleSubmit}
        >
          <div className="company-tour-form-card">
            <div className="company-tour-form-card-header">
              <div className="company-tour-form-card-icon">
                <Map size={20} />
              </div>

              <div>
                <h2>Thông tin cơ bản</h2>
                <p>
                  Thông tin chính của tour du lịch.
                </p>
              </div>
            </div>

            <div className="company-tour-form-grid">
              <div className="company-form-field full">
                <label htmlFor="title">
                  Tên tour
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="Ví dụ: Khám phá Hội An 3 ngày 2 đêm"
                  minLength={2}
                  required
                />
              </div>

              <div className="company-form-field">
                <label htmlFor="slug">
                  Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="kham-pha-hoi-an-3-ngay-2-dem"
                  minLength={2}
                  required
                />

                <small>
                  Chỉ dùng chữ thường, số và dấu gạch ngang.
                </small>
              </div>

              <div className="company-form-field">
                <label htmlFor="durationDays">
                  Thời lượng
                </label>

                <div className="company-input-with-suffix">
                  <input
                    id="durationDays"
                    name="durationDays"
                    type="number"
                    min="1"
                    step="1"
                    value={form.durationDays}
                    onChange={handleChange}
                    required
                  />

                  <span>ngày</span>
                </div>
              </div>

              <div className="company-form-field">
                <label htmlFor="destinationId">
                  Điểm đến
                </label>

                <select
                  id="destinationId"
                  name="destinationId"
                  value={form.destinationId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    -- Chọn điểm đến --
                  </option>

                  {destinations.map((destination) => (
                    <option
                      key={destination.id}
                      value={destination.id}
                    >
                      {destination.name}
                    </option>
                  ))}
                </select>

                <small>
                  Chỉ hiển thị điểm đến đang hoạt động.
                </small>
              </div>

              <div className="company-form-field">
                <label htmlFor="categoryId">
                  Danh mục
                </label>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    -- Chọn danh mục --
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <small>
                  Chỉ hiển thị danh mục đang hoạt động.
                </small>
              </div>

              <div className="company-form-field">
                <label htmlFor="travelStyle">
                  Phong cách du lịch
                </label>

                <select
                  id="travelStyle"
                  name="travelStyle"
                  value={form.travelStyle}
                  onChange={handleChange}
                  required
                >
                  {TRAVEL_STYLES.map((style) => (
                    <option
                      key={style.value}
                      value={style.value}
                    >
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="company-form-field full">
                <label htmlFor="description">
                  Mô tả tour
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Mô tả lịch trình, điểm nổi bật và trải nghiệm của tour..."
                />
              </div>

              <div className="company-form-field full">
                <label htmlFor="cancellationPolicy">
                  Chính sách hủy
                </label>

                <textarea
                  id="cancellationPolicy"
                  name="cancellationPolicy"
                  value={form.cancellationPolicy}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Nhập chính sách hủy tour..."
                />
              </div>
            </div>
          </div>

          <div className="company-tour-form-footer">
            <Link
              to="/company/tours"
              className="company-secondary-button"
            >
              Hủy
            </Link>

            <button
              type="submit"
              className="company-primary-button"
              disabled={saving}
            >
              <Save size={17} />

              {saving
                ? 'Đang lưu...'
                : isEditMode
                  ? 'Lưu thay đổi'
                  : 'Tạo tour'}
            </button>
          </div>
        </form>
      </section>
    </PageContainer>
  );
}
