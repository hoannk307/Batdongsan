import { IsString, IsOptional } from 'class-validator';

export class UpdateSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
