async function testApiDirectly() {
  try {
    // First, let's find what users exist by checking the homepage or profile pages
    const baseUrl = 'http://localhost:3000';
    
    console.log('🔍 Testing FilmOdyssey API...');
    
    // Test 1: Check if the API is running
    console.log('\n1. Testing API health...');
    try {
      const healthResponse = await fetch(`${baseUrl}/api/auth/session`);
      console.log(`Session API status: ${healthResponse.status}`);
    } catch (error) {
      console.log('❌ API not reachable. Make sure the dev server is running!');
      console.log('   Run: npm run dev');
      return;
    }
    
    // Test 2: Let's try common usernames or get from your app
    const possibleUsernames = ['admin', 'user', 'test', 'demo', 'anshuman', 'marco'];
    
    for (const username of possibleUsernames) {
      console.log(`\n2. Testing user: ${username}`);
      const userResponse = await fetch(`${baseUrl}/api/user/${username}`);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log(`✅ User found: ${userData.username}`);
        
        // Test likes endpoint for this user
        console.log(`3. Testing likes for ${username}...`);
        const likesResponse = await fetch(`${baseUrl}/api/user/${username}/likes`);
        
        if (likesResponse.ok) {
          const films = await likesResponse.json();
          console.log(`✅ Likes API returned ${films.length} films`);
          
          if (films.length > 0) {
            console.log('📦 Films data:');
            films.forEach((film, index) => {
              console.log(`   ${index + 1}. ${film.title} (ID: ${film.id})`);
            });
          } else {
            console.log('   ℹ️ No films returned (user might not have liked any films yet)');
          }
        } else {
          console.log(`   ❌ Likes API error: ${likesResponse.status}`);
        }
        
        break; // Stop after finding first valid user
        
      } else {
        console.log(`   ❌ User ${username} not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testApiDirectly();