import { api } from "app/utils";

const defaultState = {
  collection: {},
  currentCollection: [],
  error: null,
  isLoading: true,
  misc: {},
  pager: {}
};

export default function competitor(state = defaultState, action) {
  switch (action.type) {
    case "COMPETITOR_PENDING": {
      return {
        ...state,
        isLoading: true
      };
    }

    case "COMPETITOR_REJECTED": {
      return {
        ...state,
        isLoading: false,
        error: action.payload.data
      };
    }

    case "COMPETITOR_FULFILLED": {
      const normalizedData = api.normalizeData(state, action);
      return {
        ...state,
        isLoading: false,
        ...normalizedData
      };
    }

    case "COMPETITOR_RESET": {
      return defaultState;
    }

    case "COMPETITOR_DELETED": {
      return {
        ...state,
        isLoading: false,
        collection: _.pickBy(state.collection, (o) => o.id !== action.payload.id)
      };
    }

    default: {
      return state;
    }
  }
}
