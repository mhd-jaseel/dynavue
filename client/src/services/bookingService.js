import api from '../lib/api';

export const createEnquiry = async (data) => {
  const res = await api.post('/enquiries', data);
  return res.data;
};
