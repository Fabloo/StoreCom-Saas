import { googleBusinessServiceAccountAPI } from './google-business-service-account';

async function testGoogleBusinessAPI() {
  try {
    console.log('Testing Google Business API with service account...');
    
    // Test getting accounts
    console.log('Fetching accounts...');
    const accounts = await googleBusinessServiceAccountAPI.getAccounts();
    console.log('Accounts found:', accounts.length);
    console.log('First account:', accounts[0]);
    
    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      
      // Test getting locations for the first account
      console.log('Fetching locations for account:', firstAccount.name);
      const locations = await googleBusinessServiceAccountAPI.getLocations(firstAccount.name);
      console.log('Locations found:', locations.length);
      
      if (locations.length > 0) {
        const firstLocation = locations[0];
        console.log('First location:', firstLocation);
        
        // Test getting location details
        console.log('Fetching detailed location info...');
        const locationDetails = await googleBusinessServiceAccountAPI.getLocation(firstLocation.name);
        console.log('Location details:', locationDetails);
      }
    }
    
    console.log('✅ Google Business API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing Google Business API:', error);
    throw error;
  }
}

// Export for use in other files
export { testGoogleBusinessAPI };

// Run test if this file is executed directly
if (require.main === module) {
  testGoogleBusinessAPI()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
} 