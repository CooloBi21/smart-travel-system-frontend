import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Info,
  LoaderCircle,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import {
  getPlatformSettingsApi,
  updatePlatformSettingsApi,
} from '../../api/platform-settings.api';

const SETTINGS_FIELDS = [
  'platformName',
  'platformDescription',
  'supportEmail',
  'defaultLanguage',
  'defaultCurrency',
  'maintenanceMode',
  'allowCustomerRegistration',
];

function normalizeSettings(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Phản hồi cấu hình nền tảng không hợp lệ.');
  }

  return SETTINGS_FIELDS.reduce((settings, field) => {
    const value = data[field];

    if (
      field === 'maintenanceMode' ||
      field === 'allowCustomerRegistration'
    ) {
      settings[field] =
        typeof value === 'boolean' ? value : null;
    } else {
      settings[field] =
        typeof value === 'string' ? value : null;
    }

    return settings;
  }, {});
}

function formatUpdatedAt(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const data = normalizeSettings(await getPlatformSettingsApi());
      setSettings(data);
      setForm(data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Không thể tải cấu hình nền tảng.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
  }, [loadSettings]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!form) {
        setError('Cấu hình chưa được tải.');
        return;
      }

      const payload = {};

      for (const field of SETTINGS_FIELDS) {
        const value = form[field];

        if (value === null || value === undefined) {
          continue;
        }

        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (
            field === 'defaultLanguage' &&
            !['vi-VN', 'en-US'].includes(trimmedValue)
          ) {
            continue;
          }
          if (
            field === 'defaultCurrency' &&
            !['VND', 'USD'].includes(trimmedValue)
          ) {
            continue;
          }
          if (field === 'supportEmail' && !trimmedValue) {
            continue;
          }
          if (field === 'platformName' && !trimmedValue) {
            setError('Tên nền tảng không được để trống.');
            return;
          }
          payload[field] = trimmedValue;
          continue;
        }

        if (typeof value === 'boolean') {
          payload[field] = value;
        }
      }

      if (Object.keys(payload).length === 0) {
        setError('Không có thiết lập hợp lệ để lưu.');
        return;
      }

      const updated =
        await updatePlatformSettingsApi(payload);
      const normalized = normalizeSettings(updated);
      setSettings(normalized);
      setForm(normalized);

      setSuccess('Đã lưu cấu hình nền tảng.');
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Không thể lưu cấu hình nền tảng.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <section className="platform-page-header">
        <div>
          <span className="platform-page-eyebrow">
            SYSTEM SETTINGS
          </span>

          <h1>Cài đặt</h1>

          <p>
            Cấu hình và quản lý các thiết lập chung của
            nền tảng Smart Travel.
          </p>
        </div>

        <button
          type="button"
          className="platform-refresh-button"
          onClick={loadSettings}
          disabled={loading || saving}
        >
          <RefreshCw
            size={16}
            className={loading ? 'platform-spin' : ''}
          />
          {loading ? 'Đang tải' : 'Tải lại'}
        </button>
      </section>

      {error && (
        <section className="platform-error platform-settings-feedback" role="alert">
          <span>{error}</span>
          {!loading && !form && (
            <button
              type="button"
              className="platform-refresh-button"
              onClick={loadSettings}
            >
              <RefreshCw size={15} />
              Thử tải lại
            </button>
          )}
        </section>
      )}

      {success && (
        <section className="platform-settings-success" role="status">
          <CheckCircle2 size={17} />
          <span>{success}</span>
        </section>
      )}

      {loading ? (
        <section className="platform-placeholder-card platform-settings-loading" role="status">
          <div className="platform-placeholder-icon">
            <LoaderCircle size={24} className="platform-spin" />
          </div>

          <h2>Đang tải cấu hình</h2>

          <p>
            Đang tải cấu hình hiện tại của nền tảng.
          </p>
        </section>
      ) : form ? (
        <form
          className="platform-settings-form"
          onSubmit={handleSubmit}
        >
          <section className="platform-settings-grid">
            <article className="platform-setting-card">
              <div className="platform-setting-icon">
                <Settings size={21} />
              </div>

              <div>
                <h2>Thông tin nền tảng</h2>

                <p>
                  Thông tin nhận diện và liên hệ của
                  nền tảng.
                </p>
              </div>

              <span className="platform-status-badge">API hỗ trợ cập nhật</span>
            </article>

            <article className="platform-setting-card">
              <div className="platform-setting-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2>Bảo mật & quyền</h2>

                <p>
                  Platform Settings chỉ dành cho
                  PLATFORM_ADMIN.
                </p>
              </div>

              <span className="platform-status-badge">
                Đang áp dụng
              </span>
            </article>

            <article className="platform-setting-card">
              <div className="platform-setting-icon">
                <SlidersHorizontal size={21} />
              </div>

              <div>
                <h2>Tùy chọn vận hành</h2>

                <p>
                  Ngôn ngữ, tiền tệ và các tùy chọn vận
                  hành.
                </p>
              </div>

              <span className="platform-status-badge">API hỗ trợ cập nhật</span>
            </article>
          </section>

          <section className="platform-placeholder-card platform-settings-card">
            <div className="platform-placeholder-icon">
              <Settings size={24} />
            </div>

            <h2>Thông tin nền tảng</h2>
            <p className="platform-settings-description">
              Cập nhật tên, mô tả và địa chỉ email hỗ trợ được trả về bởi API cài đặt.
            </p>

            <div className="platform-form">
              <label>
                <span>Tên nền tảng</span>

                <input
                  name="platformName"
                  value={form.platformName ?? ''}
                  onChange={handleChange}
                  maxLength={150}
                  disabled={saving}
                  required
                />
              </label>

              <label>
                <span>Mô tả nền tảng</span>

                <textarea
                  name="platformDescription"
                  value={form.platformDescription ?? ''}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={4}
                  disabled={saving}
                />
                {form.platformDescription === null && (
                  <small>API không trả về giá trị cho trường này.</small>
                )}
              </label>

              <label>
                <span>Email hỗ trợ</span>

                <input
                  type="email"
                  name="supportEmail"
                  value={form.supportEmail ?? ''}
                  onChange={handleChange}
                  maxLength={255}
                  disabled={saving}
                />
                <small>
                  Để trống sẽ giữ nguyên email hiện tại; API không hỗ trợ xóa email bằng giá trị trống.
                </small>
              </label>
            </div>
          </section>

          <section className="platform-placeholder-card platform-settings-card">
            <div className="platform-placeholder-icon">
              <SlidersHorizontal size={24} />
            </div>

            <h2>Tùy chọn vận hành</h2>
            <p className="platform-settings-description">
              Giá trị ngôn ngữ và tiền tệ được giới hạn theo các lựa chọn mà API chấp nhận.
            </p>

            <div className="platform-form">
              <label>
                <span>Ngôn ngữ mặc định</span>

                <select
                  name="defaultLanguage"
                  value={form.defaultLanguage ?? ''}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {!['vi-VN', 'en-US'].includes(form.defaultLanguage) && (
                    <option value={form.defaultLanguage ?? ''}>
                      {form.defaultLanguage ?? 'Chưa có giá trị'}
                    </option>
                  )}
                  <option value="vi-VN">
                    Tiếng Việt
                  </option>

                  <option value="en-US">
                    English
                  </option>
                </select>
              </label>

              <label>
                <span>Tiền tệ mặc định</span>

                <select
                  name="defaultCurrency"
                  value={form.defaultCurrency ?? ''}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {!['VND', 'USD'].includes(form.defaultCurrency) && (
                    <option value={form.defaultCurrency ?? ''}>
                      {form.defaultCurrency ?? 'Chưa có giá trị'}
                    </option>
                  )}
                  <option value="VND">
                    VND - Việt Nam Đồng
                  </option>

                  <option value="USD">
                    USD - US Dollar
                  </option>
                </select>
              </label>

              <label className="platform-checkbox-row">
                <input
                  type="checkbox"
                  name="allowCustomerRegistration"
                  checked={
                    form.allowCustomerRegistration === true
                  }
                  onChange={handleChange}
                  disabled={saving || form.allowCustomerRegistration === null}
                />

                <span>
                  Cho phép khách hàng đăng ký tài khoản
                  {form.allowCustomerRegistration === null &&
                    ' (API không trả về giá trị)'}
                </span>
              </label>

              <label className="platform-checkbox-row">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={form.maintenanceMode === true}
                  onChange={handleChange}
                  disabled={saving || form.maintenanceMode === null}
                />

                <span>
                  Bật chế độ bảo trì nền tảng
                  {form.maintenanceMode === null &&
                    ' (API không trả về giá trị)'}
                </span>
              </label>
            </div>
          </section>

          <section className="platform-placeholder-card platform-settings-card">
            <div className="platform-placeholder-icon">
              <ShieldCheck size={24} />
            </div>

            <h2>Bảo mật & quyền quản trị</h2>

            <p>
              Các endpoint Settings được bảo vệ bởi
              JWT authentication và role
              PLATFORM_ADMIN. Thông tin bí mật như JWT
              secret, database password và credentials
              vẫn được quản lý bằng environment variables,
              không lưu trong Platform Settings.
            </p>

            <div className="platform-capability">
              <ShieldCheck size={18} />

              <span>
                Authorization:
                <strong> PLATFORM_ADMIN ONLY</strong>
              </span>
            </div>
          </section>

          {formatUpdatedAt(settings?.updatedAt) && (
            <p className="platform-settings-updated">
              Cập nhật lần cuối: {formatUpdatedAt(settings.updatedAt)}
            </p>
          )}

          <div className="platform-modal-actions">
            <button
              type="submit"
              className="platform-primary-button"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle size={18} className="platform-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? 'Đang lưu...'
                : 'Lưu cấu hình'}
            </button>
          </div>
        </form>
      ) : (
        <section className="platform-placeholder-card platform-settings-load-error">
          <div className="platform-placeholder-icon">
            <Info size={24} />
          </div>
          <h2>Chưa thể hiển thị cài đặt</h2>
          <p>Tải cấu hình nền tảng thất bại. Hãy thử lại để tiếp tục.</p>
          <button
            type="button"
            className="platform-primary-button"
            onClick={loadSettings}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Thử tải lại
          </button>
        </section>
      )}
    </PageContainer>
  );
}
