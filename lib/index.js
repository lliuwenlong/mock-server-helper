const requireContext = require('require-context');
const path = require('path');

function mockServer (params) {
    const {devServer, mockDataPath, proxyApi} = params;
    const files = requireContext(mockDataPath, true, /\.js$/);

    files.keys().forEach(key => {
        const [method, fileName] = key.split(/\/|\\/);
        const name = path.basename(fileName, '.js');
        const data = files(key).default || files(key)
        if (proxyApi[method] && proxyApi[method][name]) {
            const url = proxyApi[method][name].pathName ? proxyApi[method][name].pathName : `/${name.replaceAll('_', '/')}`;
            devServer[method](url, (req, response) => {
                response.send(JSON.stringify(typeof data === 'function' ? data({
                    query: req.query,
                    body: req.body,
                }) : data))
            });
        }
    });
};

function createProxyApi(pathName, isProxy = true) {
    return {
        isProxy,
        pathName,
    };
}

export default {
    mockServer,
    createProxyApi
};
