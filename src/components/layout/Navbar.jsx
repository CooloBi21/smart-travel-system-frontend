import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  CircleUserRound,
  Compass,

  LogOut,

  Sparkles,
  User,
} from 'lucide-react';

import { useAuth } from '../../context/useAuth';
import { useRealtime } from '../../realtime/useRealtime';
import './layout.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, removeNotification } = useRealtime();
  const navigate = useNavigate();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    logout();
    navigate('/');
  };

  const isCustomer =
    isAuthenticated && user?.roleCode === 'CUSTOMER';
  const displayName = user?.fullName || user?.email || 'Tài khoản';
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Compass size={24} />
          <span>Smart Travel</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Trang chủ</Link>

          <Link to="/explore">Khám phá</Link>

          {isCustomer && (
            <>
              <Link to="/recommendations">
                <Sparkles size={16} />
                Gợi ý cho bạn
              </Link>

              <Link to="/my-bookings">
                <CalendarCheck size={16} />
                Đặt chỗ của tôi
              </Link>
            </>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="navbar-notification-wrapper">
                <button
                  type="button"
                  className="navbar-notification"
                  aria-label="Thông báo"
                >
                  <Bell size={18} />

                  {notifications.length > 0 && (
                    <span className="navbar-notification-count">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {notifications.length > 0 && (
                  <div className="navbar-notification-panel">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        className="navbar-notification-item"
                        key={notification.id}
                      >
                        <p>{notification.message}</p>

                        <button
                          type="button"
                          onClick={() =>
                            removeNotification(notification.id)
                          }
                        >
                          Đóng
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isCustomer ? (
                <div
                  className="navbar-account"
                  ref={accountMenuRef}
                >
                  <button
                    type="button"
                    className="navbar-account-trigger"
                    aria-label="Mở menu tài khoản"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                    onClick={() =>
                      setAccountMenuOpen((open) => !open)
                    }
                  >
                    <span className="navbar-account-avatar">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" />
                      ) : (
                        avatarLetter
                      )}
                    </span>

                    <span className="navbar-account-name">
                      {displayName}
                    </span>

                    <ChevronDown
                      size={16}
                      className={
                        accountMenuOpen
                          ? 'navbar-account-chevron is-open'
                          : 'navbar-account-chevron'
                      }
                    />
                  </button>

                  {accountMenuOpen && (
                    <div
                      className="navbar-account-menu"
                      role="menu"
                    >
                      <div className="navbar-account-info">
                        <span className="navbar-account-avatar navbar-account-avatar-large">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" />
                          ) : (
                            avatarLetter
                          )}
                        </span>

                        <div className="navbar-account-identity">
                          <strong>{displayName}</strong>
                          <span>{user?.email || ''}</span>
                        </div>
                      </div>

                      <div className="navbar-account-divider" />

                      <Link
                        to="/account"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <CircleUserRound size={18} />
                        Thông tin tài khoản
                      </Link>

                      <Link
                        to="/my-bookings"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <CalendarCheck size={18} />
                        Lịch sử booking
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <span className="navbar-user">
                    <User size={17} />
                    {displayName}
                  </span>

                  {user?.roleCode === 'COMPANY_ADMIN' && (
                    <Link to="/company">
                      Quản trị công ty
                    </Link>
                  )}

                  <button
                    type="button"
                    className="navbar-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </>
              )}
            </>
          ) : (
            <Link to="/auth" className="navbar-login">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
