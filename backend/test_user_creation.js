const fetch = require('node-fetch');

async function testUserCreation() {
  const baseUrl = 'http://localhost:3001/api';
  
  console.log('Testing child user creation endpoint...\n');
  
  try {
    // Test creating a child user
    const userData = {
      username: 'test_child_123',
      display_name: 'Emma Johnson',
      age: 8,
      school: 'Oakwood Elementary',
      laptop_id: 'laptop_test_001',
      session_start: new Date().toISOString(),
      user_type: 'child'
    };
    
    console.log('Creating user with data:', userData);
    
    const response = await fetch(`${baseUrl}/users/create-child`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ User created successfully!');
      console.log('Response:', result);
      
      // Test updating activity
      console.log('\nTesting activity update...');
      const activityResponse = await fetch(`${baseUrl}/users/update-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: result.data.user_id,
          last_active: new Date().toISOString()
        })
      });
      
      const activityResult = await activityResponse.json();
      
      if (activityResponse.ok) {
        console.log('✅ Activity updated successfully!');
        console.log('Response:', activityResult);
      } else {
        console.log('❌ Activity update failed:');
        console.log('Response:', activityResult);
      }
      
    } else {
      console.log('❌ User creation failed:');
      console.log('Status:', response.status);
      console.log('Response:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testUserCreation();
