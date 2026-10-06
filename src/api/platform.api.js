import API from './axios';

export const approveCompanyApi = async (companyId) => {
  const response = await API.patch(
    `/companies/${companyId}/approve`,
  );

  return response.data;
};
