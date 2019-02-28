import { createSelector } from "reselect";

const getCompetitors = state => state.competitor;
export const makeGetCompetitors = () =>
  createSelector(
    [getCompetitors],
    obj => obj
  );

const getCompetitor = (state, id) => state.competitor.collection[id] || {};
export const makeGetCompetitor = () =>
  createSelector(
    [getCompetitor],
    obj => obj
  );
