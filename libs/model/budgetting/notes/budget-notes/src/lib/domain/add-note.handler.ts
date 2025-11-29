import { AddNoteToBudgetCommand } from './add-note.command';
import { FunctionHandler } from '@ngfire/functions'; 
import { getRepository } from '@ngfire/functions';

export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<void>;
}

export interface AddNoteToBudgetResult {
  success: boolean;
}

export class AddNoteToBudgetHandler extends FunctionHandler<
  AddNoteToBudgetCommand,
  AddNoteToBudgetResult
> implements ICommandHandler<AddNoteToBudgetCommand> {

  async execute(command: AddNoteToBudgetCommand): Promise<void> {
    if (!command.content || !command.budgetId) {
      throw new Error('Budget ID and content are required.');
    }

    const repo = getRepository('budget-notes');

    await repo.addNote({
      budgetId: command.budgetId,
      content: command.content,
      createdBy: command.createdBy,
      createdAt: command.createdAt,
    });
  }
}
