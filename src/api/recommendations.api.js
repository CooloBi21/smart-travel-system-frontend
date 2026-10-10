import API from './axios';

export const getRecommendationsApi = async () => {
  const response = await API.get('/recommendations');

  return response.data;
};
