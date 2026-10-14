import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { Menu } from './menu.entity';
import { Repository } from 'typeorm';

describe('MenuService', () => {
  let service: MenuService;
  let repo: jest.Mocked<Repository<Menu>>;

  const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: getRepositoryToken(Menu), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    repo = module.get(getRepositoryToken(Menu));
  });

  describe('buildTree', () => {
    it('should build tree from flat list', async () => {
      const menus = [
        { id: 1, name: 'Root', parentId: null, position: 0 },
        { id: 2, name: 'Child', parentId: 1, position: 0 },
      ] as Menu[];
      repo.find.mockResolvedValue(menus);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Root');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].name).toBe('Child');
    });

    it('should handle multiple roots', async () => {
      const menus = [
        { id: 1, name: 'Root1', parentId: null, position: 0 },
        { id: 2, name: 'Root2', parentId: null, position: 1 },
      ] as Menu[];
      repo.find.mockResolvedValue(menus);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });

    it('should sort by position', async () => {
      const menus = [
        { id: 1, name: 'B', parentId: null, position: 1 },
        { id: 2, name: 'A', parentId: null, position: 0 },
      ] as Menu[];
      repo.find.mockResolvedValue(menus);

      const result = await service.findAll();

      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('B');
    });
  });

  describe('create', () => {
    it('should force parentId to null when not provided', async () => {
      const dto = { name: 'Test' };
      const created = { id: 1, ...dto, parentId: null, position: 0 };
      repo.create.mockReturnValue(created as Menu);
      repo.save.mockResolvedValue(created as Menu);
      repo.count.mockResolvedValue(0);

      await service.create(dto as any);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: null }),
      );
    });
  });

  describe('remove', () => {
    it('should delete menu and descendants', async () => {
      const menus = [
        { id: 1, name: 'Parent', parentId: null, position: 0 },
        { id: 2, name: 'Child', parentId: 1, position: 0 },
      ] as Menu[];
      repo.find.mockResolvedValue(menus);
      repo.findOne.mockResolvedValue(menus[0]);
      repo.delete.mockResolvedValue({ affected: 2 } as any);

      await service.remove(1);

      expect(repo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });
});
