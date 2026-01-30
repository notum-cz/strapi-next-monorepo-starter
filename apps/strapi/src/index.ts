import type { Core } from "@strapi/strapi"

import { registerPopulatePageMiddleware } from "./documentMiddlewares/page"
import { registerAdminUserSubscriber } from "./lifeCycles/adminUser"
import { registerUserSubscriber } from "./lifeCycles/user"

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log('[BOOTSTRAP] Starting bootstrap...');
    registerAdminUserSubscriber({ strapi })
    registerUserSubscriber({ strapi })

    registerPopulatePageMiddleware({ strapi })

    // Seed initial data if database is empty
    try {
      console.log('[BOOTSTRAP] Checking genre count...');
      const genreCount = await strapi.db.query('api::genre.genre').count();
      const gameCount = await strapi.db.query('api::game.game').count();
      console.log('[BOOTSTRAP] Genre count:', genreCount, '| Game count:', gameCount);
      if (genreCount === 0 || gameCount === 0) {
        console.log('\n🌱 Creating seed data...\n');

        const seedData = [
          {
            model: 'api::genre.genre',
            items: [
              { name: 'RPG', slug: 'rpg' },
              { name: 'Visual Novel', slug: 'visual-novel' },
              { name: 'Dating Sim', slug: 'dating-sim' },
              { name: 'Sandbox', slug: 'sandbox' },
              { name: 'Management', slug: 'management' },
            ],
            label: 'genres',
          },
          {
            model: 'api::tag.tag',
            items: [
              { name: 'Incest', slug: 'incest', is_explicit: true },
              { name: 'NTR', slug: 'ntr', is_explicit: true },
              { name: 'Corruption', slug: 'corruption', is_explicit: true },
              { name: 'MILF', slug: 'milf', is_explicit: true },
              { name: 'Male Protagonist', slug: 'male-protagonist', is_explicit: false },
            ],
            label: 'tags',
          },
          {
            model: 'api::engine.engine',
            items: [
              { name: "Ren'Py", slug: 'renpy' },
              { name: 'Unity', slug: 'unity' },
              { name: 'RPG Maker', slug: 'rpg-maker' },
              { name: 'Unreal Engine', slug: 'unreal-engine' },
            ],
            label: 'engines',
          },
          {
            model: 'api::platform.platform',
            items: [
              { name: 'Windows', slug: 'windows' },
              { name: 'Mac', slug: 'mac' },
              { name: 'Linux', slug: 'linux' },
              { name: 'Android', slug: 'android' },
            ],
            label: 'platforms',
          },
        ];

        // Seed taxonomies
        for (const { model, items, label } of seedData) {
          console.log(`  📦 Creating ${label}...`);
          for (const item of items) {
            await strapi.entityService.create(model as any, { data: item as any });
            console.log(`    ✓ ${item.name}`);
          }
        }

        // Seed developer
        console.log('  📦 Creating developer...');
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
        console.log(`    ✓ Notum Studio (ID: ${developer.id})`);

        // Seed game
        console.log('  📦 Creating sample game...');
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
        console.log('    ✓ Sample Game');

        console.log('\n✅ Seed data created successfully!\n');
      }
    } catch (err) {
      if (err?.message?.includes('unique violation')) {
        console.log('✓ Seed data already exists');
      } else {
        console.error('❌ Seed error:', err?.message);
      }
    }

    // Configure public permissions for API endpoints
    try {
      console.log('[BOOTSTRAP] Configuring public role permissions...');
      
      const actionsToGrant = [
        'api::game.game.find',
        'api::game.game.findOne',
        'api::genre.genre.find',
        'api::genre.genre.findOne',
        'api::platform.platform.find',
        'api::platform.platform.findOne',
      ];

      // Get or create public role
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (!publicRole) {
        console.log('  ⚠️  Public role not found, skipping permission configuration');
      } else {
        console.log(`  ✓ Found public role (ID: ${publicRole.id})`);

        // Get existing permissions
        const existingPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: publicRole.id },
        });
        const grantedActions = new Set(existingPermissions.map((p: any) => p.action));

        // Add missing permissions
        for (const action of actionsToGrant) {
          if (!grantedActions.has(action)) {
            await strapi.entityService.create('plugin::users-permissions.permission', {
              data: {
                action,
                role: publicRole.id,
              },
            });
            console.log(`    ✓ Granted permission: ${action}`);
          } else {
            console.log(`    ✓ Permission already granted: ${action}`);
          }
        }
      }
    } catch (err) {
      console.error('❌ Permission configuration error:', err?.message);
    }
  },
}
