import API from './axios';

export const getRecommendationsApi = async (
  params = {},
) => {
  const response = await API.get(
    '/recommendations',
    {
      params,
    },
  );

  return response.data;
};
