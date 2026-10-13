import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto, UpdateMenuDto, MoveMenuDto, ReorderMenuDto, MenuResponseDto } from './dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) { }

  async create(createDto: CreateMenuDto): Promise<MenuResponseDto> {
    // Force parentId to null if falsy
    if (!createDto.parentId) {
      createDto.parentId = null;
    }

    // Validate parent exists if parentId is provided
    if (createDto.parentId !== null) {
      const parent = await this.menuRepository.findOne({
        where: { id: createDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent menu with ID ${createDto.parentId} not found`);
      }
    }

    const menu = this.menuRepository.create(createDto);
    await this.menuRepository.save(menu);
    return this.toResponseDto(menu);
  }

  async findAll(): Promise<MenuResponseDto[]> {
    const menus = await this.menuRepository.find({
      order: { position: 'ASC' },

    });
    return this.buildTree(menus);
  }

  async findOne(id: number): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findOne({
      where: { id },

    });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return this.toResponseDto(menu);
  }

  async update(id: number, updateDto: UpdateMenuDto): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // Force parentId to null if falsy
    if (!updateDto.parentId) {
      updateDto.parentId = null;
    }

    // Validate parent exists
    if (updateDto.parentId !== null) {
      const parent = await this.menuRepository.findOne({
        where: { id: updateDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent menu with ID ${updateDto.parentId} not found`);
      }
    }

    // Prevent moving to own subtree
    if (updateDto.parentId === id) {
      throw new BadRequestException('Menu cannot be its own parent');
    }

    await this.menuRepository.update(id, updateDto);
    const updated = await this.menuRepository.findOne({ where: { id } });
    return this.toResponseDto(updated!);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // Delete the menu and all children recursively
    const idsToDelete = await this.getAllChildIds(id);
    idsToDelete.push(id);
    await this.menuRepository.delete({ id: In(idsToDelete) });
  }

  private async getAllChildIds(parentId: number): Promise<number[]> {
    const children = await this.menuRepository.find({
      where: { parentId },
      select: { id: true },
    });
    const childIds = children.map((c) => c.id);

    for (const childId of childIds) {
      const nested = await this.getAllChildIds(childId);
      childIds.push(...nested);
    }

    return childIds;
  }

  async move(id: number, moveDto: MoveMenuDto): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    // Force parentId to null if falsy
    if (!moveDto.parentId) {
      moveDto.parentId = null;
    }

    // Validate parent exists
    if (moveDto.parentId !== null) {
      const parent = await this.menuRepository.findOne({
        where: { id: moveDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent menu with ID ${moveDto.parentId} not found`);
      }
    }

    // Prevent moving to own subtree
    if (moveDto.parentId === id) {
      throw new BadRequestException('Menu cannot be its own parent');
    }

    await this.menuRepository.update(id, moveDto);
    const updated = await this.menuRepository.findOne({ where: { id } });
    return this.toResponseDto(updated!);
  }

  async reorder(ids: ReorderMenuDto): Promise<MenuResponseDto[]> {
    const updates = ids.menuIds.map((id, index) => ({
      id,
      position: index,
    }));

    await Promise.all(
      updates.map((update) => this.menuRepository.update(update.id, { position: update.position })),
    );

    const menus = await this.menuRepository.find({
      where: { id: In(ids.menuIds) },
      relations: { children: { children: true } },
    });
    return this.buildTree(menus);
  }

  private toResponseDto(menu: Menu): MenuResponseDto {
    return {
      id: menu.id,
      name: menu.name,
      url: menu.url,
      parentId: menu.parentId,
      position: menu.position,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };
  }

  private buildTree(menus: Menu[]): MenuResponseDto[] {
      const menuMap = new Map<number, MenuResponseDto>();
      const roots: MenuResponseDto[] = [];

      // Build map of all menus
      for (const menu of menus) {
        menuMap.set(menu.id, this.toResponseDto(menu));
      }

      // Build parent-child relationships
      for (const menu of menus) {
        const dto = menuMap.get(menu.id)!;
        if (menu.parentId !== null) {
          const parent = menuMap.get(menu.parentId);
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(dto);
            parent.children.sort((a, b) => a.position - b.position);
          }
        } else {
          roots.push(dto);
        }
      }

      return roots.sort((a, b) => a.position - b.position);
    }
  }
