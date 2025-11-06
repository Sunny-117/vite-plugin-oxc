const getRandomSuffix = () => Math.floor(Math.random() * 10000);

const makeRequester = path => (params = {}) => new Promise((resolve, reject) => {
    const {pageNo} = params;
    setTimeout(() => { // 我这里就用 setTimeout 模拟一段逻辑了
        if (Math.random() < 0.2) {
            return reject(`mock ${path} 后端出错`);
        }
        const offset = (pageNo - 1) * 10;
        resolve(Math.random() < 0.3 ? null : [ // mock 后端给数据不符合预期
            {id: offset + 1, text: `${path}-${offset + 1}-${getRandomSuffix()}`},
            {id: offset + 2, text: `${path}-${offset + 2}-${getRandomSuffix()}`}
        ]);
    }, 1000 + Math.floor(Math.random() * 1000));
});

export const fetchUserList = makeRequester('/data/user/list');

export const fetchCustomerList = makeRequester('/data/customer/list');
