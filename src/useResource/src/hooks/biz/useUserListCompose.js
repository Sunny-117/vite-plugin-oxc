import {useArray} from '../common/useArray';
import {useTaskPendingState} from '../common/useTaskPendingState';

export const useUserList = requester => {
    const [users, {push, removeById, set}] = useArray([]);
    const [load, pending] = useTaskPendingState(requester, set);
    return [users, {pending, load, addUser: push, deleteUser: removeById}];
};
