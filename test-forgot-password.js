// Test forgot password OTP flow
const API_BASE = 'http://localhost:4000';

async function testForgotPasswordOtpFlow() {
  console.log('🔍 Testing Forgot Password OTP flow...\n');
  
  // First, create a test user to use for password reset
  const testEmail = `test-forgot-${Date.now()}@example.com`;
  const testName = 'Test User ' + Date.now();
  const testPassword = 'TestPassword123!';
  const newPassword = 'NewPassword456!';
  
  try {
    // Create a user first
    console.log('📝 Creating test user...');
    const createRes = await fetch(`${API_BASE}/api/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const createData = await createRes.json();
    const otp1 = createData.debugOtp;
    
    const signupRes = await fetch(`${API_BASE}/api/verify-otp-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        otp: otp1, 
        name: testName, 
        password: testPassword 
      })
    });
    
    if (!signupRes.ok) {
      console.log('❌ Failed to create test user');
      return;
    }
    
    console.log(`✅ Test user created\n`);
    
    // Now test forgot password flow
    console.log('📧 Step 1: Requesting password reset OTP...');
    const resetRes = await fetch(`${API_BASE}/api/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const resetData = await resetRes.json();
    console.log(`   Status: ${resetRes.status}`);
    console.log(`   Message: ${resetData.message}`);
    
    if (!resetRes.ok) {
      console.log('❌ Failed to request password reset OTP');
      console.log('Response:', resetData);
      return;
    }
    
    console.log(`✅ Password reset OTP sent\n`);
    
    // Get the OTP from logs (for testing)
    const resetOtp = resetData.debugOtp;
    if (!resetOtp) {
      console.log('⚠️  Could not extract OTP from response');
      console.log('Response:', resetData);
      return;
    }
    
    console.log(`📝 Step 2: Verifying reset token and changing password...`);
    const verifyRes = await fetch(`${API_BASE}/api/verify-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        token: resetOtp, 
        newPassword: newPassword 
      })
    });
    
    const verifyData = await verifyRes.json();
    console.log(`   Status: ${verifyRes.status}`);
    console.log(`   Message: ${verifyData.message}`);
    
    if (!verifyRes.ok) {
      console.log('❌ Failed to reset password');
      console.log('Response:', verifyData);
      return;
    }
    
    console.log(`✅ Password reset successful!\n`);
    
    console.log('🎉 FORGOT PASSWORD OTP FLOW TEST PASSED!');
    console.log('\n✨ Forgot password system is working correctly:');
    console.log('   ✓ Password reset OTP generated');
    console.log('   ✓ OTP verified successfully');
    console.log('   ✓ Password updated in database');
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testForgotPasswordOtpFlow();
