import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InspectionType,
  InspectionResult,
  DocumentStatus,
} from '../../entities/vehicle-inspection.entity';

export class CreateInspectionDto {
  @ApiProperty() @IsNotEmpty() @IsString() warehouseVehicleId: string;
  @ApiProperty({ enum: InspectionType })
  @IsOptional()
  @IsEnum(InspectionType)
  inspectionType?: InspectionType;
  @ApiProperty({ enum: InspectionResult })
  @IsNotEmpty()
  @IsEnum(InspectionResult)
  overallResult: InspectionResult;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  exteriorScore?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  interiorScore?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  engineScore?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  electricalScore?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  chassisScore?: number;
  @ApiProperty({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  documentStatus?: DocumentStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasBpkb?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasStnk?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasFaktur?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasKtp?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasSpareKey?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  chassisNumberMatch?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() repairNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rejectionReason?: string;
}
