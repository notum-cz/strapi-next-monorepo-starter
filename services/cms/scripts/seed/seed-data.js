/**
 * Seed script for Trail Mixx CMS
 * Creates sample content for Promo, Merchant, Show, and Track
 */

const strapi = require('@strapi/strapi');

async function seedData() {
  const app = await strapi().load();
  
  console.log('🌱 Starting Trail Mixx seed data...');

  try {
    // Seed Promos
    console.log('Creating promos...');
    const promos = [
      {
        title: 'Community Food Bank Drive',
        kind: 'nonprofit',
        description: 'Help us support local families in need. Donate to the Community Food Bank.',
        publishedAt: new Date(),
        locale: 'en'
      },
      {
        title: 'BIPOC Artists Showcase',
        kind: 'bipoc',
        description: 'Celebrating Black, Indigenous, and People of Color artists from our community.',
        publishedAt: new Date(),
        locale: 'en'
      },
      {
        title: 'Summer Music Festival',
        kind: 'event',
        description: 'Join us for a free outdoor music festival featuring local artists!',
        publishedAt: new Date(),
        locale: 'en'
      }
    ];

    for (const promo of promos) {
      await strapi.documents('api::promo.promo').create({
        data: promo
      });
    }

    // Seed Merchants
    console.log('Creating merchants...');
    const merchants = [
      {
        name: 'Local Coffee Roasters',
        zip: '98101',
        category: 'Food & Beverage',
        couponText: 'Get 10% off your next order with code TRAILMIXX',
        featured: true,
        publishedAt: new Date(),
        locale: 'en'
      },
      {
        name: 'Community Bike Shop',
        zip: '98102',
        category: 'Sports & Recreation',
        couponText: 'Free tune-up with any purchase over $50',
        featured: false,
        publishedAt: new Date(),
        locale: 'en'
      }
    ];

    for (const merchant of merchants) {
      await strapi.documents('api::merchant.merchant').create({
        data: merchant
      });
    }

    // Seed Shows
    console.log('Creating shows...');
    const shows = [
      {
        title: 'Morning Mix',
        slug: 'morning-mix',
        clockRef: 'seattle-top-hour',
        locales: ['en', 'es'],
        description: 'Start your day with the best local and independent music',
        publishedAt: new Date(),
        locale: 'en'
      },
      {
        title: 'Evening Grooves',
        slug: 'evening-grooves',
        clockRef: 'seattle-top-hour',
        locales: ['en'],
        description: 'Smooth sounds for your evening commute',
        publishedAt: new Date(),
        locale: 'en'
      }
    ];

    for (const show of shows) {
      await strapi.documents('api::show.show').create({
        data: show
      });
    }

    // Seed Tracks
    console.log('Creating tracks...');
    const tracks = [
      {
        title: 'Sunrise Dreams',
        artist: 'The Local Band',
        isLocal: true,
        bin: 'A',
        localeHint: 'en',
        album: 'Morning Light',
        year: 2024,
        publishedAt: new Date(),
        locale: 'en'
      },
      {
        title: 'Ritmos del Barrio',
        artist: 'Los Músicos Unidos',
        isLocal: true,
        bin: 'B',
        localeHint: 'es',
        album: 'Comunidad',
        year: 2023,
        publishedAt: new Date(),
        locale: 'es'
      },
      {
        title: 'City Lights',
        artist: 'Urban Echo',
        isLocal: false,
        bin: 'C',
        localeHint: 'en',
        album: 'Metropolitan',
        year: 2024,
        publishedAt: new Date(),
        locale: 'en'
      }
    ];

    for (const track of tracks) {
      await strapi.documents('api::track.track').create({
        data: track
      });
    }

    console.log('✅ Seed data created successfully!');
    console.log(`   - ${promos.length} promos`);
    console.log(`   - ${merchants.length} merchants`);
    console.log(`   - ${shows.length} shows`);
    console.log(`   - ${tracks.length} tracks`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }

  await app.destroy();
}

seedData()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
