import request from '../utils/request';

export function getSessions() {
  return request.get('/session');
}

export function createSession(name) {
  return request.post('/session', null, { params: { name } });
}

export function updateSession(data) {
  return request.put('/session', data);
}

export function deleteSession(id) {
  return request.delete(`/session/${id}`);
}