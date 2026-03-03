// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/database/users/entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserFollow } from '../common/database/users/entities/user-follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,  UserFollow])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // exported so PostsService, etc. can use it
})
export class UsersModule {}