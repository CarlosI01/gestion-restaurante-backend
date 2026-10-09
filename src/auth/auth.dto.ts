import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsEmail() email: string;
  @IsNotEmpty() @IsString() password: string;
}

export class RegisterRequestDto {
  @IsNotEmpty() @IsString() fullName: string;
  @IsEmail() email: string;
  @IsNotEmpty() @IsString() username: string;
  @MinLength(6) password: string;
  @IsOptional() @IsString() roleCode?: string;
}

export interface LoginResponseDto { token: string; type: 'Bearer'; }
export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  username: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: Date;
}
