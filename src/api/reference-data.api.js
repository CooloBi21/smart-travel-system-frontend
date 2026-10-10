import API from './axios';

export const getDestinationsApi = async () => {
  const response = await API.get('/destinations');
  return response.data;
};

export const getCategoriesApi = async () => {
  const response = await API.get('/categories');
  return response.data;
};

export const getAdminCategoriesApi = async () => {
  const response = await API.get('/categories/admin');
  return response.data;
};

export const createCategoryApi = async (payload) => {
  const response = await API.post(
    '/categories',
    payload,
  );
  return response.data;
};

export const updateCategoryApi = async (
  categoryId,
  payload,
) => {
  const response = await API.patch(
    `/categories/${categoryId}`,
    payload,
  );
  return response.data;
};

export const updateCategoryStatusApi = async (
  categoryId,
  isActive,
) => {
  const response = await API.patch(
    `/categories/${categoryId}/status`,
    { isActive },
  );
  return response.data;
};
