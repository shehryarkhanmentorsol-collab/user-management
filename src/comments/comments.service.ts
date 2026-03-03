// src/comments/comments.service.ts
import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../common/database/comments/entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto, ListCommentsDto } from './dto/comments.dto';
import { PaginatedResponse } from '../common/pagination/pagination.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async create(userId: number, postId: number, dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepo.create({ ...dto, userId, postId });
    return this.commentRepo.save(comment);
  }

  async findByPost(postId: number, dto: ListCommentsDto): Promise<PaginatedResponse<Comment>> {
    const { page, limit, sortBy } = dto;
    const order = sortBy === 'oldest' ? 'ASC' : 'DESC';

    const [data, total] = await this.commentRepo.findAndCount({
      where: { postId },
      relations: ['user'],
      select: {
        id: true, content: true, createdAt: true,
        user: { id: true, username: true, avatarUrl: true },
      },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponse(data, total, page, limit);
  }

  async update(id: number, userId: number, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    if (comment.userId !== userId) throw new ForbiddenException('Not your comment');
    comment.content = dto.content;
    return this.commentRepo.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    if (comment.userId !== userId) throw new ForbiddenException('Not your comment');
    await this.commentRepo.remove(comment);
  }
}