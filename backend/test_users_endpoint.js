const https = require('https');
const http = require('http');

function httpRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => responseData,
          json: () => JSON.parse(responseData)
        });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testUsersEndpoint() {
  try {
    console.log('🧪 Testing /api/admin/users endpoint...\n');
    
    const response = await httpRequest('http://localhost:3001/api/admin/users?page=1&limit=10&sortBy=totalScore&sortOrder=desc', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const result = response.json();
      console.log('✅ Test successful!');
      console.log('\n📊 Users data:');
      console.log(`Total users: ${result.total}`);
      console.log(`Page: ${result.page} of ${result.totalPages}`);
      console.log('\nUser list:');
      
      result.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username || user.userId}`);
        console.log(`   Score: ${user.totalScore}`);
        console.log(`   Games: ${user.totalGamesPlayed}`);
        console.log(`   Level: ${user.highestLevel}`);
        console.log(`   Errors: ${user.totalErrors}`);
        console.log('');
      });
      
    } else {
      const error = response.text();
      console.error('❌ Test failed:', response.status, error);
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3001');
  }
}

testUsersEndpoint();
