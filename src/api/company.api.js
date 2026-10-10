import API from './axios';

export const getMyCompanyApi = async () => {
  const response = await API.get('/companies/me');
  return response.data;
};

export const getActiveCompanyContextApi = async () => {
  const response = await API.get('/companies/active-context');
  return response.data;
};

export const getCompaniesApi = async () => {
  const response = await API.get('/companies');
  return response.data;
};

export const approveCompanyApi = async (companyId) => {
  const response = await API.patch(
    `/companies/${companyId}/approve`,
  );
  return response.data;
};
