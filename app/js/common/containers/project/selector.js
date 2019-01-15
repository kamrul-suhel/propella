import { createSelector } from 'reselect';

const getProjects = state => state.project;
const getProject = (state, id) => state.project.collection[id] || {};

export const makeGetProject = () => createSelector([getProject], obj => obj);
export const makeGetProjects = () => createSelector([getProjects], obj => obj);