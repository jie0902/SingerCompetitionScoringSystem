import request from '../utils/request';

export function getConfig() {
  return request.get('/config');
}

export function updateConfig(data) {
  return request.put('/config', data);
}