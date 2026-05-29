import request from '../utils/request';

export function getRanking(sessionId, category) {
  return request.get('/ranking', { params: { sessionId, category } });
}

export function exportRanking(sessionId, category) {
  return request.get('/ranking/export', {
    params: { sessionId, category },
    responseType: 'blob',
  });
}