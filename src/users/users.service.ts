// src/users/users.service.ts
import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateUserDto } from './dto/users.dto';
import { User } from '../common/database/users/entities/user.entity';
import { UserFollow } from '../common/database/users/entities/user-follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserFollow)
    private readonly followRepo: Repository<UserFollow>,
  ) {}

  // ─── Profile ─────────────────────────────────────────────────────────────────

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`User "${username}" not found`);
    return user;
  }

  async getProfile(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['followerRelations', 'followingRelations'],
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    // Compute active counts from the loaded relations (match pattern using `relations`)
    const followersCount = (user.followerRelations || []).filter((r) => r.isActive).length;
    const followingCount = (user.followingRelations || []).filter((r) => r.isActive).length;

    (user as any).followersCount = followersCount;
    (user as any).followingCount = followingCount;

    return user;
  }

  async updateProfile(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  // ─── Follow ───────────────────────────────────────────────────────────────────

  async follow(currentUserId: number, targetUserId: number): Promise<UserFollow> {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // Ensure target exists
    await this.findById(targetUserId);

    // Check if a follow row already exists (even if deactivated)
    const existing = await this.followRepo.findOne({
      where: { followerId: currentUserId, followingId: targetUserId },
    });

    if (existing) {
      if (existing.isActive) throw new BadRequestException('Already following');
      // Re-activate a previously unfollowed relationship
      existing.isActive = true;
      existing.isFollowing = true;
      return this.followRepo.save(existing);
    }

    // Check if target already follows current user (mutual = isFollower: true)
    const reverseFollow = await this.followRepo.findOne({
      where: { followerId: targetUserId, followingId: currentUserId, isActive: true },
    });

    // Create new follow row
    const follow = this.followRepo.create({
      followerId: currentUserId,
      followingId: targetUserId,
      isFollowing: true,                      // currentUser → targetUser
      isFollower: !!reverseFollow,            // targetUser also follows me back?
      isActive: true,
    });

    const saved = await this.followRepo.save(follow);

    // If mutual: update the reverse row's isFollower flag too
    if (reverseFollow) {
      reverseFollow.isFollower = true;
      await this.followRepo.save(reverseFollow);
    }

    return saved;
  }

  // ─── Unfollow ─────────────────────────────────────────────────────────────────

  async unfollow(currentUserId: number, targetUserId: number): Promise<void> {
    const follow = await this.followRepo.findOne({
      where: { followerId: currentUserId, followingId: targetUserId, isActive: true },
    });

    if (!follow) throw new BadRequestException('You are not following this user');

    // Soft-deactivate instead of hard delete — preserves history
    follow.isActive = false;
    follow.isFollowing = false;
    await this.followRepo.save(follow);

    // Update the reverse row: I'm no longer their follower
    const reverseFollow = await this.followRepo.findOne({
      where: { followerId: targetUserId, followingId: currentUserId, isActive: true },
    });
    if (reverseFollow) {
      reverseFollow.isFollower = false;
      await this.followRepo.save(reverseFollow);
    }
  }

  // ─── List Followers / Following ───────────────────────────────────────────────

  async getFollowers(userId: number) {
    // People who follow userId (active only)
    const rows = await this.followRepo.find({
      where: { followingId: userId, isActive: true },
      relations: ['follower'],
      select: {
        id: true,
        isFollowing: true,
        isFollower: true,
        isActive: true,
        createdAt: true,
        follower: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    });

    return rows.map((r) => ({
      ...r.follower,
      isFollowing: r.isFollowing,  // does userId follow them back?
      isFollower: r.isFollower,
      followedAt: r.createdAt,
    }));
  }

  async getFollowing(userId: number) {
    // People userId is following (active only)
    const rows = await this.followRepo.find({
      where: { followerId: userId, isActive: true },
      relations: ['following'],
      select: {
        id: true,
        isFollowing: true,
        isFollower: true,
        isActive: true,
        createdAt: true,
        following: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    });

    return rows.map((r) => ({
      ...r.following,
      isFollowing: r.isFollowing,
      isFollower: r.isFollower,   // do they follow userId back?
      followedAt: r.createdAt,
    }));
  }

  // ─── Follow Status (check between two users) ──────────────────────────────────

  async getFollowStatus(currentUserId: number, targetUserId: number) {
    const row = await this.followRepo.findOne({
      where: { followerId: currentUserId, followingId: targetUserId },
    });

    return {
      isFollowing: row?.isActive && row?.isFollowing ? true : false,
      isFollower: row?.isFollower ?? false,
      isMutual: row?.isActive && row?.isFollowing && row?.isFollower ? true : false,
    };
  }
}