import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import { TeamsService, type TeamRow } from 'src/app/services/teams.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { cityCountryLine } from 'src/app/shared/functions/display.helper';
import {
  bindListSearchFormLiveReload,
  SortReloadBinder,
  onListPaginationChange,
  resetListSearchForm,
} from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageTeamDialogComponent } from './manage-team-dialog/manage-team-dialog.component';

const DEFAULT_FILTERS = {
  search: '',
} as const;

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    TablerIconsModule,
    MatTooltipModule,
    CommonSharedModule,
  ],
  templateUrl: './teams.component.html',
})
export class TeamsComponent implements OnInit, OnDestroy {
  private readonly teamsService = inject(TeamsService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  private readonly sortBinder = new SortReloadBinder(this);

  @ViewChild(MatSort)
  public set sort(value: MatSort | undefined) {
    this.sortBinder.bind(value);
  }

  public get sort(): MatSort | undefined {
    return this.sortBinder.current;
  }

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'logo',
    'name',
    'code',
    'location',
    'sponsor',
    'icons',
    'created_at',
    'actions',
  ];
  public dataSource = new MatTableDataSource<TeamRow>([]);
  public readonly emptyCell = EMPTY_CELL;

  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;
  public isLoading = false;
  constructor() {
    this.pageSize = this.paginatorConfig.pageSize;
    this.searchForm = this.fb.group({
      search: [DEFAULT_FILTERS.search],
    });
  }

  public ngOnInit(): void {
    this.sub.add(bindListSearchFormLiveReload(this));
    this.loadHttpData();
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sortBinder.destroy();
  }

  public resetSearchForm(): void {
    resetListSearchForm(this, DEFAULT_FILTERS);
  }

  public onPaginationChange(event: PageEvent): void {
    onListPaginationChange(this, event);
  }

  public loadHttpData(): void {
    const filters = this.searchForm.value as { search?: string };
    const params = buildListParams(this.currentPage, this.pageSize, this.sort ?? null, {
      search: filters.search ?? '',
    });

    this.isLoading = true;
    this.teamsService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = (res.data ?? []).map((row) => ({
          ...row,
          icon_player_ids: row.icon_player_ids ?? [],
        }));
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load teams.');
      },
    });
  }

  public openCreateDialog(): void {
    this.messageService.openDialog<ManageTeamDialogComponent, boolean>(
      ManageTeamDialogComponent,
      { mode: 'create' },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openEditDialog(team: TeamRow): void {
    this.messageService.openDialog<ManageTeamDialogComponent, boolean>(
      ManageTeamDialogComponent,
      { mode: 'edit', team },
      (result) => result && this.loadHttpData(),
      {
        widthSize: 'md',
        disableClose: true,
      }
    );
  }

  public openDeleteDialog(team: TeamRow): void {
    this.sub.add(
      this.messageService
        .prompt(
          'Delete Team?',
          `Delete "${team.name}"? Teams that appear in any match can't be deleted — remove or reassign those matches first.`,
          'Delete',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.teamsService.delete(team.id).subscribe({
              next: () => {
                this.messageService.success('Team deleted.');
                this.loadHttpData();
              },
              error: () => this.messageService.error('Could not delete team. It may still be referenced by matches.'),
            });
          }
        })
    );
  }

  public rowNumber(index: number): number {
    return this.currentPage * this.pageSize + index + 1;
  }

  public cityCountryLine(team: TeamRow): string {
    return cityCountryLine(team.city, team.country);
  }
}
