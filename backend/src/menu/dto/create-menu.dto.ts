import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Dashboard', description: 'Menu name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '/dashboard', description: 'Menu URL/route' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: null, description: 'Parent menu ID for nested structure' })
  @IsOptional()
  @IsNumber()
  parentId: number | null = null;

  @ApiProperty({ example: 1, description: 'Position in the menu list', default: 0 })
  @IsNumber()
  @Min(0)
  position: number = 0;
}

export class UpdateMenuDto {
  @ApiProperty({ example: 'Updated Dashboard', description: 'Menu name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '/dashboard', description: 'Menu URL/route' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: null, description: 'Parent menu ID for nested structure' })
  @IsOptional()
  @IsNumber()
  parentId: number | null = null;

  @ApiProperty({ example: 1, description: 'Position in the menu list' })
  @IsNumber()
  @Min(0)
  position: number;
}

export class MoveMenuDto {
  @ApiProperty({ example: 5, description: 'New parent menu ID' })
  @IsNumber()
  parentId: number | null;

  @ApiProperty({ example: 2, description: 'New position' })
  @IsNumber()
  @Min(0)
  position: number;
}

export class ReorderMenuDto {
  @ApiProperty({ example: [3, 1, 2], description: 'Ordered list of menu IDs' })
  @IsNumber({}, { each: true })
  menuIds: number[];
}

export class MenuResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Dashboard' })
  name: string;

  @ApiProperty({ example: '/dashboard' })
  url: string;

  @ApiProperty({ example: null })
  parentId: number | null;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [MenuResponseDto], required: false })
  children?: MenuResponseDto[];
}