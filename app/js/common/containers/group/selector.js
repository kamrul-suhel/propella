import { createSelector } from 'reselect';

const getGroups = state => state.group;
const getGroup = (state, id) => state.group.collection[id] || {};

export const makeGetGroup = () => createSelector([getGroup], obj => obj);
export const makeGetGroups = () => createSelector([getGroups], obj => obj);