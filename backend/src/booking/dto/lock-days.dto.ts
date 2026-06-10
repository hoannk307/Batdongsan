import { IsNumber, IsArray, IsDateString } from 'class-validator';

export class LockDaysDto {
  @IsNumber()
  room_id: number;

  @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];
}
