// src/reactions/reactions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from '../common/database/reactions/entities/reaction.entity';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction]),
    PostsModule, // import to use PostsService.updateLikeCount
  ],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}