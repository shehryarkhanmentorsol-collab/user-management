// src/users/entities/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { UserFollow } from './user-follow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ select: false }) // never returned in queries by default
  password: string;

  @Column({ nullable: true, length: 100 })
  fullName: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  // // Self-referencing many-to-many for followers/following
  // @ManyToMany(() => User, (user) => user.following)
  // @JoinTable({
  //   name: 'user_followers',
  //   joinColumn: { name: 'followerId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'followingId', referencedColumnName: 'id' },
  // })
  // followers: User[];

  // @ManyToMany(() => User, (user) => user.followers)
  // following: User[];


  // Rows where THIS user is the follower (people I follow)
  @OneToMany(() => UserFollow, (uf) => uf.follower)
  followingRelations: UserFollow[];

  // Rows where THIS user is being followed (my followers)
  @OneToMany(() => UserFollow, (uf) => uf.following)
  followerRelations: UserFollow[];

  // ─── Hooks ───────────────────────────────────────────────────────────────────

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}