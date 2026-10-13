import { DataSource } from 'typeorm';
import { Menu } from './menu/menu.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stk_menu',
    entities: [Menu],
    synchronize: true,
  });

  await dataSource.initialize();

  const menuRepo = dataSource.getRepository(Menu);

  // Clear existing
  await menuRepo.clear();

  const menus = [
    { name: 'Dashboard', url: '/dashboard', parentId: null, position: 1 },
    { name: 'Users', url: '/users', parentId: null, position: 2 },
    { name: 'Settings', url: '/settings', parentId: null, position: 3 },
    { name: 'Profile', url: '/profile', parentId: null, position: 4 },
    { name: 'User List', url: '/users/list', parentId: 2, position: 1 },
    { name: 'User Roles', url: '/users/roles', parentId: 2, position: 2 },
    { name: 'General Settings', url: '/settings/general', parentId: 3, position: 1 },
    { name: 'Security Settings', url: '/settings/security', parentId: 3, position: 2 },
    { name: 'Account', url: '/settings/account', parentId: 3, position: 3 },
  ];

  for (const menu of menus) {
    const entity = menuRepo.create(menu);
    await menuRepo.save(entity);
  }

  console.log('Seed data created successfully!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});