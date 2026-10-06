import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { MapPin, Clock, Star, ThumbsUp, ThumbsDown, Smile } from 'lucide-react';

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  // State kích hoạt tải lại dữ liệu
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State Đặt tour
  const [quantity, setQuantity] = useState(1);
  const [departureDate, setDepartureDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });

  // State Gửi đánh giá
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  // Fetch thông tin Tour theo đúng chuẩn React (tránh race condition & cascading renders)
  useEffect(() => {
    let ignore = false;

    const fetchTourDetail = async () => {
      try {
        const res = await API.get(`/tours/${id}`);
        if (!ignore) {
          setTour(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết tour:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchTourDetail();

    return () => {
      ignore = true;
    };
  }, [id, refreshTrigger]);

  // Xử lý Đặt Tour
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt tour!');
      return navigate('/auth');
    }

    try {
      await API.post('/bookings', {
        tour_id: Number(id),
        quantity: Number(quantity),
        departure_date: departureDate
      });
      setBookingMessage({ type: 'success', text: 'Đặt tour thành công! Kiểm tra đơn hàng trong hệ thống.' });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setBookingMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi xử lý đặt tour' });
    }
  };

  // Xử lý Gửi Đánh Giá (AI Sentiment Analysis)
  const handleReview = async (e) => {
    e.preventDefault();
    setReviewMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để gửi đánh giá!');
      return navigate('/auth');
    }

    try {
      await API.post('/reviews', {
        tour_id: Number(id),
        rating: Number(rating),
        comment
      });
      setReviewMessage({ type: 'success', text: 'Đánh giá đã gửi! AI đã phân tích cảm xúc phản hồi của bạn.' });
      setComment('');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setReviewMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi gửi đánh giá' });
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải thông tin tour...</div>;
  if (!tour) return <div style={{ padding: '20px' }}>Không tìm thấy tour yêu cầu!</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      {/* THÔNG TIN TOUR CHI TIẾT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>{tour.title}</h1>
          <div style={{ display: 'flex', gap: '16px', color: '#6b7280', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {tour.destination_name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {tour.duration_days} Ngày</span>
          </div>

          <img
            src={tour.images && tour.images[0]?.image_url ? tour.images[0].image_url : 'https://via.placeholder.com/600x350'}
            alt={tour.title}
            style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }}
          />

          <h3>Mô tả chuyến đi</h3>
          <p style={{ lineHeight: '1.6', color: '#374151' }}>{tour.description}</p>
        </div>

        {/* FORM ĐẶT TOUR */}
        <div>
          <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Giá chỉ từ</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                {Number(tour.price).toLocaleString('vi-VN')} VNĐ
              </div>
              <span style={{ fontSize: '13px', color: '#059669' }}>Còn lại: {tour.available_seats} chỗ</span>
            </div>

            {bookingMessage.text && (
              <div style={{ padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', backgroundColor: bookingMessage.type === 'success' ? '#dcfce7' : '#fef2f2', color: bookingMessage.type === 'success' ? '#15803d' : '#dc2626' }}>
                {bookingMessage.text}
              </div>
            )}

            <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Ngày khởi hành</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Số lượng khách</label>
                <input
                  type="number"
                  min="1"
                  max={tour.available_seats}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={tour.available_seats <= 0}
                style={{ backgroundColor: tour.available_seats > 0 ? '#2563eb' : '#9ca3af', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: tour.available_seats > 0 ? 'pointer' : 'not-allowed', marginTop: '10px' }}
              >
                {tour.available_seats > 0 ? 'Xác Nhận Đặt Tour' : 'Hết Chỗ'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

      {/* KHU VỰC ĐÁNH GIÁ & AI SENTIMENT */}
      <section>
        <h2>Đánh Giá Từ Khách Hàng ({tour.reviews?.length || 0})</h2>

        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h4>Viết đánh giá của bạn</h4>
          {reviewMessage.text && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', backgroundColor: reviewMessage.type === 'success' ? '#dcfce7' : '#fef2f2', color: reviewMessage.type === 'success' ? '#15803d' : '#dc2626' }}>
              {reviewMessage.text}
            </div>
          )}

          <form onSubmit={handleReview}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ marginRight: '12px', fontSize: '14px' }}>Điểm đánh giá:</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }}>
                <option value="5">5 Sao (Rất tốt)</option>
                <option value="4">4 Sao (Tốt)</option>
                <option value="3">3 Sao (Bình thường)</option>
                <option value="2">2 Sao (Kém)</option>
                <option value="1">1 Sao (Rất tệ)</option>
              </select>
            </div>

            <textarea
              rows="3"
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về chuyến đi..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '12px' }}
            />

            <button type="submit" style={{ backgroundColor: '#059669', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Gửi Đánh Giá
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tour.reviews && tour.reviews.length > 0 ? (
            tour.reviews.map((rev) => (
              <div key={rev.id} style={{ border: '1px solid #f3f4f6', padding: '16px', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>{rev.full_name}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', color: '#eab308' }}>
                      <Star size={14} fill="#eab308" /> {rev.rating}/5
                    </span>

                    {rev.sentiment_label === 'POSITIVE' && (
                      <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ThumbsUp size={12} /> Tích cực ({Math.round(rev.sentiment_score * 100)}%)
                      </span>
                    )}
                    {rev.sentiment_label === 'NEGATIVE' && (
                      <span style={{ fontSize: '11px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ThumbsDown size={12} /> Tiêu cực ({Math.round(rev.sentiment_score * 100)}%)
                      </span>
                    )}
                    {rev.sentiment_label === 'NEUTRAL' && (
                      <span style={{ fontSize: '11px', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Smile size={12} /> Trung tính
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>{rev.comment}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#9ca3af' }}>Chưa có đánh giá nào cho tour này.</p>
          )}
        </div>
      </section>
    </div>
  );
}