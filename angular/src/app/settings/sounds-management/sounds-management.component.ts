import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, NgModuleRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { PAGING } from '../../shared/constants/constants';
import { baseHttpParams } from '../../shared/functions/core.function';
import { DialogData, MessageService } from '../../shared/services/message.service';
import { SoundsManagementService } from '../../shared/services/sounds-management.service';

import { ManageSoundsDialogComponent } from './manage-sounds-dialog/manage-sounds-dialog.component';

@Component({
  selector: 'app-sounds-management',
  templateUrl: './sounds-management.component.html',
  standalone: false,
})
export class SoundsManagementComponent implements AfterViewInit, OnInit {
  private soundsManagementService = inject(SoundsManagementService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public categories: Array<any> = [];
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'title', 'createdAt', 'play', 'action'];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;
  private audioPlayers: { [key: string]: { audio: HTMLAudioElement; isPlaying: boolean } } = {};

  public ngOnInit(): void {
    this.initialiseSearchForm();
    this.loadHttpData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => {
      this.loadHttpData();
    });
  }

  private initialiseSearchForm(): void {
    this.searchForm = this.fb.group({
      title: [''],
    });
  }

  public onPaginationChange(event: PageEvent): void {
    const { pageIndex, pageSize } = event;

    if (this.currentPage !== pageIndex + 1 || this.pageSize !== pageSize) {
      this.currentPage = pageIndex + 1;
      this.pageSize = pageSize;
      this.loadHttpData();
    }
  }

  public toggleAudio(element: any): void {
    if (!this.audioPlayers[element.file]) {
      const audio = new Audio(element.file);
      this.audioPlayers[element.file] = {
        audio: audio,
        isPlaying: false,
      };

      audio.addEventListener('ended', () => {
        this.audioPlayers[element.file].isPlaying = false;
        element.isPlaying = false;
      });
    }

    const audioData = this.audioPlayers[element.file];

    if (audioData.isPlaying) {
      audioData.audio.pause();
    } else {
      Object.values(this.audioPlayers).forEach((player) => {
        if (player.isPlaying) {
          player.audio.pause();
          player.isPlaying = false;
        }
      });
      audioData.audio.play();
    }

    audioData.isPlaying = !audioData.isPlaying;
    element.isPlaying = audioData.isPlaying;
  }

  public openManageSoundsDialog(action: string, _row: any = {}): void {
    const data: DialogData = { record: _row, action };
    this.messageService.openDialog(ManageSoundsDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'sm',
    });
  }

  public openDeleteDialog(id: number): void {
    this.messageService.openPromptDialog(
      'DELETE_SOUND',
      'WOULD_YOU_LIKE_TO_DELETE_THE_SOUND',
      'DELETE',
      'CANCEL',
      (data) => this.soundsManagementService.delete(data),
      id,
      () => this.loadHttpData()
    );
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort)
      .set('direction', this.sort?.direction || '')
      .set('filter[title]', this.searchForm.value.title || '');

    this.isLoading = true;
    this.soundsManagementService
      .get(requestParams)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data || [];
          this.totalRecords = response.meta.total || 0;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public resetSearchForm(): void {
    this.searchForm.reset();
    this.loadHttpData();
  }
}
