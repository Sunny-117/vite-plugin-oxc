import {useState, useCallback} from 'react';

export const useUserList = requester => {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);

    const load = async (...args) => {
        try {
            setPending(true);
            setUsers([]);
            const users = await requester(...args);
            setUsers(users);
        }
        catch (e) {
            setError(e.toString());
        }
        finally {
            setPending(false);
        }
    };

    const deleteUser = useCallback(
        id => setUsers(users => users.filter(user => user.id !== id)),
        []
    );
    const addUser = useCallback(
        user => setUsers(users => users.concat(user)),
        []
    );

    return [users, {pending, error, load, addUser, deleteUser}];
};
