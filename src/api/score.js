import request from '../utils/request';

export function getIndividualScores(sessionId, category) {
  return request.get('/scores/individual', { params: { sessionId, category } });
}

export function saveIndividualScores(sessionId, data) {
  return request.put('/scores/individual', data, { params: { sessionId } });
}

export function getGroupScores(sessionId, category) {
  return request.get('/scores/group', { params: { sessionId, category } });
}

export function saveGroupScores(sessionId, data) {
  return request.put('/scores/group', data, { params: { sessionId } });
}

export function getPopularityScores(sessionId) {
  return request.get('/scores/popularity', { params: { sessionId } });
}

export function savePopularityScores(sessionId, data) {
  return request.put('/scores/popularity', data, { params: { sessionId } });
}