import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import CustomerLayout from '../layouts/CustomerLayout';
import CompanyLayout from '../layouts/CompanyLayout';
import PlatformLayout from '../layouts/PlatformLayout';

import AuthPage from '../pages/auth/AuthPage';

import HomePage from '../pages/customer/HomePage';
import ExplorePage from '../pages/customer/ExplorePage';
import TourDetailPage from '../pages/customer/TourDetailPage';
import BookingPage from '../pages/customer/BookingPage';
import PaymentPage from '../pages/customer/PaymentPage';
import BookingHistoryPage from '../pages/customer/BookingHistoryPage';
import ReviewsPage from '../pages/customer/ReviewsPage';
import RecommendationPage from '../pages/customer/RecommendationPage';
import AccountPage from '../pages/customer/AccountPage';

import CompanyDashboardPage from '../pages/company/DashboardPage';
import ToursPage from '../pages/company/ToursPage';
import TourFormPage from '../pages/company/TourFormPage';
import DeparturesPage from '../pages/company/DeparturesPage';
import BookingsPage from '../pages/company/BookingsPage';
import CompanyProfilePage from '../pages/company/CompanyProfilePage';

import PlatformDashboardPage from '../pages/platform/DashboardPage';
import CompaniesPage from '../pages/platform/CompaniesPage';
import CategoriesPage from '../pages/platform/CategoriesPage';
import AnalyticsPage from '../pages/platform/AnalyticsPage';
import SettingsPage from '../pages/platform/SettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/auth" element={<AuthPage />} />

      {/* CUSTOMER */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route
          path="/tours/:companySlug/:tourSlug"
          element={<TourDetailPage />}
        />

        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/account" element={<AccountPage />} />
          <Route
            path="/tours/:companySlug/:tourSlug/booking"
            element={<BookingPage />}
          />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/my-bookings" element={<BookingHistoryPage />} />
          <Route path="/my-reviews" element={<ReviewsPage />} />
          <Route path="/recommendations" element={<RecommendationPage />} />
        </Route>
      </Route>

      {/* COMPANY */}
      <Route element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']} />}>
        <Route path="/company" element={<CompanyLayout />}>
          <Route index element={<CompanyDashboardPage />} />
          <Route path="tours" element={<ToursPage />} />
          <Route path="tours/new" element={<TourFormPage />} />
          <Route path="tours/:tourId/edit" element={<TourFormPage />} />
          <Route
            path="tours/:tourId/departures"
            element={<DeparturesPage />}
          />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="profile" element={<CompanyProfilePage />} />
        </Route>
      </Route>

      {/* PLATFORM */}
      <Route element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />}>
        <Route element={<PlatformLayout />}>
          <Route path="/platform" element={<PlatformDashboardPage />}/>
          <Route path="/platform/companies" element={<CompaniesPage />} />
          <Route path="/platform/categories" element={<CategoriesPage />} />
          <Route path="/platform/analytics" element={<AnalyticsPage />} />
          <Route path="/platform/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
