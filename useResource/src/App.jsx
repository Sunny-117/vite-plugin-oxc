import {BoundaryConfigProvider} from 'react-suspense-boundary';
import UserList from './components/UserList';
import CustomerList from './components/CustomerList';

const commonStyle = {
    minHeight: '50px', borderBottom: '1px dashed #ccc'
};

const defaultRenderError = (error, {recover}) => {
    // 一般 error 会是海若格式的对象，所以还需要有一个 formatError
    const formatError = v => v.toString(); // 这里随意 mock 下，转字符串完事

    return <div style={commonStyle}>
        <div>兜底出错：{formatError(error)}</div>
        <button onClick={recover}>任性重试</button>
    </div>
};

const defaultPendingFallback = (
    <div style={commonStyle}>数据加载中...</div>
);

export default function App() {
    // 这样 BoundaryConfigProvider 注册好一次后，下面的 Boundary 或 withBoundary HOC 都生效
    return (
        <BoundaryConfigProvider
            pendingFallback={defaultPendingFallback}
            renderError={defaultRenderError}
        >
            <UserList />
            <CustomerList />
        </BoundaryConfigProvider>
    );
}
