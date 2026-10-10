import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { getMeApi } from '../../api/auth.api';
import './customer-pages.css';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getMeApi();
        const userData = response?.user || response;

        if (!cancelled) {
          setUser(userData);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.response?.data?.message ||
              'Không thể tải thông tin tài khoản.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="page-container account-page">
        <div className="account-page-loading">
          <LoaderCircle size={20} className="spin" />
          Đang tải thông tin tài khoản...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container account-page">
        <div className="error-state">
          <h1>Không thể tải tài khoản</h1>
          <p>{error}</p>
          <Link to="/">Quay về trang chủ</Link>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-container account-page">
        <div className="empty-state">
          <h1>Chưa có thông tin tài khoản</h1>
          <Link to="/">Quay về trang chủ</Link>
        </div>
      </main>
    );
  }

  const displayName = user.fullName || 'Chưa cập nhật';
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || 'U';
  const profileFields = [
    {
      label: 'Họ và tên',
      value: user.fullName || 'Chưa cập nhật',
      Icon: UserRound,
    },
    {
      label: 'Email',
      value: user.email || 'Chưa cập nhật',
      Icon: Mail,
    },
    {
      label: 'Số điện thoại',
      value: user.phone || 'Chưa cập nhật',
      Icon: Phone,
    },
    {
      label: 'Vai trò tài khoản',
      value: user.roleCode || 'Chưa xác định',
      Icon: ShieldCheck,
    },
  ];

  return (
    <main className="page-container account-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        Về trang chủ
      </Link>

      <section className="account-card">
        <div className="account-page-heading">
          <div className="account-page-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              avatarLetter
            )}
          </div>

          <div>
            <span className="section-eyebrow">MY ACCOUNT</span>
            <h1>Thông tin tài khoản</h1>
            <p>Thông tin được lấy từ tài khoản hiện tại của bạn.</p>
          </div>
        </div>

        <div className="account-profile-list">
          {profileFields.map(({ label, value, Icon }) => (
            <div className="account-profile-row" key={label}>
              <span className="account-profile-icon">
                <Icon size={19} />
              </span>

              <div className="account-profile-copy">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </div>
          ))}
        </div>

        <p className="account-readonly-note">
          Đây là trang xem thông tin. Chức năng chỉnh sửa hồ sơ chưa được
          hỗ trợ bởi API hiện tại.
        </p>

        <Link to="/my-bookings" className="primary-button">
          Xem lịch sử booking
        </Link>
      </section>
    </main>
  );
}