import { createSelector } from 'reselect';

const getProjectGroups = (state, projectId) => {
    return ((state.project.collection || {})[projectId] || {}).groups || {}
}

const getProjectGroup = (state, projectId, id) => {
  if(_.isEmpty(state.project.collection[projectId])){
    return {}
  }
  return _.find(state.project.collection[projectId].groups, {id: Number(id)})
}

export const makeGetProjectGroup = () => createSelector([getProjectGroup], obj => obj);
export const makeGetProjectGroups = () => createSelector([getProjectGroups], obj => obj);

const getGroups = state => state.group;
const getGroup = (state, id) => state.group.collection[id] || {};

export const makeGetGroup = () => createSelector([getGroup], obj => obj);
export const makeGetGroups = () => createSelector([getGroups], obj => obj);
