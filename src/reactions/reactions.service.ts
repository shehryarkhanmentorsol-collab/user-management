// src/reactions/reactions.service.ts
import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction, ReactionType } from '../common/database/reactions/entities/reaction.entity';
import { ReactDto } from './dto/reactions.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    private readonly postsService: PostsService, // for updating denormalized likeCount
  ) {}

  async react(userId: number, postId: number, dto: ReactDto): Promise<Reaction> {
    // Verify post exists
    await this.postsService.findOne(postId);

    // Check for existing reaction (one per user per post)
    const existing = await this.reactionRepo.findOne({ where: { userId, postId } });
    if (existing) {
      // Update reaction type instead of throwing — allows changing emoji
      existing.type = dto.type;
      return this.reactionRepo.save(existing);
    }

    const reaction = this.reactionRepo.create({ userId, postId, type: dto.type });
    const saved = await this.reactionRepo.save(reaction);

    // Increment like count on post for fast sorting
    if (dto.type === ReactionType.LIKE) {
      await this.postsService.updateLikeCount(postId, 1);
    }

    return saved;
  }

  async removeReaction(userId: number, postId: number): Promise<void> {
    const reaction = await this.reactionRepo.findOne({ where: { userId, postId } });
    if (!reaction) throw new NotFoundException('Reaction not found');

    await this.reactionRepo.remove(reaction);

    if (reaction.type === ReactionType.LIKE) {
      await this.postsService.updateLikeCount(postId, -1);
    }
  }

  async getReactionCounts(postId: number): Promise<Record<string, number>> {
    // GROUP BY query to count each reaction type
    const counts = await this.reactionRepo
      .createQueryBuilder('reaction')
      .select('reaction.type', 'type')
      .addSelect('COUNT(reaction.id)', 'count')
      .where('reaction.postId = :postId', { postId })
      .groupBy('reaction.type')
      .getRawMany<{ type: string; count: string }>();

    // Build result object with all types defaulting to 0
    const result: Record<string, number> = {
      like: 0, love: 0, wow: 0, sad: 0, angry: 0, total: 0,
    };

    for (const row of counts) {
      result[row.type] = parseInt(row.count, 10);
      result.total += result[row.type];
    }

    return result;
  }

  async getUserReaction(userId: number, postId: number): Promise<Reaction | null> {
    return this.reactionRepo.findOne({ where: { userId, postId } });
  }
}