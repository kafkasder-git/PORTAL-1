/**
 * Test Appwrite Connection Script
 * Tests the connection to Appwrite backend
 */

import { appwriteApi } from '@/shared/lib/api/appwrite-api';

export async function testAppwriteConnection() {
  console.log('Testing Appwrite connection...');

  try {
    // Test authentication (this will fail without session, but should not crash)
    console.log('Testing authentication...');
    try {
      await appwriteApi.auth.getCurrentUser();
      console.log('✅ Authentication working');
    } catch (error: any) {
      console.log('ℹ️ Authentication expected to fail without session:', error.message);
    }

    // Test dashboard metrics
    console.log('Testing dashboard metrics...');
    const metrics = await appwriteApi.dashboard.getMetrics();
    console.log('✅ Dashboard API working:', metrics);

    // Test beneficiaries
    console.log('Testing beneficiaries API...');
    const beneficiaries = await appwriteApi.beneficiaries.getBeneficiaries({ page: 1, limit: 5 });
    console.log(`✅ Beneficiaries API working: ${beneficiaries.total} total records`);

    // Test donations
    console.log('Testing donations API...');
    const donations = await appwriteApi.donations.getDonations({ page: 1, limit: 5 });
    console.log(`✅ Donations API working: ${donations.total} total records`);

    console.log('🎉 All Appwrite connections working!');

  } catch (error: any) {
    console.error('❌ Appwrite connection failed:', error.message);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  testAppwriteConnection().catch(console.error);
}
