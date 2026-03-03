import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('user_followers')
export class UserFollow{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    followerId: number;

    @ManyToOne(()=> User, (user)=> user.followingRelations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followerId' })
    follower: User;

    @Column()
    followingId: number;

    @ManyToOne(()=> User, (user)=> user.followerRelations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followingId' })
    following: User;

    @Column({default: false})
    isFollowing: boolean;

    @Column({default: false})
    isFollower: boolean;

    @Column({default: true})
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}