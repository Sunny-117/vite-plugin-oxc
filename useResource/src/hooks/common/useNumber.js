import {useMethods} from './useMethods';

const numberMethods = {
    increment(value) {
      return value + 1;
    },
    decrement(value) {
        return value - 1;
    },
    set(current, newValue) {
        return newValue;
    }
};

export const useNumber = (initialValue = 0) => {
    return useMethods(initialValue, numberMethods);
};
