import API from './axios';

export const getPlatformAnalyticsApi = async () => {
  const response = await API.get('/analytics/platform');

  return response.data;
};
