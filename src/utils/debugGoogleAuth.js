// Debug utility for Google OAuth
export const debugGoogleAuth = (response) => {
  console.log('=== Google OAuth Debug Info ===');
  console.log('Full response:', response);
  console.log('Response type:', typeof response);
  console.log('Response keys:', Object.keys(response));
  
  if (response.access_token) {
    console.log('✅ Access token found:', response.access_token.substring(0, 20) + '...');
  } else {
    console.log('❌ No access_token found');
  }
  
  if (response.credential) {
    console.log('✅ Credential found:', response.credential.substring(0, 20) + '...');
  } else {
    console.log('❌ No credential found');
  }
  
  console.log('=== End Debug Info ===');
};

export const testBackendConnection = async () => {
  try {
    const response = await fetch('https://agribazaar-backend.vercel.app/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleToken: 'test_token'
      })
    });
    
    const data = await response.json();
    console.log('Backend test response:', data);
    return data;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return null;
  }
};
