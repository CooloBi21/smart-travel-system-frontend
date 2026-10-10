import API from './axios';

export const getPlatformSettingsApi = async () => {
  const response = await API.get('/platform/settings');

  return response.data;
};

export const updatePlatformSettingsApi = async (payload) => {
  const response = await API.patch(
    '/platform/settings',
    payload,
  );

  return response.data;
};
