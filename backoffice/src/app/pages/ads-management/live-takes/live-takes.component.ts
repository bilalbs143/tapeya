import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import type { AdCreative } from 'src/app/services/ad/ad-creative.service';
import { AdCreativeService } from 'src/app/services/ad/ad-creative.service';
import type { CreateLiveAdTakePayload, LiveAdTake, LiveAdTakeMode } from 'src/app/services/ad/live-ad-take.service';
import { LiveAdTakeService } from 'src/app/services/ad/live-ad-take.service';
import { LiveStreamService, type LiveStreamListItem } from 'src/app/services/live-stream.service';
import { MessageService } from 'src/app/services/message.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { PAGINATOR_CONFIG } from 'src/app/shared/config/paginator.config';
import { EMPTY_CELL } from 'src/app/shared/constants/display.constants';
import { onListPaginationChange } from 'src/app/shared/functions/list-page-paging.function';
import { buildListParams } from 'src/app/shared/functions/list-params.function';

const MODE_OPTIONS: { value: LiveAdTakeMode; label: string }[] = [
  { value: 'overlay', label: 'Overlay' },
  { value: 'break', label: 'Break / Mid-Roll' },
];

@Component({
  selector: 'app-live-ad-takes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatTableModule, TablerIconsModule, CommonSharedModule],
  templateUrl: './live-takes.component.html',
})
export class LiveAdTakesComponent implements OnInit, OnDestroy {
  private readonly takeService = inject(LiveAdTakeService);
  private readonly creativeService = inject(AdCreativeService);
  private readonly liveStreamService = inject(LiveStreamService);
  private readonly messageService = inject(MessageService);
  private readonly paginatorConfig = inject(PAGINATOR_CONFIG);
  private readonly fb = inject(FormBuilder);
  private readonly sub = new Subscription();

  public readonly modeOptions = MODE_OPTIONS;
  public readonly emptyCell = EMPTY_CELL;
  public readonly displayedColumns = ['sr', 'creative', 'mode', 'streams', 'started_at', 'note', 'actions'];

  public dataSource = new MatTableDataSource<LiveAdTake>([]);
  public approvedCreatives: AdCreative[] = [];
  public liveStreams: LiveStreamListItem[] = [];
  public makeLiveForm!: FormGroup;
  public isLoading = false;
  public isLoadingStreams = false;
  public isSubmitting = false;
  public endingId: number | null = null;
  public isEndingAll = false;
  public totalRecords = 0;
  public currentPage = 0;
  public pageSize: number;

  constructor() {
    this.pageSize = this.paginatorConfig.pageSize;
  }

  public ngOnInit(): void {
    this.makeLiveForm = this.fb.group({
      creative_id: [null as number | null, [Validators.required]],
      mode: ['overlay' as LiveAdTakeMode, [Validators.required]],
      stream_ids: [[] as number[], [Validators.required, Validators.minLength(1)]],
      replace: [true],
      note: [''],
    });
    this.reloadAll();
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public get selectedCreative(): AdCreative | undefined {
    const id = Number(this.makeLiveForm.get('creative_id')?.value);
    return this.approvedCreatives.find((c) => c.id === id);
  }

  public get canMakeLive(): boolean {
    return this.makeLiveForm.valid && this.selectedCreative?.status === 'approved' && !this.isSubmitting;
  }

  public modeLabel(mode: string | null | undefined): string {
    return MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode ?? this.emptyCell;
  }

  public streamLabel(stream: LiveStreamListItem): string {
    const title = stream.title?.trim() || `Stream #${stream.id}`;
    return `${title} (#${stream.id})`;
  }

  public takeStreamsLabel(row: LiveAdTake): string {
    if (row.streams?.length) {
      return row.streams.map((s) => s.title?.trim() || `#${s.id}`).join(', ');
    }
    if (row.stream_ids?.length) {
      return row.stream_ids.map((id) => `#${id}`).join(', ');
    }
    return this.emptyCell;
  }

  public onPaginationChange(event: PageEvent): void {
    onListPaginationChange(this, event);
  }

  public reloadAll(): void {
    this.loadHttpData();
    this.loadApprovedCreatives();
    this.loadLiveStreams();
  }

  public loadHttpData(pageOverride?: number, perPageOverride?: number): void {
    const page = pageOverride ?? this.currentPage;
    const perPage = perPageOverride ?? this.pageSize;
    const params = {
      ...buildListParams(page, perPage, null, {}),
      'filter[status]': 'live',
    } as Record<string, unknown>;

    this.isLoading = true;
    this.takeService.getList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? res.data?.length ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.error('Failed to load live ad takes.');
      },
    });
  }

  public loadApprovedCreatives(): void {
    this.creativeService.getList({ 'filter[status]': 'approved', per_page: 100, page: 1 }).subscribe({
      next: (res) => (this.approvedCreatives = res.data ?? []),
      error: () => {
        this.approvedCreatives = [];
        this.messageService.error('Failed to load approved creatives.');
      },
    });
  }

  public loadLiveStreams(): void {
    this.isLoadingStreams = true;
    this.liveStreamService.listStreams({ 'filter[status]': 'live', per_page: 100, page: 1 }).subscribe({
      next: (res) => {
        this.liveStreams = res.data ?? [];
        this.isLoadingStreams = false;
      },
      error: () => {
        this.liveStreams = [];
        this.isLoadingStreams = false;
        this.messageService.error('Failed to load live streams.');
      },
    });
  }

  public makeLive(): void {
    if (!this.canMakeLive) {
      this.makeLiveForm.markAllAsTouched();
      return;
    }
    const raw = this.makeLiveForm.getRawValue();
    const payload: CreateLiveAdTakePayload = {
      creative_id: Number(raw.creative_id),
      mode: raw.mode as LiveAdTakeMode,
      stream_ids: (raw.stream_ids ?? []).map((id: number) => Number(id)),
      replace: !!raw.replace,
      note: (raw.note ?? '').trim() || null,
    };

    this.isSubmitting = true;
    this.takeService
      .create(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.makeLiveForm.patchValue({ note: '' });
          this.currentPage = 0;
          this.loadHttpData();
        },
        error: () => this.messageService.error('Failed to make ad take live.'),
      });
  }

  public endTake(row: LiveAdTake): void {
    this.endingId = row.id;
    this.takeService.end(row.id).subscribe({
      next: () => {
        this.endingId = null;
        this.loadHttpData();
      },
      error: () => {
        this.endingId = null;
        this.messageService.error('Failed to end ad take.');
      },
    });
  }

  public endAll(): void {
    this.sub.add(
      this.messageService
        .prompt('End All Takes?', 'End every on-air ad take across all streams?', 'End All', 'Cancel')
        .afterClosed()
        .subscribe((confirmed) => {
          if (!confirmed) return;
          this.isEndingAll = true;
          this.takeService.endAll({}).subscribe({
            next: () => {
              this.isEndingAll = false;
              this.currentPage = 0;
              this.loadHttpData();
            },
            error: () => {
              this.isEndingAll = false;
              this.messageService.error('Failed to end all ad takes.');
            },
          });
        })
    );
  }
}
