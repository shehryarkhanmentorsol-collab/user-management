// src/posts/posts.controller.ts
import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, SearchPostsDto } from './dto/posts.dto';
import { User } from '../common/database/users/entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // POST /api/v1/posts
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  // GET /api/v1/posts?keyword=&username=&sortBy=newest&page=1&limit=10
  @Get()
  findAll(@Query() query: SearchPostsDto) {
    return this.postsService.findAll(query);
  }

  // GET /api/v1/posts/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // PATCH /api/v1/posts/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  // DELETE /api/v1/posts/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.postsService.remove(id, user.id);
  }
}