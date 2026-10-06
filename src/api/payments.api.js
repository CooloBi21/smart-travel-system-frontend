import API from './axios';

export const createPaymentApi = async (payload) =>
  (await API.post('/payments', payload)).data;

export const simulatePaymentApi = async (paymentId, result) =>
  (
    await API.post(`/payments/${paymentId}/simulate`, {
      result,
    })
  ).data;
