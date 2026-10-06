import {
  Info,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';

export default function SettingsPage() {
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
      </section>

      <section className="platform-settings-grid">
        <article className="platform-setting-card">
          <div className="platform-setting-icon">
            <Settings size={21} />
          </div>

          <div>
            <h2>Cấu hình hệ thống</h2>

            <p>
              Các thiết lập chung của Platform Admin.
            </p>
          </div>

          <span className="platform-status-badge">
            Chưa triển khai
          </span>
        </article>

        <article className="platform-setting-card">
          <div className="platform-setting-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h2>Bảo mật</h2>

            <p>
              Các chính sách bảo mật và quyền quản trị
              nền tảng.
            </p>
          </div>

          <span className="platform-status-badge">
            Chưa triển khai
          </span>
        </article>

        <article className="platform-setting-card">
          <div className="platform-setting-icon">
            <SlidersHorizontal size={21} />
          </div>

          <div>
            <h2>Platform preferences</h2>

            <p>
              Các tùy chọn vận hành của nền tảng.
            </p>
          </div>

          <span className="platform-status-badge">
            Chưa triển khai
          </span>
        </article>
      </section>

      <section className="platform-placeholder-card">
        <div className="platform-placeholder-icon">
          <Info size={24} />
        </div>

        <h2>System settings chưa có backend contract</h2>

        <p>
          Giao diện được chuẩn bị theo cấu trúc Platform
          Admin của hệ thống. Chưa thực hiện các thao tác
          thay đổi cấu hình vì backend hiện chưa cung cấp
          settings API tương ứng.
        </p>
      </section>
    </PageContainer>
  );
}
