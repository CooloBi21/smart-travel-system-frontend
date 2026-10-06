import {
  BarChart3,
  Database,
  Info,
  TrendingUp,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <section className="platform-page-header">
        <div>
          <span className="platform-page-eyebrow">
            PLATFORM ANALYTICS
          </span>

          <h1>Phân tích</h1>

          <p>
            Tổng hợp và phân tích dữ liệu hoạt động của
            nền tảng Smart Travel.
          </p>
        </div>
      </section>

      <section className="platform-overview-grid">
        <article className="platform-overview-card">
          <div className="platform-overview-icon">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Platform metrics</span>
            <strong>Chưa có API</strong>
          </div>
        </article>

        <article className="platform-overview-card">
          <div className="platform-overview-icon">
            <Database size={20} />
          </div>

          <div>
            <span>Data analytics</span>
            <strong>Chưa có API</strong>
          </div>
        </article>

        <article className="platform-overview-card">
          <div className="platform-overview-icon">
            <BarChart3 size={20} />
          </div>

          <div>
            <span>Reports</span>
            <strong>Chưa có API</strong>
          </div>
        </article>
      </section>

      <section className="platform-placeholder-card">
        <div className="platform-placeholder-icon">
          <BarChart3 size={24} />
        </div>

        <h2>Platform analytics đang chờ backend</h2>

        <p>
          Khu vực này được giữ làm nền tảng cho dashboard
          phân tích tổng thể: doanh nghiệp, tour, booking,
          doanh thu, khách hàng và các chỉ số vận hành.
          Backend hiện chưa có analytics/dashboard
          subsystem tương ứng.
        </p>

        <div className="platform-info-note">
          <Info size={17} />

          <span>
            Không sử dụng số liệu giả trong bản hiện tại.
            Khi analytics API hoàn thiện, các KPI và biểu
            đồ sẽ được kết nối trực tiếp với dữ liệu thật.
          </span>
        </div>
      </section>
    </PageContainer>
  );
}
