import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { cloneDeep as ___cloneDeep, flatMap as __flatMap } from 'lodash';
import { Logger } from '@iote/bricks-angular';
import { Budget, BudgetRecord, BudgetStatus, OrgBudgetsOverview } from '@app/model/finance/planning/budgets';
import { BudgetsStore, OrgBudgetsStore } from '@app/state/finance/budgetting/budgets';
import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

interface TransformedBudget extends Budget {
  endYear: number;
}

interface AllBudgetsData {
  overview: BudgetRecord[];
  budgets: TransformedBudget[];
}

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss', '../../components/budget-view-styles.scss'],
})
export class SelectBudgetPageComponent implements OnInit {
  private _orgBudgets$$ = inject(OrgBudgetsStore);
  private _budgets$$ = inject(BudgetsStore);
  private _dialog = inject(MatDialog);
  private _logger = inject(Logger);

  overview = toSignal(this._orgBudgets$$.get(), { initialValue: {} as OrgBudgetsOverview });
  sharedBudgets = toSignal(this._budgets$$.get(), { initialValue: [] as Budget[] });

  allBudgets = computed<AllBudgetsData>(() => {
    const overview = __flatMap(this.overview()) as BudgetRecord[];
    const budgets = __flatMap(this.sharedBudgets()) as Budget[];

    const transformedBudgets = budgets.map((budget: Budget): TransformedBudget => ({
      ...budget,
      endYear: budget.startYear + budget.duration - 1,
    }));

    return { overview, budgets: transformedBudgets };
  });

  showFilter = signal(false);

  constructor() {
    effect(() => {
      const budgets = this.allBudgets();
      this._logger.log(() => `Budgets updated: ${budgets.budgets.length} total budgets`);
    });
  }

  ngOnInit(): void {}

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
  }

  fieldsFilter(value: (invoice: unknown) => boolean): void {}

  toogleFilter(value: boolean): void {
    this.showFilter.set(value);
  }

  openDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent !== false ? parent : false,
    });
  }

  canPromote(record: BudgetRecord): boolean {
    return (record.budget as Budget & { canBeActivated?: boolean }).canBeActivated ?? false;
  }

  setActive(record: BudgetRecord): void {
    const toSave = ___cloneDeep(record.budget);
    delete (toSave as Budget & { canBeActivated?: boolean }).canBeActivated;
    delete (toSave as Budget & { access?: unknown }).access;
    toSave.status = BudgetStatus.InUse;
    (record as BudgetRecord & { updating?: boolean }).updating = true;

    this._budgets$$.update(toSave).subscribe(() => {
      (record as BudgetRecord & { updating?: boolean }).updating = false;
      this._logger.log(() => `Updated Budget with id ${toSave.id}. Set as an active budget for this org.`);
    });
  }
}
