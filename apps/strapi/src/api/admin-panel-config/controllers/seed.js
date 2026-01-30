module.exports = {
  async seed(ctx) {
    try {
      const seedData = {
        genres: [
          { name: 'RPG', slug: 'rpg' },
          { name: 'Visual Novel', slug: 'visual-novel' },
          { name: 'Dating Sim', slug: 'dating-sim' },
          { name: 'Sandbox', slug: 'sandbox' },
          { name: 'Management', slug: 'management' },
        ],
        tags: [
          { name: 'Incest', slug: 'incest', is_explicit: true },
          { name: 'NTR', slug: 'ntr', is_explicit: true },
          { name: 'Corruption', slug: 'corruption', is_explicit: true },
          { name: 'MILF', slug: 'milf', is_explicit: true },
          { name: 'Male Protagonist', slug: 'male-protagonist', is_explicit: false },
        ],
        engines: [
          { name: "Ren'Py", slug: 'renpy' },
          { name: 'Unity', slug: 'unity' },
          { name: 'RPG Maker', slug: 'rpg-maker' },
          { name: 'Unreal Engine', slug: 'unreal-engine' },
        ],
        platforms: [
          { name: 'Windows', slug: 'windows' },
          { name: 'Mac', slug: 'mac' },
          { name: 'Linux', slug: 'linux' },
          { name: 'Android', slug: 'android' },
        ],
      };

      console.log('🌱 Starting database seed...');

      // Create genres
      console.log('📦 Creating genres...');
      for (const genre of seedData.genres) {
        const existing = await strapi.db.query('api::genre.genre').findOne({
          where: { slug: genre.slug },
        });
        if (!existing) {
          await strapi.entityService.create('api::genre.genre', { data: genre });
          console.log(`  ✓ ${genre.name}`);
        }
      }

      // Create tags
      console.log('📦 Creating tags...');
      for (const tag of seedData.tags) {
        const existing = await strapi.db.query('api::tag.tag').findOne({
          where: { slug: tag.slug },
        });
        if (!existing) {
          await strapi.entityService.create('api::tag.tag', { data: tag });
          console.log(`  ✓ ${tag.name}`);
        }
      }

      // Create engines
      console.log('📦 Creating engines...');
      for (const engine of seedData.engines) {
        const existing = await strapi.db.query('api::engine.engine').findOne({
          where: { slug: engine.slug },
        });
        if (!existing) {
          await strapi.entityService.create('api::engine.engine', { data: engine });
          console.log(`  ✓ ${engine.name}`);
        }
      }

      // Create platforms
      console.log('📦 Creating platforms...');
      for (const platform of seedData.platforms) {
        const existing = await strapi.db.query('api::platform.platform').findOne({
          where: { slug: platform.slug },
        });
        if (!existing) {
          await strapi.entityService.create('api::platform.platform', { data: platform });
          console.log(`  ✓ ${platform.name}`);
        }
      }

      // Create developer
      console.log('📦 Creating developer...');
      const developer = await strapi.entityService.create('api::developer.developer', {
        data: {
          name: 'Notum Studio',
          slug: 'notum-studio',
          patreon_link: 'https://patreon.com/notumstudio',
          website_link: 'https://notum.cz',
          twitter: 'https://twitter.com/notumcz',
          discord: 'https://discord.gg/notum',
          subscribestar: 'https://subscribestar.com/notum',
        },
      });
      console.log(`  ✓ Notum Studio (ID: ${developer.id})`);

      // Create sample game
      console.log('📦 Creating sample game...');
      if (developer) {
        await strapi.entityService.create('api::game.game', {
          data: {
            title: 'Sample Game',
            slug: 'sample-game',
            version: '1.0.0',
            status: 'Ongoing',
            release_date: new Date().toISOString().split('T')[0],
            is_featured: true,
            trending_score: 100,
            description: 'This is a sample game to demonstrate the architecture.',
            developer: developer.id,
          },
        });
        console.log('  ✓ Sample Game');
      }

      console.log('✅ Seed completed!');

      ctx.body = {
        ok: true,
        message: 'Seed data created successfully',
      };
    } catch (err) {
      console.error('❌ Seed error:', err.message);
      ctx.throw(500, err.message);
    }
  },
};
