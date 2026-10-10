import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  Link,
  useParams,
} from 'react-router-dom';

import PageContainer from '../../components/layout/PageContainer';
import { getMyTourApi } from '../../api/tours.api';
import {
  createDepartureApi,
  deleteDepartureApi,
  getMyDeparturesApi,
  updateDepartureApi,
  updateDepartureStatusApi,
} from '../../api/departures.api';

import './company-pages.css';

const STATUS_CONFIG = {
  SCHEDULED: {
    label: 'Đã lên lịch',
  },
  CLOSED: {
    label: 'Đã đóng',
  },
  CANCELLED: {
    label: 'Đã hủy',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
  },
};

const INITIAL_FORM = {
  departureDate: '',
  pricePerPerson: '',
  capacity: '',
};

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '-';
  }

  return new Intl.NumberFormat('vi-VN').format(
    amount,
  );
}

export default function DeparturesPage() {
  const { tourId } = useParams();

  const [tour, setTour] = useState(null);
  const [departures, setDepartures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');

      const [
        tourResponse,
        departuresResponse,
      ] = await Promise.all([
        getMyTourApi(tourId),
        getMyDeparturesApi(tourId),
      ]);

      setTour(
        tourResponse?.tour || tourResponse,
      );

      setDepartures(
        Array.isArray(departuresResponse)
          ? departuresResponse
          : departuresResponse?.departures ||
              [],
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message?.toString() ||
          'Không thể tải lịch khởi hành.',
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [tourId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleEdit = (departure) => {
    setEditingId(departure.id);

    setForm({
      departureDate:
        departure.departureDate || '',
      pricePerPerson:
        departure.pricePerPerson?.toString() ||
        '',
      capacity:
        departure.capacity?.toString() || '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        departureDate: form.departureDate,
        pricePerPerson: Number(
          form.pricePerPerson,
        ),
        capacity: Number(form.capacity),
      };

      if (!payload.departureDate) {
        setError(
          'Vui lòng chọn ngày khởi hành.',
        );
        return;
      }

      if (
        !Number.isFinite(
          payload.pricePerPerson,
        ) ||
        payload.pricePerPerson < 0
      ) {
        setError(
          'Giá tour không hợp lệ.',
        );
        return;
      }

      if (
        !Number.isInteger(payload.capacity) ||
        payload.capacity < 1
      ) {
        setError(
          'Sức chứa phải là số nguyên lớn hơn 0.',
        );
        return;
      }

      if (editingId) {
        await updateDepartureApi(
          tourId,
          editingId,
          payload,
        );
      } else {
        await createDepartureApi(
          tourId,
          payload,
        );
      }

      resetForm();
      setSuccess(
        editingId
          ? 'Đã cập nhật lịch khởi hành.'
          : 'Đã thêm lịch khởi hành.',
      );
      await loadData(false);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Không thể lưu lịch khởi hành.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    departureId,
    status,
  ) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(`status-${departureId}`);

      await updateDepartureStatusApi(
        tourId,
        departureId,
        status,
      );

      setSuccess('Đã cập nhật trạng thái lịch khởi hành.');
      await loadData(false);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Không thể cập nhật trạng thái.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (
    departureId,
  ) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(`delete-${departureId}`);

      await deleteDepartureApi(
        tourId,
        departureId,
      );

      if (editingId === departureId) {
        resetForm();
      }
      setSuccess('Đã xóa lịch khởi hành.');
      await loadData(false);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Không thể xóa lịch khởi hành.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !tour && departures.length === 0) {
    return (
      <PageContainer>
        <section className="section company-page-section">
          <div className="company-tour-form-loading" role="status">
            <LoaderCircle
              size={28}
              className="company-tour-spinner"
            />
            <strong>
              Đang tải lịch khởi hành...
            </strong>
          </div>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="section company-page-section company-departures-page">
        <div className="company-page-header">
          <div>
            <span className="section-eyebrow">
              DEPARTURE MANAGEMENT
            </span>

            <h1>Lịch khởi hành</h1>

            <p>
              {tour?.title ||
                'Quản lý các đợt khởi hành của tour.'}
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
          <div className="company-page-alert error" role="alert">
            {error}
            <button
              type="button"
              className="company-tour-retry"
              onClick={() => loadData()}
              disabled={loading}
            >
              <RotateCcw size={15} />
              Thử lại
            </button>
          </div>
        )}

        {success && (
          <div className="company-departure-success" role="status">
            {success}
          </div>
        )}

        <div className="company-tour-form-card">
          <div className="company-tour-form-card-header">
            <div className="company-tour-form-card-icon">
              <Plus size={20} />
            </div>

            <div>
              <h2>
                {editingId
                  ? 'Chỉnh sửa lịch khởi hành'
                  : 'Thêm lịch khởi hành'}
              </h2>

              <p>
                Thiết lập ngày, giá và sức chứa.
              </p>
            </div>
          </div>

          <form
            className="company-tour-form"
            onSubmit={handleSubmit}
          >
            <div className="company-tour-form-grid">
              <div className="company-form-field">
                <label htmlFor="departureDate">
                  Ngày khởi hành
                </label>

                <input
                  id="departureDate"
                  name="departureDate"
                  type="date"
                  value={form.departureDate}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              <div className="company-form-field">
                <label htmlFor="pricePerPerson">
                  Giá / người
                </label>

                <input
                  id="pricePerPerson"
                  name="pricePerPerson"
                  type="number"
                  min="0"
                  step="1"
                  value={form.pricePerPerson}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              <div className="company-form-field">
                <label htmlFor="capacity">
                  Sức chứa
                </label>

                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="company-tour-form-footer">
              {editingId && (
                <button
                  type="button"
                  className="company-secondary-button"
                  onClick={resetForm}
                >
                  Hủy chỉnh sửa
                </button>
              )}

              <button
                type="submit"
                className="company-primary-button"
                disabled={saving || loading}
              >
                {saving ? (
                  <LoaderCircle
                    size={17}
                    className="company-tour-spinner"
                  />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                {saving
                  ? 'Đang lưu...'
                  : editingId
                    ? 'Lưu thay đổi'
                    : 'Thêm lịch'}
              </button>
            </div>
          </form>
        </div>

        <div className="company-table-card">
          <div className="company-table-header">
            <div>
              <h2>Danh sách lịch khởi hành</h2>

              <p>{departures.length} lịch khởi hành</p>
            </div>
          </div>

          {loading ? (
            <div className="company-departure-state" role="status">
              <LoaderCircle
                size={22}
                className="company-tour-spinner"
              />
              Đang cập nhật danh sách lịch...
            </div>
          ) : departures.length === 0 ? (
            <div className="company-departure-state">
              <CalendarDays size={28} />
              <strong>Chưa có lịch khởi hành</strong>
              <span>
                Tạo lịch đầu tiên bằng biểu mẫu phía trên.
              </span>
            </div>
          ) : (
          <div className="company-table-wrapper">
            <table className="company-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giá / người</th>
                  <th>Sức chứa tối đa</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {departures.map(
                    (departure) => {
                      const status =
                        STATUS_CONFIG[
                          departure.status
                        ] || {
                          label: departure.status || 'Không xác định',
                        };

                      return (
                        <tr
                          key={departure.id}
                        >
                          <td>
                            <strong>{formatDate(departure.departureDate)}</strong>
                          </td>

                          <td>
                            {formatCurrency(departure.pricePerPerson)} VNĐ
                          </td>

                          <td>
                            {departure.capacity ?? '—'}
                          </td>

                          <td>
                            <span
                              className={`company-status-badge company-status-badge--${String(
                                departure.status || 'unknown',
                              ).toLowerCase()}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td>
                            <div className="company-table-actions">
                              <button
                                type="button"
                                className="company-icon-button"
                                aria-label={`Chỉnh sửa lịch ${formatDate(departure.departureDate)}`}
                                onClick={() =>
                                  handleEdit(
                                    departure,
                                  )
                                }
                                title="Chỉnh sửa"
                                disabled={Boolean(actionLoading) || saving}
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              {departure.status ===
                                'SCHEDULED' && (
                                <button
                                  type="button"
                                  className="company-icon-button"
                                  aria-label={`Đóng đăng ký lịch ${formatDate(departure.departureDate)}`}
                                  disabled={Boolean(actionLoading) || saving}
                                  aria-busy={actionLoading === `status-${departure.id}`}
                                  onClick={() =>
                                    handleStatusChange(
                                      departure.id,
                                      'CLOSED',
                                    )
                                  }
                                  title="Đóng đăng ký"
                                >
                                  {actionLoading === `status-${departure.id}` ? (
                                    <LoaderCircle size={16} className="company-tour-spinner" />
                                  ) : (
                                    <Clock3 size={16} />
                                  )}
                                </button>
                              )}

                              {departure.status ===
                                'CLOSED' && (
                                <button
                                  type="button"
                                  className="company-icon-button"
                                  aria-label={`Mở lại lịch ${formatDate(departure.departureDate)}`}
                                  disabled={Boolean(actionLoading) || saving}
                                  aria-busy={actionLoading === `status-${departure.id}`}
                                  onClick={() =>
                                    handleStatusChange(
                                      departure.id,
                                      'SCHEDULED',
                                    )
                                  }
                                  title="Mở lại"
                                >
                                  {actionLoading === `status-${departure.id}` ? (
                                    <LoaderCircle size={16} className="company-tour-spinner" />
                                  ) : (
                                    <CheckCircle2 size={16} />
                                  )}
                                </button>
                              )}

                              {(departure.status ===
                                'SCHEDULED' ||
                                departure.status ===
                                  'CLOSED') && (
                                <button
                                  type="button"
                                  className="company-icon-button"
                                  aria-label={`Hủy lịch ${formatDate(departure.departureDate)}`}
                                  disabled={Boolean(actionLoading) || saving}
                                  aria-busy={actionLoading === `status-${departure.id}`}
                                  onClick={() =>
                                    handleStatusChange(
                                      departure.id,
                                      'CANCELLED',
                                    )
                                  }
                                  title="Hủy"
                                >
                                  {actionLoading === `status-${departure.id}` ? (
                                    <LoaderCircle size={16} className="company-tour-spinner" />
                                  ) : (
                                    <XCircle size={16} />
                                  )}
                                </button>
                              )}

                              {departure.status ===
                                'CANCELLED' && (
                                <span>
                                  Đã hủy
                                </span>
                              )}

                              <button
                                type="button"
                                className="company-icon-button"
                                aria-label={`Xóa lịch ${formatDate(departure.departureDate)}`}
                                disabled={Boolean(actionLoading) || saving}
                                aria-busy={actionLoading === `delete-${departure.id}`}
                                onClick={() =>
                                  handleDelete(
                                    departure.id,
                                  )
                                }
                                title="Xóa"
                              >
                                {actionLoading === `delete-${departure.id}` ? (
                                  <LoaderCircle size={16} className="company-tour-spinner" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )
                }
              </tbody>
            </table>
          </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
