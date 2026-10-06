import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import {
  getActiveCompanyContextApi,
  getMyCompanyApi,
} from '../../api/company.api';

import './company-pages.css';

const STATUS_LABELS = {
  PENDING: 'Đang chờ duyệt',
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm ngưng',
};

export default function CompanyProfilePage() {
  const [company, setCompany] = useState(null);
  const [context, setContext] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadCompanyProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          companyResponse,
          contextResponse,
        ] = await Promise.all([
          getMyCompanyApi(),
          getActiveCompanyContextApi(),
        ]);

        if (cancelled) {
          return;
        }

        setCompany(
          companyResponse?.company ||
            companyResponse ||
            null,
        );

        setContext(
          contextResponse?.context ||
            contextResponse ||
            null,
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(requestError);

        setError(
          requestError?.response?.data?.message ||
            'Không thể tải thông tin công ty.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCompanyProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <section className="section company-page-section">
          <div className="company-tour-form-loading">
            Đang tải thông tin công ty...
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
              COMPANY PROFILE
            </span>

            <h1>Thông tin công ty</h1>

            <p>
              Thông tin doanh nghiệp và tenant context
              hiện tại.
            </p>
          </div>
        </div>

        {error && (
          <div className="company-page-alert error">
            {error}
          </div>
        )}

        <div className="company-profile-grid">
          <article className="company-profile-card">
            <div className="company-profile-card-header">
              <div className="company-profile-icon">
                <Building2 size={21} />
              </div>

              <div>
                <span className="section-eyebrow">
                  COMPANY
                </span>

                <h2>Thông tin doanh nghiệp</h2>
              </div>
            </div>

            <div className="company-profile-fields">
              <div>
                <span>Company ID</span>
                <strong>
                  {company?.id ?? '—'}
                </strong>
              </div>

              <div>
                <span>Tên công ty</span>
                <strong>
                  {company?.name || '—'}
                </strong>
              </div>

              <div>
                <span>Slug</span>
                <strong>
                  {company?.slug || '—'}
                </strong>
              </div>

              <div>
                <span>Trạng thái</span>

                <strong className="company-profile-status">
                  {company?.status === 'ACTIVE' && (
                    <CheckCircle2 size={16} />
                  )}

                  {STATUS_LABELS[
                    company?.status
                  ] ||
                    company?.status ||
                    '—'}
                </strong>
              </div>
            </div>
          </article>

          <article className="company-profile-card">
            <div className="company-profile-card-header">
              <div className="company-profile-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span className="section-eyebrow">
                  TENANT CONTEXT
                </span>

                <h2>Context đang hoạt động</h2>
              </div>
            </div>

            <div className="company-profile-fields">
              <div>
                <span>Company ID</span>
                <strong>
                  {context?.companyId ??
                    context?.company?.id ??
                    company?.id ??
                    '—'}
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {context?.roleCode ||
                    context?.role ||
                    'COMPANY_ADMIN'}
                </strong>
              </div>

              <div>
                <span>Context status</span>
                <strong>
                  {context?.status ||
                    company?.status ||
                    '—'}
                </strong>
              </div>

              <div>
                <span>Tenant</span>
                <strong>
                  {context?.company?.name ||
                    company?.name ||
                    '—'}
                </strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PageContainer>
  );
}
