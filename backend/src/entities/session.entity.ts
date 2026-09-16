import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/decorators/legacy';
import { User } from './user.entity.js';

@Entity({ tableName: 'session' })
export class Session {
  @PrimaryKey() id!: string;
  @Property() @Unique() token!: string;
  @Property() expiresAt!: Date;
  @Property({ nullable: true }) ipAddress?: string;
  @Property({ nullable: true }) userAgent?: string;
  @ManyToOne(() => User) user!: User;
  @Property() createdAt: Date = new Date();
  @Property({ onUpdate: () => new Date() }) updatedAt: Date = new Date();
}