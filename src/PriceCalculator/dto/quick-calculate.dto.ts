import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QuickCalculateDto {
  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @IsNotEmpty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ example: 2018 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 'matic' })
  @IsNotEmpty()
  @IsString()
  transmission: string;

  @ApiProperty({ example: 'personal' })
  @IsNotEmpty()
  @IsString()
  ownership: string;

  @ApiProperty({ example: 'hitam' })
  @IsNotEmpty()
  @IsString()
  color: string;
}
