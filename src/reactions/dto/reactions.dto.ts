import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReactionType } from '../../common/database/reactions/entities/reaction.entity';

export class ReactDto {
  @IsEnum(ReactionType)
  @IsNotEmpty()
  type: ReactionType;
}
