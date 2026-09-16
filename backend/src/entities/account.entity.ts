import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { User } from './user.entity.js';

@Entity({ tableName: 'account' })
@Index({ properties: ['providerId', 'accountId'] })
export class Account {
  @PrimaryKey() id!: string;
  @Property() accountId!: string;
  @Property() providerId!: string;
  @ManyToOne(() => User) user!: User;
  @Property({ nullable: true }) accessToken?: string;
  @Property({ nullable: true }) refreshToken?: string;
  @Property({ nullable: true }) idToken?: string;
  @Property({ nullable: true }) accessTokenExpiresAt?: Date;
  @Property({ nullable: true }) refreshTokenExpiresAt?: Date;
  @Property({ nullable: true }) scope?: string;
  @Property({ nullable: true }) password?: string; // hashed, for email/password
  @Property() createdAt: Date = new Date();
  @Property({ onUpdate: () => new Date() }) updatedAt: Date = new Date();
}