import {useState} from 'react';
import {useResource, withBoundary} from 'react-suspense-boundary';
import {fetchCustomerList} from '../request';
import User from './User';

const commonStyle = {
    minHeight: '50px', borderBottom: '1px dashed #ccc'
};
const renderError = error => (
    <div style={commonStyle}>
        顾客列表加载出错：{error.toString()}
    </div>
);
const pendingFallback = (
    <div style={commonStyle}>顾客列表加载中...</div>
);

const CustomerList = () => {
    const [pageNo, setPageNo] = useState(1);
    const switchPager = () => {
        setPageNo(3 - pageNo); // mock 切换页码
    };
    const [customers] = useResource(fetchCustomerList, {pageNo});

    return (
        <div style={commonStyle}>
            {
                customers.map(customer => (
                    <User
                        key={customer.id}
                        id={customer.id}
                        text={customer.text}
                    />
                ))
            }
            <button onClick={switchPager}>换页</button>
        </div>
    );
};

// 值得一提的是，如果用 Boundary 包裹组件，无法应对 map 碰到空指针。withBoundary HOC 可以
export default withBoundary({renderError, pendingFallback})(CustomerList);
