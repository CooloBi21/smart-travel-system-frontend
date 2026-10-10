import api from './axios';

export async function createReviewApi(data) {
  const response = await api.post('/reviews', data);
  return response.data;
}

export async function getMyReviewsApi() {
  const response = await api.get('/reviews/mine');
  return response.data;
}

export async function getMyReviewByIdApi(reviewId) {
  const response = await api.get(`/reviews/mine/${reviewId}`);
  return response.data;
}

export async function updateReviewApi(reviewId, data) {
  const response = await api.patch(
    `/reviews/mine/${reviewId}`,
    data,
  );
  return response.data;
}
