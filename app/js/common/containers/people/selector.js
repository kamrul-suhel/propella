import { createSelector } from 'reselect';

const getPeople = state => state.people;
const getPerson = (state, id) => state.people.collection[id] || {};
const getPeopleTypes = state => state.peopleType;

export const makeGetPeople = () => createSelector([getPeople], obj => obj);
export const makeGetPerson = () => createSelector([getPerson], obj => obj);
export const makeGetPeopleTypes = () => createSelector([getPeopleTypes], obj => obj);
