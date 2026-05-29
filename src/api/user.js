import request from '../utils/request';

export function getUsers() {
  return request.get('/admin/users');
}

export function createUser(data) {
  return request.post('/admin/users', data);
}

export function updateUser(id, data) {
  return request.put(`/admin/users/${id}`, data);
}

export function deleteUser(id) {
  return request.delete(`/admin/users/${id}`);
}

export function changePassword(data) {
  return request.put('/admin/password', data);
}

export function getMe() {
  return request.get('/admin/me');
}