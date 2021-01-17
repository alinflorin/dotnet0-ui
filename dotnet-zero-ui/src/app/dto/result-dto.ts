import { ConsoleMessageDto } from './console-message-dto';

export interface ResultDto {
  success: boolean;
  consoleMessages?: ConsoleMessageDto[];
}
