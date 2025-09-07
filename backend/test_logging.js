// Test script to send a sample classification log to the backend
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

async function testClassificationLogging() {
  const testData = {
    errors: [
      {
        timestamp: new Date().toISOString(),
        error: "Image classification failed: test-forest-image.jpg",
        context: "User classified as \"water\", correct answer was \"forest\". Level: Forest vs Water, Tile ID: 1-1",
        level: "error",
        userAgent: "Test Script",
        url: "http://localhost:5174/",
        userId: "test_user_123",
        imageName: "test-forest-image.jpg",
        classificationAttempt: "water",
        correctClassification: "forest",
        errorType: "image_classification",
        gameLevel: 1
      },
      {
        timestamp: new Date().toISOString(),
        error: "Image classification success: test-water-image.jpg",
        context: "Correctly classified as \"water\"",
        level: "info",
        userAgent: "Test Script",
        url: "http://localhost:5174/",
        userId: "test_user_123",
        imageName: "test-water-image.jpg",
        classificationAttempt: "water",
        correctClassification: "water",
        errorType: "image_classification_success",
        gameLevel: 1
      }
    ]
  };

  try {
    console.log('🧪 Testing classification logging...');
    
    const response = await httpRequest('http://localhost:3001/api/errors/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, JSON.stringify(testData));

    if (response.ok) {
      const result = response.json();
      console.log('✅ Test successful:', result);
      console.log('\nRun "node view_classifications.js" to see the logged data!');
    } else {
      const error = response.text();
      console.error('❌ Test failed:', response.status, error);
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3001');
  }
}

testClassificationLogging();
