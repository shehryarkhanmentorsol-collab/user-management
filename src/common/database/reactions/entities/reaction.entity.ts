// src/reactions/entities/reaction.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

@Entity('reactions')
@Unique(['userId', 'postId']) // One reaction per user per post (DB-level constraint)
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ReactionType })
  type: ReactionType;

  @CreateDateColumn()
  createdAt: Date;


  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;
}