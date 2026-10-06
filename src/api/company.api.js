import API from './axios';

export const getMyCompanyApi = async () => {
  const response = await API.get('/companies/me');
  return response.data;
};

export const getActiveCompanyContextApi = async () => {
  const response = await API.get('/companies/active-context');
  return response.data;
};
