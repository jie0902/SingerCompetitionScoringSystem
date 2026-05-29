import request from '../utils/request';

export function getSingerPage(params) {
  return request.get('/singer/page', { params });
}

export function getSingerList(params) {
  return request.get('/singer/list', { params });
}

export function getSingerById(id) {
  return request.get(`/singer/${id}`);
}

export function saveSinger(data) {
  return request.post('/singer', data);
}

export function updateSinger(data) {
  return request.put('/singer', data);
}

export function deleteSinger(id) {
  return request.delete(`/singer/${id}`);
}