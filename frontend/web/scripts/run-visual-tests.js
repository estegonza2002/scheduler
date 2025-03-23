
import { execSync } from 'child_process';

// Get the Chromatic project token from environment variables
const token = process.env.CHROMATIC_PROJECT_TOKEN;

if (!token) {
  console.error('❌ Error: CHROMATIC_PROJECT_TOKEN environment variable is not set');
  console.log('Please set the CHROMATIC_PROJECT_TOKEN environment variable and try again');
  console.log('You can get your project token from https://www.chromatic.com/');
  process.exit(1);
}

// Run Chromatic with the project token
try {
  console.log('🚀 Running visual regression tests with Chromatic...');
  execSync(`npx chromatic --project-token=${token}`, { stdio: 'inherit' });
  console.log('✅ Visual regression tests completed');
} catch (error) {
  console.error('❌ Visual regression tests failed:', error.message);
  process.exit(1);
}
