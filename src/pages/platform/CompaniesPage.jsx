import {
  Building2,
  ShieldCheck,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';

export default function CompaniesPage() {
  return (
    <PageContainer>
      <section className="platform-page-header">
        <div>
          <span className="platform-page-eyebrow">
            COMPANY MANAGEMENT
          </span>

          <h1>Quản lý công ty</h1>

          <p>
            Quản lý và phê duyệt các doanh nghiệp tham gia
            nền tảng Smart Travel.
          </p>
        </div>
      </section>

      <section className="platform-placeholder-card">
        <div className="platform-placeholder-icon">
          <Building2 size={24} />
        </div>

        <h2>Company directory chưa có API</h2>

        <p>
          Backend hiện đã hỗ trợ tạo công ty, xem công ty
          của Company Admin và phê duyệt công ty bởi
          Platform Admin. Tuy nhiên chưa cung cấp API
          để Platform Admin lấy danh sách toàn bộ công ty.
        </p>

        <div className="platform-capability">
          <ShieldCheck size={18} />

          <span>
            Company approval API:
            <strong> AVAILABLE</strong>
          </span>
        </div>
      </section>
    </PageContainer>
  );
}
