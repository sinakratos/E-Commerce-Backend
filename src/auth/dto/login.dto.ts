import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
