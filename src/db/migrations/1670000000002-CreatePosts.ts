import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePosts1670000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'mediaUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'likeCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'userId',
            type: 'int',
          },
        ],
      }),
    );

    // add foreign key to users
    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

 public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('posts');
    if (tableExists) {
        await queryRunner.dropTable('posts', true);
    }
}
}
