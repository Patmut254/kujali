export class AddNoteToBudgetCommand {
  budgetId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  orgId: string;

  constructor(data: {
    budgetId: string;
    content: string;
    createdBy: string;
    orgId: string;
    createdAt?: Date;
  }) {
    this.budgetId = data.budgetId;
    this.content = data.content;
    this.createdBy = data.createdBy;
    this.orgId = data.orgId;
    this.createdAt = data.createdAt || new Date();
  }
}