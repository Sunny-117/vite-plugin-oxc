import {useState, useMemo} from 'react';

export const useMethods = (initialValue, methods) => {
    const [value, setValue] = useState(initialValue);
    const boundMethods = useMemo(
        () => Object.entries(methods).reduce(
            (methods, [name, fn]) => {
                const method = (...args) => {
                    setValue(value => fn(value, ...args));
                };
                methods[name] = method;
                return methods;
            },
            {}
        ),
        [methods]
    );
    return [value, boundMethods];
};
