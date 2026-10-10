import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Edit3,
  FolderTree,
  Info,
  Plus,
  Power,
  RefreshCw,
  Search,
  Tags,
  X,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import {
  createCategoryApi,
  getAdminCategoriesApi,
  updateCategoryApi,
  updateCategoryStatusApi,
} from '../../api/reference-data.api';

const EMPTY_FORM = {
  code: '',
  name: '',
  description: '',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAdminCategoriesApi();
      setCategories(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Không thể tải danh sách danh mục.',
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, [loadCategories]);

  const openCreateForm = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setForm({
      code: category.code || '',
      name: category.name || '',
      description: category.description || '',
    });
    setError('');
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (actionLoading) {
      return;
    }

    setIsFormOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
    };

    if (!payload.code || !payload.name) {
      setError('Mã danh mục và tên danh mục không được để trống.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      if (editingCategory) {
        await updateCategoryApi(
          editingCategory.id,
          payload,
        );
      } else {
        await createCategoryApi(payload);
      }

      const savedAction = editingCategory ? 'đã được cập nhật' : 'đã được tạo';
      closeForm();
      setSuccessMessage(`Danh mục ${savedAction} thành công.`);
      await loadCategories();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Không thể lưu danh mục.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      await updateCategoryStatusApi(
        category.id,
        !category.isActive,
      );

      setSuccessMessage(
        category.isActive
          ? 'Đã tắt danh mục thành công.'
          : 'Đã kích hoạt danh mục thành công.',
      );
      await loadCategories();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Không thể cập nhật trạng thái danh mục.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && category.isActive) ||
        (statusFilter === 'INACTIVE' && !category.isActive);
      const searchableText = [
        category.code,
        category.name,
        category.description,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();

      return matchesStatus && searchableText.includes(keyword);
    });
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter(
    (category) => category.isActive,
  ).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <PageContainer>
      <section className="platform-page-header platform-categories-header">
        <div>
          <span className="platform-page-eyebrow">
            CATEGORY MANAGEMENT
          </span>

          <h1>Danh mục</h1>

          <p>
            Quản lý các nhóm danh mục được sử dụng trong
            hệ thống Smart Travel.
          </p>
        </div>

        <button
          type="button"
          className="platform-primary-button"
          onClick={openCreateForm}
          disabled={loading}
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </section>

      {error && (
        <div className="platform-error platform-categories-feedback" role="alert">
          <span>{error}</span>
          {!isFormOpen && (
            <button
              type="button"
              className="platform-refresh-button"
              onClick={loadCategories}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? 'platform-spin' : ''}
              />
              Thử tải lại
            </button>
          )}
        </div>
      )}

      {successMessage && (
        <div className="platform-category-success" role="status">
          {successMessage}
        </div>
      )}

      <section className="platform-placeholder-card">
        <div className="platform-placeholder-icon">
          <FolderTree size={24} />
        </div>

        <div className="platform-section-heading">
          <div>
            <h2>Quản lý danh mục</h2>

            <p>Tra cứu và quản lý danh mục tour trong hệ thống.</p>
          </div>

          <div className="platform-capability">
            <Tags size={18} />

            <span>
              Tổng số:
              <strong> {loading || error ? '—' : categories.length}</strong>
            </span>
          </div>
        </div>

        {!loading && !error && categories.length > 0 && (
          <>
            <div className="platform-category-toolbar">
              <label className="platform-category-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo mã, tên hoặc mô tả danh mục..."
                  aria-label="Tìm danh mục"
                />
              </label>

              <label className="platform-category-filter">
                <span>Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Lọc theo trạng thái danh mục"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Đã tắt</option>
                </select>
              </label>
            </div>

            <div className="platform-category-counts">
              <span>{categories.length} danh mục</span>
              <span>{activeCount} đang hoạt động</span>
              <span>{inactiveCount} đã tắt</span>
              <span>{filteredCategories.length} kết quả phù hợp</span>
            </div>
          </>
        )}

        {loading ? (
          <div className="platform-category-state" role="status">
            <RefreshCw size={18} className="platform-spin" />
            <span>Đang tải danh sách danh mục...</span>
          </div>
        ) : error ? (
          <div className="platform-category-state">
            Không thể hiển thị danh sách khi dữ liệu chưa tải thành công.
          </div>
        ) : categories.length === 0 ? (
          <div className="platform-category-state">
            <Info size={17} />

            <span>
              Chưa có danh mục nào trong hệ thống.
            </span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="platform-category-state">
            <Info size={17} />
            <span>Không tìm thấy danh mục phù hợp với từ khóa hoặc trạng thái.</span>
            <button
              type="button"
              className="platform-secondary-button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="platform-table-wrapper">
            <table className="platform-table platform-category-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span className="platform-category-code">
                        {category.code}
                      </span>
                    </td>

                    <td>
                      <strong className="platform-category-name">
                        {category.name}
                      </strong>
                    </td>

                    <td className="platform-category-description">
                      {category.description || '—'}
                    </td>

                    <td>
                      <span
                        className={
                          category.isActive
                            ? 'platform-status-badge active'
                            : 'platform-status-badge inactive'
                        }
                      >
                        {category.isActive
                          ? 'Hoạt động'
                          : 'Đã tắt'}
                      </span>
                    </td>

                    <td>
                      <div className="platform-table-actions">
                        <button
                          type="button"
                          className="platform-action-button"
                          onClick={() =>
                            openEditForm(category)
                          }
                          disabled={actionLoading}
                        >
                          <Edit3 size={16} />
                          Sửa
                        </button>

                        <button
                          type="button"
                          className="platform-action-button"
                          onClick={() =>
                            handleToggleStatus(category)
                          }
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <RefreshCw
                              size={16}
                              className="platform-spin"
                            />
                          ) : (
                            <Power size={16} />
                          )}

                          {actionLoading
                            ? 'Đang xử lý...'
                            : category.isActive
                              ? 'Tắt'
                              : 'Kích hoạt'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <div className="platform-modal-backdrop">
          <div className="platform-modal">
            <div className="platform-modal-header">
              <div>
                <span className="platform-page-eyebrow">
                  {editingCategory
                    ? 'EDIT CATEGORY'
                    : 'CREATE CATEGORY'}
                </span>

                <h2>
                  {editingCategory
                    ? 'Chỉnh sửa danh mục'
                    : 'Thêm danh mục'}
                </h2>
              </div>

              <button
                type="button"
                className="platform-modal-close"
                onClick={closeForm}
                disabled={actionLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="platform-form"
              onSubmit={handleSubmit}
            >
              <label>
                <span>Mã danh mục</span>

                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="Ví dụ: BEACH"
                  disabled={actionLoading}
                />
              </label>

              <label>
                <span>Tên danh mục</span>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="Ví dụ: Du lịch biển"
                  disabled={actionLoading}
                />
              </label>

              <label>
                <span>Mô tả</span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  placeholder="Mô tả danh mục..."
                  disabled={actionLoading}
                />
              </label>

              <div className="platform-modal-actions">
                <button
                  type="button"
                  className="platform-secondary-button"
                  onClick={closeForm}
                  disabled={actionLoading}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="platform-primary-button"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Đang lưu...'
                    : editingCategory
                      ? 'Lưu thay đổi'
                      : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
