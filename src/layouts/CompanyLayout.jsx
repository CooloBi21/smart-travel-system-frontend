import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  Compass,
  LayoutDashboard,
  LogOut,
  Map,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../context/useAuth';
import './company-layout.css';

export default function CompanyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="company-layout">
      <aside className="company-sidebar">
        <div className="company-sidebar-brand">
          <Compass size={24} />
          <div>
            <strong>Smart Travel</strong>
            <span>Company Portal</span>
          </div>
        </div>

        <div className="company-sidebar-section">
          <span className="company-sidebar-label">
            QUẢN TRỊ
          </span>

          <nav className="company-sidebar-nav">
            <NavLink
              to="/company"
              end
              className={({ isActive }) =>
                `company-nav-link${isActive ? ' active' : ''}`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink
              to="/company/tours"
              className={({ isActive }) =>
                `company-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Map size={18} />
              Tour
            </NavLink>

            <NavLink
              to="/company/bookings"
              className={({ isActive }) =>
                `company-nav-link${isActive ? ' active' : ''}`
              }
            >
              <CalendarCheck size={18} />
              Booking
            </NavLink>

            <NavLink
              to="/company/profile"
              className={({ isActive }) =>
                `company-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Building2 size={18} />
              Công ty
            </NavLink>
          </nav>
        </div>

        <div className="company-sidebar-bottom">
          <div className="company-sidebar-user">
            <UserRound size={17} />
            <div>
              <strong>{user?.fullName || 'Company Admin'}</strong>
              <span>Company Admin</span>
            </div>
          </div>

          <button
            type="button"
            className="company-sidebar-action"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={17} />
            Trang khách hàng
          </button>

          <button
            type="button"
            className="company-sidebar-action danger"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="company-main">
        <header className="company-topbar">
          <div>
            <span className="company-topbar-eyebrow">
              COMPANY PORTAL
            </span>
            <strong>Quản trị doanh nghiệp</strong>
          </div>
        </header>

        <div className="company-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
