// Simple tests - run with: node test.js

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Running tests...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ ${name}: ${err.message}`);
      failed++;
    }
  }

  // Test 1 - Server is running
  await test('Server is reachable', async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok && res.status !== 404) throw new Error(`Status ${res.status}`);
  });

  // Test 2 - insights.json loads
  await test('insights.json is accessible', async () => {
    const res = await fetch(`${BASE_URL}/app/insights.json`);
    if (!res.ok) throw new Error('Could not load insights.json');
    const data = await res.json();
    if (!data.overall) throw new Error('Missing summary field');
  });

  // Test 3 - Chat endpoint exists
  await test('Chat endpoint responds', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say the word HELLO only.' }
        ]
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.choices) throw new Error('No choices in response');
  });

  // Test 4 - Chat returns content
  await test('Chat returns actual content', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Say HELLO only.' }
        ]
      })
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content || content.trim() === '') throw new Error('Empty response');
  });

  // Test 5 - insights.json has expected fields
  await test('Bank data has required fields', async () => {
    const res = await fetch(`${BASE_URL}/app/insights.json`);
    const data = await res.json();
    const required = ['summary', 'per_account', 'money_in_by_category'];
    for (const field of required) {
      if (!data.overall[field]) throw new Error(`Missing field: ${field}`);
    }
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();