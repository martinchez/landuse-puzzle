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

async function testUsersWithSort() {
  try {
    console.log('🧪 Testing /api/admin/users endpoint with snake_case sort...\n');
    
    // Test with total_score sort (should work)
    const response = await httpRequest('http://localhost:3001/api/admin/users?page=1&limit=10&sortBy=total_score&sortOrder=desc', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const result = response.json();
      console.log('✅ Snake_case sort test successful!');
      console.log('\n📊 Users data (sorted by total_score desc):');
      console.log(`Total users: ${result.total}`);
      console.log('\nUser list:');
      
      result.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username || user.userId} - Score: ${user.totalScore}`);
      });

      // Test with total_games_played sort
      console.log('\n---\n');
      const response2 = await httpRequest('http://localhost:3001/api/admin/users?page=1&limit=10&sortBy=total_games_played&sortOrder=desc', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response2.ok) {
        const result2 = response2.json();
        console.log('✅ Games played sort test successful!');
        console.log('\n📊 Users data (sorted by total_games_played desc):');
        
        result2.users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username || user.userId} - Games: ${user.totalGamesPlayed}`);
        });
      }
      
    } else {
      const error = response.text();
      console.error('❌ Test failed:', response.status, error);
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testUsersWithSort();
