import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Building2,
  CheckCircle2,
  Clock3,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import {
  approveCompanyApi,
  getCompaniesApi,
} from '../../api/company.api';

import '../company/company-pages.css';
import './platform-pages.css';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ duyệt',
    className: 'pending',
    icon: Clock3,
  },
  ACTIVE: {
    label: 'Đang hoạt động',
    className: 'active',
    icon: CheckCircle2,
  },
  SUSPENDED: {
    label: 'Tạm ngưng',
    className: 'suspended',
    icon: Building2,
  },
  ARCHIVED: {
    label: 'Đã lưu trữ',
    className: 'archived',
    icon: Building2,
  },
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getCompaniesApi();

      setCompanies(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Không thể tải danh sách công ty.',
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCompanies();
  }, [loadCompanies]);

  const handleApprove = async (companyId) => {
    try {
      setActionLoading(companyId);
      setActionError('');
      setSuccessMessage('');

      await approveCompanyApi(companyId);
      setSuccessMessage(`Đã duyệt công ty #${companyId} thành công.`);
      await loadCompanies();
    } catch (err) {
      console.error(err);

      setActionError(
        err?.response?.data?.message ||
          'Không thể duyệt công ty.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const statusCounts = companies.reduce((counts, company) => {
    counts[company.status] = (counts[company.status] || 0) + 1;
    return counts;
  }, {});

  const filteredCompanies = companies.filter((company) => {
    const matchesStatus =
      statusFilter === 'ALL' || company.status === statusFilter;
    const keyword = search.trim().toLowerCase();
    const searchableText = [
      company.id,
      company.name,
      company.slug,
      company.accountUserId,
      company.contactEmail,
      company.contactPhone,
      company.status,
    ]
      .filter((value) => value !== null && value !== undefined)
      .join(' ')
      .toLowerCase();

    return matchesStatus && searchableText.includes(keyword);
  });

  return (
    <PageContainer>
      <section className="platform-page-header platform-companies-header">
        <div>
          <span className="platform-page-eyebrow">
            COMPANY MANAGEMENT
          </span>

          <h1>Quản lý công ty</h1>

          <p>
            Theo dõi thông tin và trạng thái xử lý các doanh nghiệp trên
            nền tảng.
          </p>
        </div>

        <button
          type="button"
          className="platform-refresh-button"
          onClick={loadCompanies}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? 'platform-spin' : ''}
          />
          {loading ? 'Đang tải' : 'Làm mới'}
        </button>
      </section>

      {error && (
        <div className="platform-error platform-companies-feedback" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="platform-refresh-button"
            onClick={loadCompanies}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Thử tải lại
          </button>
        </div>
      )}

      {actionError && (
        <div className="platform-error" role="alert">
          {actionError}
        </div>
      )}

      {successMessage && (
        <div className="platform-company-success" role="status">
          {successMessage}
        </div>
      )}

      <section className="platform-company-management">
        <div className="platform-company-toolbar">
          <label className="platform-company-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên, slug, mã công ty, email hoặc điện thoại..."
              aria-label="Tìm công ty"
            />
          </label>

          <label className="platform-company-filter">
            <Filter size={16} aria-hidden="true" />
            <span className="platform-sr-only">Lọc trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Lọc theo trạng thái công ty"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="SUSPENDED">Tạm ngưng</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>
          </label>
        </div>

        {!loading && !error && companies.length > 0 && (
          <div className="platform-company-summary" aria-label="Số công ty theo trạng thái">
            <span>Tổng: {companies.length}</span>
            <span>Chờ duyệt: {statusCounts.PENDING || 0}</span>
            <span>Đang hoạt động: {statusCounts.ACTIVE || 0}</span>
            <span>Tạm ngưng: {statusCounts.SUSPENDED || 0}</span>
            <span>Đã lưu trữ: {statusCounts.ARCHIVED || 0}</span>
          </div>
        )}

      <section className="company-tour-table-card platform-companies-table-card">
        {loading ? (
          <div className="platform-company-state" role="status">
            <RefreshCw size={18} className="platform-spin" />
            Đang tải danh sách công ty...
          </div>
        ) : error ? (
          <div className="platform-company-state">
            Không thể hiển thị danh sách đến khi tải dữ liệu thành công.
          </div>
        ) : companies.length === 0 ? (
          <div className="platform-company-state">
            Chưa có công ty nào được đăng ký.
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="platform-company-state">
            Không tìm thấy công ty phù hợp với tìm kiếm và bộ lọc.
          </div>
        ) : (
          <div className="company-tour-table-wrapper">
            <table className="company-tour-table platform-company-table">
              <thead>
                <tr>
                  <th>Công ty</th>
                  <th>Thông tin liên hệ</th>
                  <th>Tài khoản chủ sở hữu</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredCompanies.map((company) => {
                  const status =
                    STATUS_CONFIG[company.status] || {
                      label: company.status || 'Không xác định',
                      className: 'unknown',
                      icon: Building2,
                    };
                  const StatusIcon = status.icon;

                  return (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.name}</strong>
                        <span>/{company.slug || '—'}</span>
                        <small>Mã công ty: #{company.id}</small>
                      </td>
                      <td>
                        {company.contactEmail && (
                          <span className="platform-company-contact">
                            {company.contactEmail}
                          </span>
                        )}
                        {company.contactPhone && (
                          <span className="platform-company-contact">
                            {company.contactPhone}
                          </span>
                        )}
                        {!company.contactEmail && !company.contactPhone && '—'}
                      </td>
                      <td>
                        #{company.accountUserId ?? '—'}
                      </td>
                      <td>{formatDate(company.createdAt)}</td>
                      <td>
                        <span className={`platform-status-badge platform-company-status ${status.className}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {company.status === 'PENDING' && (
                          <button
                            type="button"
                            className="company-primary-button"
                            disabled={
                              actionLoading !== null
                            }
                            onClick={() =>
                              handleApprove(company.id)
                            }
                          >
                            {actionLoading === company.id ? (
                              <RefreshCw
                                size={16}
                                className="platform-spin"
                              />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            {actionLoading === company.id
                              ? 'Đang duyệt...'
                              : 'Duyệt công ty'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </section>
    </PageContainer>
  );
}
