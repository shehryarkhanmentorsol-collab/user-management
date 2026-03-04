// src/users/users.controller.ts
import {
  Controller, Get, Patch, Post, Delete, Param,
  Body, UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/database/users/entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  // GET /api/v1/users/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    console.log('Fetching profile for user:', user.id);
    return this.usersService.getProfile(user.id);
  }

  // PATCH /api/v1/users/me
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // GET /api/v1/users/:id
  @Get(':id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProfile(id);
  }

  // GET /api/v1/users/username/:username
  @Get('username/:username')
  getByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  // ─── Follow / Unfollow 

  // POST /api/v1/users/:id/follow
  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  follow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) targetId: number,
  ) {
    return this.usersService.follow(user.id, targetId);
  }

  // DELETE /api/v1/users/:id/follow
  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  unfollow(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) targetId: number,
  ) {
    return this.usersService.unfollow(user.id, targetId);
  }

  // ─── Followers / Following Lists 

  // GET /api/v1/users/:id/followers
  @Get(':id/followers')
  getFollowers(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getFollowers(id);
  }

  // GET /api/v1/users/:id/following
  @Get(':id/following')
  getFollowing(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getFollowing(id);
  }

  // ─── Follow Status 

  // GET /api/v1/users/:id/follow-status  (must be authenticated)
  @Get(':id/follow-status')
  @UseGuards(JwtAuthGuard)
  getFollowStatus(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) targetId: number,
  ) {
    return this.usersService.getFollowStatus(user.id, targetId);
  }
}