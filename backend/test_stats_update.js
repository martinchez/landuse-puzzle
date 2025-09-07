const fetch = require('node-fetch');

async function testStatsUpdate() {
  console.log('🧪 Testing user stats update endpoint...\n');
  
  try {
    // Test updating stats for the recently created user
    const userId = 'child_1757236780133_jjaxq1n9r'; // From the logs
    
    const statsData = {
      user_id: userId,
      level_completed: 2,
      score_gained: 250,
      play_time_minutes: 3
    };
    
    console.log('Updating stats for user:', userId);
    console.log('Stats data:', statsData);
    
    const response = await fetch('http://localhost:3001/api/users/update-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statsData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Stats updated successfully!');
      console.log('Response:', result);
    } else {
      const error = await response.json();
      console.log('❌ Stats update failed:');
      console.log('Status:', response.status);
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStatsUpdate();
