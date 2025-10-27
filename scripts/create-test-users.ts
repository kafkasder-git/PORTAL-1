/**
 * Create Test Users in Appwrite
 * Creates test accounts for development
 * 
 * Usage: npx tsx scripts/create-test-users.ts
 */

import { Client, Account, Users } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { ID } from 'appwrite';

dotenv.config({ path: '.env.local' });

const serverClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const users = new Users(serverClient);
const account = new Account(serverClient);

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: string;
}

const testUsers: TestUser[] = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'ADMIN',
  },
  {
    email: 'manager@test.com',
    password: 'manager123',
    name: 'Manager User',
    role: 'MANAGER',
  },
  {
    email: 'member@test.com',
    password: 'member123',
    name: 'Member User',
    role: 'MEMBER',
  },
  {
    email: 'viewer@test.com',
    password: 'viewer123',
    name: 'Viewer User',
    role: 'VIEWER',
  },
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  try {
    for (const testUser of testUsers) {
      try {
        // Try to create user
        const user = await users.create(
          ID.unique(),
          testUser.email,
          testUser.password,
          testUser.name,
          undefined // phone - not needed for test
        );

        // Add role label
        await users.updateLabels(user.$id, [testUser.role.toLowerCase()]);

        console.log(`✅ Created user: ${testUser.email} (${testUser.role})`);
      } catch (error: any) {
        // Check if user already exists
        if (error.code === 409 || error.message?.includes('already exists')) {
          console.log(`ℹ️  User ${testUser.email} already exists`);
        } else {
          console.error(`❌ Failed to create ${testUser.email}:`, error.message);
        }
      }
    }

    console.log('\n✨ Test users setup completed!');
    console.log('\nYou can now login with:');
    testUsers.forEach(user => {
      console.log(`  • ${user.email} / ${user.password} (${user.role})`);
    });
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

createTestUsers();
