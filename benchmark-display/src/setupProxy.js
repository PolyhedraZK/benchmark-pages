const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.github.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/', // remove /api prefix when forwarding to GitHub
      },
    })
  );
  
  app.use(
    '/storage',
    createProxyMiddleware({
      target: 'https://storage.googleapis.com',
      changeOrigin: true,
      pathRewrite: {
        '^/storage': '/', // remove /storage prefix when forwarding to Google Cloud Storage
      },
    })
  );
};