import API from './axios';

export const getPublicToursApi = async () => {
  const response = await API.get('/tours/public');

  return response.data;
};

export const getPublicTourApi = async (
  companySlug,
  tourSlug,
) => {
  const response = await API.get(
    `/tours/public/${companySlug}/${tourSlug}`,
  );

  return response.data;
};

export const getPublicDeparturesApi = async (
  companySlug,
  tourSlug,
) => {
  const response = await API.get(
    `/tours/public/${companySlug}/${tourSlug}/departures`,
  );

  return response.data;
};

export const getMyToursApi = async () => {
  const response = await API.get('/tours/mine');

  return response.data;
};

export const getMyTourApi = async (tourId) => {
  const response = await API.get(
    `/tours/mine/${tourId}`,
  );

  return response.data;
};

export const createTourApi = async (payload) => {
  const response = await API.post(
    '/tours',
    payload,
  );

  return response.data;
};

export const updateMyTourApi = async (
  tourId,
  payload,
) => {
  const response = await API.patch(
    `/tours/mine/${tourId}`,
    payload,
  );

  return response.data;
};

export const publishMyTourApi = async (tourId) => {
  const response = await API.patch(
    `/tours/mine/${tourId}/publish`,
  );

  return response.data;
};

export const pauseMyTourApi = async (tourId) => {
  const response = await API.patch(
    `/tours/mine/${tourId}/pause`,
  );

  return response.data;
};

export const archiveMyTourApi = async (tourId) => {
  const response = await API.patch(
    `/tours/mine/${tourId}/archive`,
  );

  return response.data;
};
