// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, underscores' })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase, lowercase, and number',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}

// src/auth/dto/login.dto.ts
export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}