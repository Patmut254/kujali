import { AddNoteToBudgetCommand } from './add-note.command';
import { FunctionHandler } from '@ngfire/functions'; 
import { getRepository } from '@ngfire/functions';

export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<void>;
}

export interface AddNoteToBudgetResult {
  success: boolean;
}
