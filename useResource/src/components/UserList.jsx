import {useState, useEffect} from 'react';
import {withBoundary} from 'react-suspense-boundary';
import {useUserList} from '../hooks/biz/useUserList';
import {fetchUserList} from '../request';
import User from './User';

const commonStyle = {
    minHeight: '50px', borderBottom: '1px dashed #ccc'
};

const UserList = () => {
    const [pageNo, setPageNo] = useState(1);
    const switchPager = () => {
        setPageNo(3 - pageNo); // mock 切换页码
    };

    const [users, {pending, error, load}] = useUserList(fetchUserList);
    useEffect(() => {
        load({pageNo});
    }, [pageNo]);

    if (pending) {
        return <div style={commonStyle}>用户列表加载中...</div>;
    }
    if (error) {
        return <div style={commonStyle}>用户列表加载出错：{error}</div>;
    }

    return (
        <div style={commonStyle}>
            {
                users.map(user => (
                    <User
                        key={user.id}
                        id={user.id}
                        text={user.text}
                    />
                ))
            }
            <button onClick={switchPager}>换页</button>
        </div>
    );
};

export default withBoundary()(UserList);
