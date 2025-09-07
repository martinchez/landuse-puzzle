const fetch = require('node-fetch');

async function testStatsUpdate() {
  console.log('🧪 Testing user stats update with actual user ID...\n');
  
  try {
    // Use the user ID we know exists
    const userId = 'child_1757236780133_jjaxq1n9r';
    
    const statsData = {
      user_id: userId,
      level_completed: 2,
      score_gained: 200,
      play_time_minutes: 3
    };
    
    console.log('Testing with data:', statsData);
    
    const response = await fetch('http://localhost:3001/api/users/update-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statsData)
    });
    
    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Stats updated successfully!');
    } else {
      console.log('❌ Stats update failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStatsUpdate();
