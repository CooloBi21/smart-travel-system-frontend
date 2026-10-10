import API from './axios';

export const getMyBookingsApi = async () => {
  const response = await API.get('/bookings');

  return response.data;
};

export const getBookingApi = async (bookingId) => {
  const response = await API.get(
    `/bookings/${bookingId}`,
  );

  return response.data;
};

export const createBookingApi = async (payload) => {
  const response = await API.post(
    '/bookings',
    payload,
  );

  return response.data;
};

export const getCompanyBookingsApi = async () => {
  const response = await API.get('/bookings/company');

  return response.data;
};

export const getCompanyBookingApi = async (bookingId) => {
  const response = await API.get(
    `/bookings/company/${bookingId}`,
  );

  return response.data;
};

export const updateCompanyBookingStatusApi = async (bookingId, status) => {
  const response = await API.patch(
    `/bookings/company/${bookingId}/status`,
    { status },
  );

  return response.data;
};