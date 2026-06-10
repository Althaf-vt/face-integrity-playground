/**
 * Debounces categorical signal changes — requires consecutive matching
 * raw readings before committing a new state.
 */
export function createDebouncedSignalTracker(initialState, debounceFrames = 3) {
  let currentState = initialState;
  let candidateState = null;
  let candidateCount = 0;

  return {
    update(rawState) {
      if (rawState === currentState) {
        candidateState = null;
        candidateCount = 0;
        return currentState;
      }

      if (rawState === candidateState) {
        candidateCount += 1;
        if (candidateCount >= debounceFrames) {
          currentState = rawState;
          candidateState = null;
          candidateCount = 0;
        }
      } else {
        candidateState = rawState;
        candidateCount = 1;
      }

      return currentState;
    },
    getState() {
      return currentState;
    },
    reset(nextState = initialState) {
      currentState = nextState;
      candidateState = null;
      candidateCount = 0;
    },
  };
}
