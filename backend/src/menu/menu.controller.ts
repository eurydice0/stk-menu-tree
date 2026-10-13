import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import {
  CreateMenuDto,
  UpdateMenuDto,
  MoveMenuDto,
  ReorderMenuDto,
  MenuResponseDto,
} from './dto';

@ApiTags('menus')
@Controller('api/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, description: 'Menu created successfully', type: MenuResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createDto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.menuService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menus as a nested tree' })
  @ApiResponse({ status: 200, description: 'List of menus', type: [MenuResponseDto] })
  findAll(): Promise<MenuResponseDto[]> {
    return this.menuService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu found', type: MenuResponseDto })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MenuResponseDto> {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiParam({ name: 'id', type: Number, description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu updated', type: MenuResponseDto })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.menuService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu item and all its children' })
  @ApiParam({ name: 'id', type: Number, description: 'Menu ID' })
  @ApiResponse({ status: 204, description: 'Menu deleted' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.menuService.remove(id);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a menu item to a different position/parent' })
  @ApiParam({ name: 'id', type: Number, description: 'Menu ID' })
  @ApiBody({ type: MoveMenuDto })
  @ApiResponse({ status: 200, description: 'Menu moved', type: MenuResponseDto })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @ApiResponse({ status: 400, description: 'Invalid parent or circular reference' })
  move(@Param('id', ParseIntPipe) id: number, @Body() moveDto: MoveMenuDto): Promise<MenuResponseDto> {
    return this.menuService.move(id, moveDto);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder menu items' })
  @ApiParam({ name: 'id', type: Number, description: 'This endpoint ignores the id, use the body' })
  @ApiBody({ type: ReorderMenuDto })
  @ApiResponse({ status: 200, description: 'Menus reordered', type: [MenuResponseDto] })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  reorder(@Body() reorderDto: ReorderMenuDto): Promise<MenuResponseDto[]> {
    return this.menuService.reorder(reorderDto);
  }
}