import {
  Building2,
  ShieldCheck,
  Tags,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';

import './platform-pages.css';

export default function DashboardPage() {
  return (
    <PageContainer>
      <section className="platform-page-header">
        <div>
          <span className="platform-page-eyebrow">
            PLATFORM OVERVIEW
          </span>

          <h1>Dashboard</h1>

          <p>
            Tổng quan quản trị nền tảng Smart Travel.
          </p>
        </div>
      </section>

      <section className="platform-overview-grid">
        <article className="platform-overview-card">
          <div className="platform-overview-icon">
            <Building2 size={20} />
          </div>

          <div>
            <span>Quản lý công ty</span>
            <strong>Đang triển khai</strong>
          </div>
        </article>

        <article className="platform-overview-card">
          <div className="platform-overview-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Phê duyệt doanh nghiệp</span>
            <strong>Đang triển khai</strong>
          </div>
        </article>

        <article className="platform-overview-card">
          <div className="platform-overview-icon">
            <Tags size={20} />
          </div>

          <div>
            <span>Danh mục</span>
            <strong>Chưa có API</strong>
          </div>
        </article>
      </section>

      <section className="platform-placeholder-card">
        <h2>Platform Administration</h2>

        <p>
          Khu vực quản trị nền tảng đang được xây dựng
          theo các API backend đã được xác nhận.
        </p>
      </section>
    </PageContainer>
  );
}
