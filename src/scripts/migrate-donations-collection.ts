/**
 * Migration Script: Add receipt_file_id to donations collection
 */

import { serverDatabases, handleServerError } from '@/shared/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/shared/lib/appwrite/config';

export async function migrateDonationsCollection() {
  console.log('Migrating donations collection...');

  try {
    // Check if receipt_file_id attribute already exists
    try {
      await serverDatabases.getAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'receipt_file_id');
      console.log('receipt_file_id attribute already exists, skipping migration');
      return;
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
    }

    // Add the new attribute
    console.log('Adding receipt_file_id attribute...');
    await serverDatabases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.DONATIONS,
      'receipt_file_id',
      100,
      false // not required
    );

    console.log('Migration completed successfully!');

  } catch (error: any) {
    console.error('Migration failed:', error.message);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  migrateDonationsCollection().catch(console.error);
}
