import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  User,
  LogOut,
  CalendarCheck,
  Sparkles,
  Bell,
} from 'lucide-react';

import { useAuth } from '../../context/useAuth';
import { useRealtime } from '../../realtime/useRealtime';
import './layout.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    notifications,
    removeNotification,
  } = useRealtime();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Compass size={24} />
          <span>Smart Travel</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Trang chủ</Link>

          <Link to="/explore">
            Khám phá
          </Link>

          {isAuthenticated &&
            user?.roleCode === 'CUSTOMER' && (
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
                    {notifications
                      .slice(0, 5)
                      .map((notification) => (
                        <div
                          className="navbar-notification-item"
                          key={notification.id}
                        >
                          <p>
                            {notification.message}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeNotification(
                                notification.id,
                              )
                            }
                          >
                            Đóng
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <span className="navbar-user">
                <User size={17} />
                {user?.fullName || user?.email}
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
          ) : (
            <Link
              to="/auth"
              className="navbar-login"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}