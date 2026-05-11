require('dotenv').config();
const fs = require('fs');

async function test() {
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let data = '';
  
  data += '--' + boundary + '\r\n';
  data += 'Content-Disposition: form-data; name="title"\r\n\r\n';
  data += 'test\r\n';
  
  data += '--' + boundary + '\r\n';
  data += 'Content-Disposition: form-data; name="category"\r\n\r\n';
  data += 'test\r\n';
  
  data += '--' + boundary + '\r\n';
  data += 'Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n';
  data += 'Content-Type: image/jpeg\r\n\r\n';
  data += 'test data\r\n';
  
  data += '--' + boundary + '--\r\n';

  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) // Guessing default credentials
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // 2. Upload
    const res = await fetch('http://localhost:5000/api/photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Authorization': 'Bearer ' + token
      },
      body: data
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error(err);
  }
}
test();
