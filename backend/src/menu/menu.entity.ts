import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
 OneToMany,
  Index,
} from 'typeorm';

@Entity({ name: 'menus' })
export class Menu {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Index({ unique: true })
  name: string;

  @Column({ type: 'varchar', length: 1024 })
  url: string;

  @Column({ type: 'int', nullable: true, name: 'parent_id' })
  @Index()
  parentId: number | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Self-relation for hierarchical queries
  @ManyToOne(() => Menu, (menu) => menu.children, { onDelete: 'CASCADE' })
 @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];
}
