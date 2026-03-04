// src/auth/auth.service.ts
import {
  Injectable, ConflictException, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../common/database/users/entities/user.entity';
import { RegisterDto, LoginDto, LoginResponseDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check uniqueness
    const existing = await this.userRepo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (existing) {
      throw new ConflictException(
        existing.username === dto.username ? 'Username already taken' : 'Email already registered',
      );
    }

    const user = this.userRepo.create(dto);
    console.log('Registering user:', user);
    await this.userRepo.save(user); // BeforeInsert hook hashes password

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    // Use private method to load password for validation
    const user = await this.findForLogin(dto.username);

    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  /*
   * Find user by username or email (for login).
   */
  private async findForLogin(username: string): Promise<User | null> {
    // Try search by username first
    let user = await this.userRepo.findOne({ where: { username } });
    
    // If not found by username, try by email
    if (!user) {
      user = await this.userRepo.findOne({ where: { email: username } });
    }
    
    return user;
  }

  private buildAuthResponse(user: User): LoginResponseDto {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    const { password, ...userWithoutPassword } = user as any;

    return {
      accessToken: token,
      user: userWithoutPassword,
    };
  }
}