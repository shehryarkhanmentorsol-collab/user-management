// src/reactions/reactions.controller.ts
import {
  Controller, Post, Delete, Get, Param, Body,
  UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReactionsService } from './reactions.service';
import { ReactDto } from './dto/reactions.dto';
import { User } from '../common/database/users/entities/user.entity';

@Controller('posts/:postId/reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  // POST /api/v1/posts/:postId/reactions  — add or update reaction
  @Post()
  @UseGuards(JwtAuthGuard)
  react(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: User,
    @Body() dto: ReactDto,
  ) {
    return this.reactionsService.react(user.id, postId, dto);
  }

  // DELETE /api/v1/posts/:postId/reactions  — remove reaction
  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: User,
  ) {
    return this.reactionsService.removeReaction(user.id, postId);
  }

  // GET /api/v1/posts/:postId/reactions/counts
  @Get('counts')
  getCounts(@Param('postId', ParseIntPipe) postId: number) {
    return this.reactionsService.getReactionCounts(postId);
  }

  // GET /api/v1/posts/:postId/reactions/me  — get current user's reaction
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyReaction(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: User,
  ) {
    return this.reactionsService.getUserReaction(user.id, postId);
  }
}