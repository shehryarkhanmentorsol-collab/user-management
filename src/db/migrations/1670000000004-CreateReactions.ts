import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { ReactionType } from '../../../src/common/database/reactions/entities/reaction.entity';

export class CreateReactions1670000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'type',
            type: 'enum',
            enum: Object.values(ReactionType),
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'postId',
            type: 'int',
          },
        ],
      }),
    );

    // unique index userId + postId (MySQL requires index)
    await queryRunner.createIndex(
      'reactions',
      new TableIndex({
        name: 'IDX_reactions_user_post',
        columnNames: ['userId', 'postId'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'reactions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reactions',
      new TableForeignKey({
        columnNames: ['postId'],
        referencedTableName: 'posts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

 public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('reactions');
    if (tableExists) {
        await queryRunner.dropTable('reactions', true); 
    }
}
}
