import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogClose, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription, take } from 'rxjs';
import { finalize } from 'rxjs/operators';

import type { EnumOption } from 'src/app/services/enums.service';
import { EnumsService } from 'src/app/services/enums.service';
import type { City } from 'src/app/services/location.service';
import { LocationService } from 'src/app/services/location.service';
import { MessageService } from 'src/app/services/message.service';
import { PlayersService, type PlayerCsvImportResult } from 'src/app/services/players.service';
import { DialogWrapperComponent } from 'src/app/shared/components/dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-import-players-csv-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatDialogClose,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDivider,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TablerIconsModule,
    DialogWrapperComponent,
  ],
  templateUrl: './import-players-csv-dialog.component.html',
})
export class ImportPlayersCsvDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<ImportPlayersCsvDialogComponent>);
  private readonly playersService = inject(PlayersService);
  private readonly enumsService = inject(EnumsService);
  private readonly locationService = inject(LocationService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  public readonly dryRunControl = new FormControl(false, { nonNullable: true });

  public playingRoles: EnumOption[] = [];
  public bowlingStyles: EnumOption[] = [];
  public battingStyles: EnumOption[] = [];
  public pakistanCities: City[] = [];
  public citiesLoadError = false;

  public readonly enumColumns: string[] = ['value', 'label'];

  public readonly sampleCsvHref = 'assets/samples/sample-players-import.csv';
  public readonly sampleCsvDownloadName = 'tapeya-sample-players-import.csv';

  public lastDryRun: PlayerCsvImportResult | null = null;
  public dryRunRequestError: string | null = null;
  public importInProgress = false;

  public ngOnInit(): void {
    this.sub.add(
      this.dryRunControl.valueChanges.subscribe((on) => {
        if (!on) {
          this.clearDryRunFeedback();
        }
      })
    );

    this.sub.add(
      this.enumsService.getEnums().subscribe({
        next: (m) => {
          this.playingRoles = m['playing_role'] ?? [];
          this.bowlingStyles = m['bowling_style'] ?? [];
          this.battingStyles = m['batting_style'] ?? [];
        },
        error: () => this.messageService.error('Could not load enum reference.'),
      })
    );

    this.sub.add(
      this.locationService.getCities('PK').subscribe({
        next: (res) => {
          this.pakistanCities = res.data ?? [];
          this.citiesLoadError = false;
        },
        error: () => {
          this.pakistanCities = [];
          this.citiesLoadError = true;
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const dryRun = this.dryRunControl.value;
    if (dryRun) {
      this.lastDryRun = null;
      this.dryRunRequestError = null;
    }

    this.importInProgress = true;
    this.playersService
      .importPlayersCsv(file, dryRun)
      .pipe(
        take(1),
        finalize(() => {
          this.importInProgress = false;
          input.value = '';
        })
      )
      .subscribe({
        next: (res) => {
          const d = res.data;
          if (dryRun) {
            this.lastDryRun = d ?? null;
            this.dryRunRequestError = null;
            return;
          }
          const msg = `Imported ${d?.rows_imported ?? 0} player(s), ${d?.rows_skipped ?? 0} skipped.`;
          if (d?.errors?.length) {
            this.messageService.error(
              `${msg} First issues: ${d.errors.slice(0, 3).join(' · ')}${d.errors.length > 3 ? ' …' : ''}`
            );
          } else {
            this.messageService.success(msg);
          }
          this.dialogRef.close(true);
        },
        error: (err: unknown) => {
          if (dryRun) {
            this.lastDryRun = null;
            this.dryRunRequestError = this.formatImportHttpError(err);
            return;
          }
          this.messageService.httpError(err, 'Import failed.');
        },
      });
  }

  public clearDryRunFeedback(): void {
    this.lastDryRun = null;
    this.dryRunRequestError = null;
  }

  private formatImportHttpError(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return 'Import failed.';
    }
    const raw = err.error;
    if (typeof raw === 'string' && raw.trim()) {
      return raw;
    }
    if (!raw || typeof raw !== 'object') {
      return err.message || 'Import failed.';
    }
    const data = raw as Record<string, unknown>;
    if (err.status === 422) {
      const bag = (data['errors'] ?? data) as Record<string, unknown>;
      const lines: string[] = [];
      if (bag && typeof bag === 'object') {
        for (const value of Object.values(bag)) {
          if (Array.isArray(value)) {
            value.forEach((m) => {
              if (typeof m === 'string') {
                lines.push(m);
              }
            });
          } else if (typeof value === 'string') {
            lines.push(value);
          }
        }
      }
      if (lines.length) {
        return lines.join('\n');
      }
    }
    const msg =
      (typeof data['message'] === 'string' && data['message']) || (typeof data['error'] === 'string' && data['error']) || null;
    return msg || 'Import failed.';
  }
}
