// Master seed script that runs all seeds in the correct order
import { execSync } from 'child_process';
import { join } from 'path';

const seedDir = __dirname;

console.log('🚀 Running all seed scripts...\n');

const seeds = [
  { file: 'seed.ts', description: 'Base data (users, categories, articles, web stories)' },
  { file: 'seed-market-config.ts', description: 'Market configuration (indices, crypto, commodities, pairs)' },
  { file: 'seed-currencies.ts', description: 'Currency rates' },
];

for (const seed of seeds) {
  console.log(`\n📦 Running: ${seed.description}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(`npx ts-node "${join(seedDir, seed.file)}"`, {
      stdio: 'inherit',
      cwd: join(seedDir, '..'),
    });
  } catch (error) {
    console.error(`❌ Failed to run ${seed.file}`);
    process.exit(1);
  }
}

console.log('\n' + '═'.repeat(50));
console.log('🎉 All seeds completed successfully!');
console.log('═'.repeat(50));
