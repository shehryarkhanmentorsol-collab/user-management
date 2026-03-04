// src/posts/posts.service.ts
import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
    // Build where clause for findAndCount
    const where: any = {};
    if (keyword) where.content = Like(`%${keyword}%`);
    if (username) where.user = { username: Like(`%${username}%`) };

    // Build order
    const order: any = {};
    switch (sortBy) {
      case 'oldest':
        order.createdAt = 'ASC';
        break;
      case 'mostLiked':
        order.likeCount = 'DESC';
        break;
      default:
        order.createdAt = 'DESC';
    }

    const [data, total] = await this.postRepo.findAndCount({
      where,
      relations: ['user'],
      order,
      skip,
      take: limit,
    });

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
    // Use repository increment helper to atomically update the counter
    await this.postRepo.increment({ id: postId }, 'likeCount', delta);
  }
}