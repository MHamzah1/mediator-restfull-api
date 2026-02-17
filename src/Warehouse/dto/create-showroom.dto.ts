import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShowroomDto {
  @ApiProperty({ example: 'Showroom Mobil Jaya' }) @IsNotEmpty() @IsString() name: string;
  @ApiProperty({ example: 'SRM-JKT01' }) @IsNotEmpty() @IsString() code: string;
  @ApiProperty({ example: 'Jl. Raya No. 1' }) @IsNotEmpty() @IsString() address: string;
  @ApiProperty({ example: 'Jakarta Selatan' }) @IsNotEmpty() @IsString() city: string;
  @ApiProperty({ example: 'DKI Jakarta' }) @IsNotEmpty() @IsString() province: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() whatsapp?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logo?: string;
}
