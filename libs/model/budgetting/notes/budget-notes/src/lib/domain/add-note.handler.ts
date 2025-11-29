import { HandlerTools } from '@iote/cqrs';
import { FunctionContext, FunctionHandler } from '@ngfi/functions';
import { AddNoteToBudgetCommand } from './add-note.command';

export interface ICommandHandler<TCommand> {
  execute(
    command: TCommand,
    context: FunctionContext,
    tools: HandlerTools
  ): Promise<AddNoteToBudgetResult>;
}

export interface AddNoteToBudgetResult {
  success: boolean;
  noteId?: string;
  message?: string;
}

export class AddNoteToBudgetHandler
  extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult>
  implements ICommandHandler<AddNoteToBudgetCommand>
{
  public async execute(
    command: AddNoteToBudgetCommand,
    context: FunctionContext,
    tools: HandlerTools
  ): Promise<AddNoteToBudgetResult> {
    
    if (!command.content || command.content.trim().length === 0) {
      throw new Error('Note content cannot be empty');
    }

    if (!command.budgetId) {
      throw new Error('Budget ID is required');
    }

    if (!command.orgId) {
      throw new Error('Organization ID is required');
    }

    const repo = tools.getRepository<{
      content: string;
      createdBy: string;
      createdAt: Date;
      budgetId: string;
      orgId: string;
    }>(`orgs/${command.orgId}/budgets/${command.budgetId}/notes`);

    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await repo.write(
      {
        content: command.content.trim(),
        createdBy: command.createdBy,
        createdAt: command.createdAt,
        budgetId: command.budgetId,
        orgId: command.orgId
      },
      noteId
    );

    return {
      success: true,
      noteId,
      message: 'Note added successfully'
    };
  }
}
