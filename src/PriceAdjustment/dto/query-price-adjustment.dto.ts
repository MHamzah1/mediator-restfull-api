import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { QueryGetAllDto } from '../../common/query-get-all.dto';
import { AdjustmentCategory } from '../../entities/price-adjustment.entity';

export class QueryPriceAdjustmentDto extends QueryGetAllDto {
  @ApiProperty({ example: 'uuid', required: false, description: 'Filter by Model ID (WAJIB)' })
  @IsOptional()
  @IsUUID('4')
  modelId?: string;

  @ApiProperty({ example: 'transmission', enum: AdjustmentCategory, required: false })
  @IsOptional()
  @IsEnum(AdjustmentCategory)
  category?: AdjustmentCategory;
}
