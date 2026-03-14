const http = require('http');
const url = 'http://localhost:5000/api/comments/article/60ac1c06-2fd5-442a-b65f-2666c3b94897?page=1&limit=10';

http.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('BODY', body);
  });
}).on('error', (err) => {
  console.error('REQUEST ERROR', err);
});
