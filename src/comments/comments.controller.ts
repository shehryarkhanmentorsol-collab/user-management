// src/comments/comments.controller.ts
import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, ListCommentsDto } from './dto/comments.dto';
import { User } from '../common/database/users/entities/user.entity';

// Nested route: /posts/:postId/comments
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // POST /api/v1/posts/:postId/comments
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.id, postId, dto);
  }

  // GET /api/v1/posts/:postId/comments?sortBy=newest&page=1&limit=10
  @Get()
  findAll(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: ListCommentsDto,
  ) {
    return this.commentsService.findByPost(postId, query);
  }

  // PATCH /api/v1/posts/:postId/comments/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.id, dto);
  }

  // DELETE /api/v1/posts/:postId/comments/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.remove(id, user.id);
  }
}