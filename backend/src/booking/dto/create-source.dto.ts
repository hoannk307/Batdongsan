import { IsString, IsOptional } from 'class-validator';

export class CreateSourceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
