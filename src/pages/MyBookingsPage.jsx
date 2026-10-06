import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const fetchMyBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để xem lịch sử đặt tour!');
        return navigate('/auth');
      }

      try {
        const res = await API.get('/bookings/my-bookings');
        if (!ignore) {
          setBookings(res.data.data || res.data);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách đơn đặt:', err);
        if (!ignore) {
          setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể tải lịch sử đặt tour' });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchMyBookings();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  // Xử lý Hủy đơn hàng (khi PENDING)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt tour này?')) return;

    try {
      await API.patch(`/bookings/${bookingId}/cancel`);
      setMessage({ type: 'success', text: 'Hủy đơn đặt tour thành công!' });
      setBookings((prev) =>
        prev.map((item) => (item.id === bookingId ? { ...item, status: 'CANCELLED' } : item))
      );
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể hủy đơn đặt tour này' });
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Đã xác nhận
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={14} /> Đã hủy
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> Chờ xác nhận
          </span>
        );
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải lịch sử đặt tour...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Lịch Sử Đặt Tour Của Tôi</h1>

      {message.text && (
        <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fef2f2', color: message.type === 'success' ? '#15803d' : '#dc2626' }}>
          {message.text}
        </div>
      )}

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <AlertCircle size={40} color="#9ca3af" style={{ marginBottom: '10px' }} />
          <p style={{ color: '#4b5563', margin: 0 }}>Bạn chưa có đơn đặt tour nào.</p>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginTop: '12px', fontWeight: 'bold' }}>
            Khám phá danh sách Tour ngay →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((item) => (
            <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>
                    <Link to={`/tours/${item.tour_id}`} style={{ textDecoration: 'none', color: '#1f2937' }}>
                      {item.tour_title || `Tour #${item.tour_id}`}
                    </Link>
                  </h3>
                  {renderStatusBadge(item.status)}
                </div>

                <div style={{ display: 'flex', gap: '20px', color: '#6b7280', fontSize: '14px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Khởi hành: {new Date(item.departure_date).toLocaleDateString('vi-VN')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} /> Số khách: {item.quantity} người
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#2563eb' }}>
                    Tổng tiền: {Number(item.total_price || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {item.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelBooking(item.id)}
                    style={{ backgroundColor: '#fff', color: '#dc2626', border: '1px solid #dc2626', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Hủy đơn
                  </button>
                )}

                {item.status === 'COMPLETED' && (
                  <Link
                    to={`/tours/${item.tour_id}`}
                    style={{ backgroundColor: '#059669', color: '#fff', textDecoration: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Star size={14} /> Đánh giá tour
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}