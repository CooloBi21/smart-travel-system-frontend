import { Outlet } from 'react-router-dom';

import Navbar from '../components/layout/Navbar';
import ChatbotWidget from '../components/chatbot/ChatbotWidget';
import { useAuth } from '../context/useAuth';

export default function CustomerLayout() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <>
      <Navbar />

      <div className="customer-layout">
        <Outlet />
      </div>

      {!loading && isAuthenticated && (
        <ChatbotWidget />
      )}
    </>
  );
}
