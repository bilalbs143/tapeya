import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import { buildListParams } from 'src/app/shared/functions/list-params.function';

import { ManageTeamDialogComponent } from './manage-team-dialog/manage-team-dialog.component';

const DEFAULT_FILTERS = {
  country: '',
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
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    MatTooltipModule,
    CommonSharedModule,
  ],
  templateUrl: './teams.component.html',
})
export class TeamsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly teamsService = inject(TeamsService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  @ViewChild(MatSort) public sort!: MatSort;

  public searchForm: FormGroup;
  public readonly displayedColumns: string[] = [
    'sr',
    'logo',
    'name',
    'code',
    'country',
    'city',
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
      search: [''],
      country: [DEFAULT_FILTERS.country],
    });
  }

  public ngOnInit(): void {
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.sub.add(
      this.sort?.sortChange.subscribe(() => {
        this.currentPage = 0;
        this.loadHttpData();
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public resetSearchForm(): void {
    this.searchForm.reset({ search: '', country: DEFAULT_FILTERS.country });
    this.currentPage = 0;
    this.loadHttpData();
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;
    if (this.currentPage !== pageIndex || this.pageSize !== pageSize) {
      this.currentPage = pageIndex;
      this.pageSize = pageSize;
      this.loadHttpData();
    }
  }

  public loadHttpData(): void {
    const filters = this.searchForm.value as { search?: string; country?: string };
    const params = buildListParams(this.currentPage, this.pageSize, this.sort ?? null, {
      search: filters.search ?? '',
    });
    const requestParams: Record<string, unknown> = { ...params };
    if (filters.country?.trim()) {
      requestParams['filter[country]'] = filters.country.trim();
    }

    this.isLoading = true;
    this.teamsService.getList(requestParams).subscribe({
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
        widthSize: 'lg',
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
        widthSize: 'lg',
        disableClose: true,
      }
    );
  }

  public openDeleteDialog(team: TeamRow): void {
    this.sub.add(
      this.messageService
        .prompt('Delete Team?', `Are you sure you want to delete "${team.name}"?`, 'Delete', 'Cancel')
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
}
