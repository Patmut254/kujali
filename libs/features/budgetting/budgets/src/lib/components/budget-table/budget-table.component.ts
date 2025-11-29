import { Component, EventEmitter, Input, Output, ViewChild, OnInit, AfterViewInit, inject, signal, effect } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';
import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
})
export class BudgetTableComponent implements OnInit, AfterViewInit {
  private _router$$ = inject(Router);
  private _dialog = inject(MatDialog);

  @Input() set budgets(value: {overview: BudgetRecord[], budgets: Budget[]}) {
    this.budgetsSignal.set(value);
  }

  @Input() canPromote = false;
  @Output() doPromote = new EventEmitter<void>();

  budgetsSignal = signal<{overview: BudgetRecord[], budgets: Budget[]}>({overview: [], budgets: []});

  dataSource = new MatTableDataSource<Budget>();
  displayedColumns: string[] = ['name', 'status', 'startYear', 'duration', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  overviewBudgets: BudgetRecord[] = [];

  constructor() {
    effect(() => {
      const budgets = this.budgetsSignal();
      this.overviewBudgets = budgets.overview;
      this.dataSource.data = budgets.budgets;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  access(requested: 'view' | 'edit' | 'clone'): boolean {
    return true;
  }

  filterAccountRecords(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  promote(): void {
    if (this.canPromote) this.doPromote.emit();
  }

  openShareBudgetDialog(parent: Budget | false): void {
    this._dialog.open(ShareBudgetModalComponent, {
      panelClass: 'no-pad-dialog',
      width: '600px',
      data: parent ?? false
    });
  }

  openCloneBudgetDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent ?? false
    });
  }

  openChildBudgetDialog(parent: Budget): void {
    let children = this.overviewBudgets.find(b => b.budget.id === parent.id)?.children;
    children = children?.map(child => child.budget);
    this._dialog.open(ChildBudgetsModalComponent, {
      height: 'fit-content',
      minWidth: '600px',
      data: { parent, budgets: children ?? [] }
    });
  }

  goToDetail(budgetId: string, action: string): void {
    this._router$$.navigate(['budgets', budgetId, action]).then(() => this._dialog.closeAll());
  }

  deleteBudget(budget: Budget): void {}

  translateStatus(status: number): string {
    switch (status) {
      case 1: return 'BUDGET.STATUS.ACTIVE';
      case 0: return 'BUDGET.STATUS.DESIGN';
      case 9: return 'BUDGET.STATUS.NO-USE';
      case -1: return 'BUDGET.STATUS.DELETED';
      default: return '';
    }
  }
}
