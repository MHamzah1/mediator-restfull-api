import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlaceVehicleDto {
  @ApiProperty({ description: 'Zone ID untuk penempatan' })
  @IsNotEmpty()
  @IsString()
  zoneId: string;
}
