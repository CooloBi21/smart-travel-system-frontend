import API from './axios';

export const loginApi = async (email, password) => {
  const response = await API.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const registerApi = async (payload) => {
  const response = await API.post('/auth/register', payload);

  return response.data;
};

export const getMeApi = async () => {
  const response = await API.get('/auth/me');

  return response.data;
};
