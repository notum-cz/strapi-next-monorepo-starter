/**
 * Seed script for minimal Strapi data
 * Usage: node scripts/seed.js
 */

const apiUrl = 'http://localhost:1337';

async function seedData() {
  try {
    console.log('🌱 Starting Strapi seed...');

    // Create auth token (for development, we'll skip auth or use a simple approach)
    // In production, you'd need proper authentication

    // Genres
    const genres = [
      { name: 'RPG', slug: 'rpg' },
      { name: 'Visual Novel', slug: 'visual-novel' },
      { name: 'Dating Sim', slug: 'dating-sim' },
      { name: 'Sandbox', slug: 'sandbox' },
      { name: 'Management', slug: 'management' },
    ];

    // Tags
    const tags = [
      { name: 'Incest', slug: 'incest', is_explicit: true },
      { name: 'NTR', slug: 'ntr', is_explicit: true },
      { name: 'Corruption', slug: 'corruption', is_explicit: true },
      { name: 'MILF', slug: 'milf', is_explicit: true },
      { name: 'Male Protagonist', slug: 'male-protagonist', is_explicit: false },
    ];

    // Engines
    const engines = [
      { name: 'Ren\'Py', slug: 'renpy' },
      { name: 'Unity', slug: 'unity' },
      { name: 'RPG Maker', slug: 'rpg-maker' },
      { name: 'Unreal Engine', slug: 'unreal-engine' },
    ];

    // Platforms
    const platforms = [
      { name: 'Windows', slug: 'windows' },
      { name: 'Mac', slug: 'mac' },
      { name: 'Linux', slug: 'linux' },
      { name: 'Android', slug: 'android' },
    ];

    // Seed function
    async function seedCollection(collectionName, data) {
      console.log(`📦 Seeding ${collectionName}...`);
      for (const item of data) {
        try {
          const res = await fetch(`${apiUrl}/api/${collectionName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: item }),
          });
          if (res.ok) {
            console.log(`  ✓ ${item.name || item.label}`);
          } else {
            const text = await res.text();
            console.log(`  ✗ ${item.name || item.label}: ${res.status} - ${text.substring(0, 100)}`);
          }
        } catch (e) {
          console.log(`  ✗ ${item.name || item.label}: ${e.message}`);
        }
      }
    }

    await seedCollection('genres', genres);
    await seedCollection('tags', tags);
    await seedCollection('engines', engines);
    await seedCollection('platforms', platforms);

    // Seed a sample developer
    console.log('📦 Seeding developer...');
    const developerRes = await fetch(`${apiUrl}/api/developers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          name: 'Notum Studio',
          slug: 'notum-studio',
          patreon_link: 'https://patreon.com/notumstudio',
          website_link: 'https://notum.cz',
          twitter: 'https://twitter.com/notumcz',
          discord: 'https://discord.gg/notum',
          subscribestar: 'https://subscribestar.com/notum',
        },
      }),
    });
    if (developerRes.ok) {
      const dev = await developerRes.json();
      console.log(`  ✓ Notum Studio (ID: ${dev.data.id})`);

      // Seed a sample game
      console.log('📦 Seeding sample game...');
      const gameRes = await fetch(`${apiUrl}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            title: 'Sample Game',
            slug: 'sample-game',
            version: '1.0.0',
            status: 'Ongoing',
            release_date: new Date().toISOString().split('T')[0],
            is_featured: true,
            trending_score: 100,
            description: 'This is a sample game to demonstrate the architecture.',
            developer: dev.data.id,
            genres: [],
            tags: [],
            platforms: [],
            engine: null,
          },
        }),
      });
      if (gameRes.ok) {
        console.log('  ✓ Sample Game');
      } else {
        const err = await gameRes.json();
        console.log(`  ✗ Sample Game: ${err.error?.message || gameRes.statusText}`);
      }
    } else {
      const err = await developerRes.json();
      console.log(`  ✗ Notum Studio: ${err.error?.message || developerRes.statusText}`);
    }

    console.log('✅ Seed completed!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seedData();
