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
import { SoundSettingsService } from '../../shared/services/sound-settings.service';

import { ManageSoundSettingsDialogComponent } from './manage-sound-settings-dialog/manage-sound-settings-dialog.component';

@Component({
  selector: 'app-manage-sound-settings-dialog',
  templateUrl: './sound-settings.component.html',
  standalone: false,
})
export class SoundSettingsComponent implements AfterViewInit, OnInit {
  private soundSettingsService = inject(SoundSettingsService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private readonly moduleRef = inject<NgModuleRef<any>>(NgModuleRef);

  @ViewChild(MatSort, { static: true }) private sort!: MatSort;
  public types: Array<any> = [];
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public currentPage: number = 1;
  public pageSize: number = PAGING.perPage;
  public displayedColumns: string[] = ['#', 'type', 'createdAt', 'play', 'action'];
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;
  private audioPlayers: { [key: string]: { audio: HTMLAudioElement; isPlaying: boolean } } = {};

  public ngOnInit(): void {
    this.getAllTypes();
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
      type: [''],
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

  public openManageSoundSettingsDialog(action: string, _row: any = {}): void {
    const data: DialogData = { record: _row, action };
    this.messageService.openDialog(ManageSoundSettingsDialogComponent, data, () => this.loadHttpData(), {
      widthSize: 'sm',
    });
  }

  public loadHttpData(currentPageView = this.currentPage, perPageLimit = this.pageSize): void {
    const requestParams: HttpParams = baseHttpParams(perPageLimit, currentPageView, this.sort).set('filter[type]', this.searchForm.value.title || '');

    this.isLoading = true;
    this.soundSettingsService
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

  public toggleAudio(element: any): void {
    if (!this.audioPlayers[element.sound_file]) {
      const audio = new Audio(element.sound_file);
      this.audioPlayers[element.sound_file] = {
        audio: audio,
        isPlaying: false,
      };

      audio.addEventListener('ended', () => {
        this.audioPlayers[element.sound_file].isPlaying = false;
        element.isPlaying = false;
      });
    }

    const audioData = this.audioPlayers[element.sound_file];

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

  public resetSearchForm(): void {
    this.searchForm.reset();
    this.loadHttpData();
  }

  private getAllTypes(): void {
    this.soundSettingsService.types().subscribe({
      next: (response) => {
        this.types =
          Object.entries(response.data).map(([key, value]) => ({
            key,
            value,
          })) || [];
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
}
