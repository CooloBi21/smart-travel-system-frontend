import API from './axios';

export const getMyDeparturesApi = async (tourId) => {
  const response = await API.get(
    `/tours/${tourId}/departures`,
  );

  return response.data;
};

export const getMyDepartureApi = async (
  tourId,
  departureId,
) => {
  const response = await API.get(
    `/tours/${tourId}/departures/${departureId}`,
  );

  return response.data;
};

export const createDepartureApi = async (
  tourId,
  payload,
) => {
  const response = await API.post(
    `/tours/${tourId}/departures`,
    payload,
  );

  return response.data;
};

export const updateDepartureApi = async (
  tourId,
  departureId,
  payload,
) => {
  const response = await API.patch(
    `/tours/${tourId}/departures/${departureId}`,
    payload,
  );

  return response.data;
};

export const updateDepartureStatusApi = async (
  tourId,
  departureId,
  status,
) => {
  const response = await API.patch(
    `/tours/${tourId}/departures/${departureId}/status`,
    { status },
  );

  return response.data;
};

export const deleteDepartureApi = async (
  tourId,
  departureId,
) => {
  const response = await API.delete(
    `/tours/${tourId}/departures/${departureId}`,
  );

  return response.data;
};
