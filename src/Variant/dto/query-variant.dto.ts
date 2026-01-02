import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryGetAllDto } from '../../common/query-get-all.dto';

export class QueryVariantDto extends QueryGetAllDto {
  @ApiProperty({ example: 'uuid', description: 'Filter by Model ID', required: false })
  @IsOptional()
  @IsUUID('4')
  modelId?: string;
}
