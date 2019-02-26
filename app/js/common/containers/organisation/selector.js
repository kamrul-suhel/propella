import { createSelector } from 'reselect';

const getOrganisations = state => state.organisation;
const getOrganisation = (state, id) => state.organisation.collection[id] || {};
const getOrganisationTypes = state => state.organisationType;

export const makeGetOrganisation = () => createSelector([getOrganisation], obj => obj);
export const makeGetOrganisations = () => createSelector([getOrganisations], obj => obj);
export const makeGetOrganisationTypes = () => createSelector([getOrganisationTypes], obj => obj);
