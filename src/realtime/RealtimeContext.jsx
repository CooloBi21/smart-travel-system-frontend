import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  connectSocket,
  disconnectSocket,
} from './socket';

import { useAuth } from '../context/useAuth';
import { RealtimeContext } from './realtime-context';

export function RealtimeProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!isAuthenticated || !token) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket(token);

    if (!socket) {
      return undefined;
    }

    const handleBookingCreated = (payload) => {
      setNotifications((current) => [
        {
          id: `booking-${payload?.bookingId || Date.now()}`,
          type: 'booking.created',
          message:
            'Đặt tour của bạn đã được tạo thành công.',
          payload,
        },
        ...current,
      ]);
    };

    socket.on(
      'booking.created',
      handleBookingCreated,
    );

    return () => {
      socket.off(
        'booking.created',
        handleBookingCreated,
      );
    };
  }, [isAuthenticated, user]);

  const value = useMemo(
    () => ({
      notifications,
      clearNotifications: () => setNotifications([]),
      removeNotification: (notificationId) => {
        setNotifications((current) =>
          current.filter(
            (item) => item.id !== notificationId,
          ),
        );
      },
    }),
    [notifications],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
