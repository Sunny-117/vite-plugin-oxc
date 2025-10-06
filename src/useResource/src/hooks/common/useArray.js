import {useMethods} from './useMethods';

const arrayMethods = {
    push(state, item) {
        return state.concat(item);
    },
    pop(state) {
        return state.slice(0, -1);
    },
    slice(state, start, end) {
        return state.slice(start, end);
    },
    empty() {
        return [];
    },
    set(state, newValue) {
        return newValue;
    },
    remove(state, item) {
        const index = state.indexOf(item);
        if (index < 0) {
            return state;
        }
        return [...state.slice(0, index), ...state.slice(index + 1)];
    },
    removeById(state, id) {
        return state.filter(item => item.id !== id);
    }
};

export const useArray = (initialValue = []) => {
    return useMethods(initialValue, arrayMethods);
};
