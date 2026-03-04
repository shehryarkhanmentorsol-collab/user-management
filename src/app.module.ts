import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';

// migrations import not required here, but path added above

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM async config using env vars
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],
        // Using migrations: do not auto-sync schema in any environment
        synchronize: false,
        // Reduce logging noise in dev; set to ['warn','error'] or false to fully silence
        logging: ['warn', 'error'],
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    ReactionsModule,
  ],
})
export class AppModule {}