import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function CustomerLayout() {
  return (
    <>
      <Navbar />

      <div className="customer-layout">
        <Outlet />
      </div>
    </>
  );
}
