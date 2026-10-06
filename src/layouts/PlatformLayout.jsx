import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  Compass,
  LayoutDashboard,
  LogOut,
  Settings,
  Tags,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../context/useAuth';

import './platform-layout.css';

export default function PlatformLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="platform-layout">
      <aside className="platform-sidebar">
        <div className="platform-sidebar-brand">
          <Compass size={24} />

          <div>
            <strong>Smart Travel</strong>
            <span>Platform Admin</span>
          </div>
        </div>

        <div className="platform-sidebar-section">
          <span className="platform-sidebar-label">
            QUẢN TRỊ NỀN TẢNG
          </span>

          <nav className="platform-sidebar-nav">
            <NavLink
              to="/platform"
              end
              className={({ isActive }) =>
                `platform-nav-link${isActive ? ' active' : ''}`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink
              to="/platform/companies"
              className={({ isActive }) =>
                `platform-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Building2 size={18} />
              Công ty
            </NavLink>

            <NavLink
              to="/platform/categories"
              className={({ isActive }) =>
                `platform-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Tags size={18} />
              Danh mục
            </NavLink>

            <NavLink
              to="/platform/analytics"
              className={({ isActive }) =>
                `platform-nav-link${isActive ? ' active' : ''}`
              }
            >
              <BarChart3 size={18} />
              Phân tích
            </NavLink>

            <NavLink
              to="/platform/settings"
              className={({ isActive }) =>
                `platform-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Settings size={18} />
              Cài đặt
            </NavLink>
          </nav>
        </div>

        <div className="platform-sidebar-bottom">
          <div className="platform-sidebar-user">
            <UserRound size={17} />

            <div>
              <strong>
                {user?.fullName || 'Platform Admin'}
              </strong>

              <span>Platform Admin</span>
            </div>
          </div>

          <button
            type="button"
            className="platform-sidebar-action"
            onClick={() => navigate('/')}
          >
            <Compass size={17} />
            Trang khách hàng
          </button>

          <button
            type="button"
            className="platform-sidebar-action danger"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="platform-main">
        <header className="platform-topbar">
          <div>
            <span className="platform-topbar-eyebrow">
              PLATFORM ADMIN
            </span>

            <strong>
              Quản trị hệ thống Smart Travel
            </strong>
          </div>
        </header>

        <div className="platform-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
