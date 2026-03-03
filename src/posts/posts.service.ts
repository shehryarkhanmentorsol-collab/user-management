// src/posts/posts.service.ts
import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../common/database/posts/entities/post.entity';
import { CreatePostDto, UpdatePostDto, SearchPostsDto } from './dto/posts.dto';
import { PaginatedResponse } from '../common/pagination/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async create(userId: number, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({ ...dto, userId });
    return this.postRepo.save(post);
  }

  async findAll(dto: SearchPostsDto): Promise<PaginatedResponse<Post>> {
    const { page, limit, keyword, username, sortBy } = dto;
    const skip = (page - 1) * limit;

    // QueryBuilder for dynamic search + join
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'post.id', 'post.content', 'post.mediaUrl',
        'post.likeCount', 'post.createdAt',
        'user.id', 'user.username', 'user.avatarUrl',
      ]);

    if (keyword) {
      qb.andWhere('post.content LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (username) {
      qb.andWhere('user.username LIKE :username', { username: `%${username}%` });
    }

    // Sorting
    switch (sortBy) {
      case 'oldest':
        qb.orderBy('post.createdAt', 'ASC');
        break;
      case 'mostLiked':
        qb.orderBy('post.likeCount', 'DESC');
        break;
      default: // newest
        qb.orderBy('post.createdAt', 'DESC');
    }

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount(); // returns [rows, total count]

    return new PaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async update(id: number, userId: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    if (post.userId !== userId) throw new ForbiddenException('Not your post');
    Object.assign(post, dto);
    return this.postRepo.save(post);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.findOne(id);
    if (post.userId !== userId) throw new ForbiddenException('Not your post');
    await this.postRepo.remove(post);
  }

  // Called internally by ReactionsService to update denormalized count
  async updateLikeCount(postId: number, delta: number): Promise<void> {
    await this.postRepo
      .createQueryBuilder()
      .update(Post)
      .set({ likeCount: () => `likeCount + ${delta}` })
      .where('id = :id', { id: postId })
      .execute();
  }
}