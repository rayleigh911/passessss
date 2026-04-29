const https = require('https');

const data = JSON.stringify({
  email: "kamaloussama95@gmail.com",
  password: "password123", // or whatever defaults
  redirect: false,
});

const req = https.request({
  hostname: 'passessss.vercel.app',
  port: 443,
  path: '/api/auth/callback/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers['set-cookie']);
  
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
