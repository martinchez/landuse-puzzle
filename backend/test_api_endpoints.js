const fetch = require('node-fetch');

async function testAPIEndpoints() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🧪 Testing Backend API Endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Test users endpoint
    console.log('\n2. Testing Users Endpoint...');
    const usersResponse = await fetch(`${baseURL}/api/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Users:', usersData);
    
    // Test game states endpoint
    console.log('\n3. Testing Game States Endpoint...');
    const gameStatesResponse = await fetch(`${baseURL}/api/game-states`);
    if (gameStatesResponse.ok) {
      const gameStatesData = await gameStatesResponse.json();
      console.log('✅ Game States:', gameStatesData);
    } else {
      console.log('⚠️ Game States endpoint may require authentication');
    }
    
    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

testAPIEndpoints();
