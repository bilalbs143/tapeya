import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, startWith, switchMap } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';
import { Country, LocationService } from 'src/app/services/location.service';
import { MediaService } from 'src/app/services/media.service';
import { MessageService } from 'src/app/services/message.service';
import { type TeamRow, type TeamSavePayload, type TeamUserCandidate, TeamsService } from 'src/app/services/teams.service';
import { UsersService } from 'src/app/services/users.service';
import { CommonSharedModule } from 'src/app/shared/common.module';
import { FileUploadComponent, type FileUploadValue } from 'src/app/shared/components/file-upload/file-upload.component';

export interface ManageTeamDialogData {
  mode: 'create' | 'edit';
  team?: TeamRow;
}

@Component({
  selector: 'app-manage-team-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, CommonSharedModule, FileUploadComponent],
  templateUrl: './manage-team-dialog.component.html',
})
export class ManageTeamDialogComponent implements OnInit, OnDestroy {
  public readonly data = inject<ManageTeamDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ManageTeamDialogComponent, boolean>);
  private readonly fb = inject(FormBuilder);
  private readonly teamsService = inject(TeamsService);
  private readonly mediaService = inject(MediaService);
  private readonly usersService = inject(UsersService);
  private readonly locationService = inject(LocationService);
  private readonly messageService = inject(MessageService);
  private readonly sub = new Subscription();

  private readonly originalHasLogo = !!this.data.team?.logo;

  public form!: FormGroup;
  public readonly sponsorSearch = this.fb.nonNullable.control('');
  public readonly iconSearch = this.fb.nonNullable.control('');

  public countriesList: Country[] = [];
  public cities: { id: number; name: string }[] = [];
  public sponsor: TeamUserCandidate | null = null;
  public sponsorCandidates: TeamUserCandidate[] = [];
  public iconCandidates: TeamUserCandidate[] = [];
  public iconPlayers: TeamUserCandidate[] = [];

  /** Same chip-input behaviour as tournament overview (Broadcaster / Organizer). */
  public readonly roleChipSeparatorKeys = [ENTER, COMMA] as const;
  public readonly roleChipInputAddOnBlur = false;
  public isSubmitting = false;

  public get title(): string {
    return this.data.mode === 'create' ? 'Create Team' : `Edit Team — ${this.data.team?.name ?? ''}`;
  }

  public get submitButtonText(): string {
    return this.data.mode === 'create' ? 'Create' : 'Save';
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.sub.add(
      this.form.get('country')!.valueChanges.subscribe((countryName) => {
        this.form.patchValue({ city: '' }, { emitEvent: false });
        this.fillCitiesForCountry(countryName);
      })
    );

    this.locationService.getCountries().subscribe({
      next: (res) => {
        this.countriesList = res.data ?? [];
        if (this.data.mode === 'edit' && this.data.team) {
          this.applyTeamToForm(this.data.team);
          this.teamsService.getById(this.data.team.id).subscribe({
            next: (r) => {
              if (r.data) {
                this.applyTeamToForm(r.data);
              }
            },
            error: () => undefined,
          });
        }
      },
      error: () => {
        this.countriesList = [];
      },
    });

    this.sub.add(
      this.sponsorSearch.valueChanges
        .pipe(
          startWith(this.sponsorSearch.value),
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((term) =>
            this.usersService.adminUserSearch(term ?? '').pipe(catchError(() => of({ data: [] as TeamUserCandidate[] })))
          )
        )
        .subscribe((res) => {
          this.sponsorCandidates = res.data ?? [];
        })
    );

    this.sub.add(
      this.iconSearch.valueChanges
        .pipe(
          startWith(this.iconSearch.value),
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((term) =>
            this.usersService.adminUserSearch(term ?? '').pipe(catchError(() => of({ data: [] as TeamUserCandidate[] })))
          )
        )
        .subscribe((res) => {
          this.iconCandidates = res.data ?? [];
        })
    );
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      country: ['', [Validators.required, Validators.maxLength(100)]],
      // City starts disabled; enabled reactively once a country is selected and cities are loaded.
      city: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(100)]],
      sponsor_user_id: [0, [Validators.required, Validators.min(1)]],
      logo: [null as FileUploadValue | null],
    });
  }

  private fillCitiesForCountry(countryName: string | null): void {
    const cityControl = this.form.get('city');

    if (!countryName) {
      this.cities = [];
      cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    const country = this.countriesList.find((c) => c.name === countryName);
    const code = country?.country_code;
    if (!code) {
      this.cities = [];
      cityControl?.setValue('');
      cityControl?.disable();
      return;
    }

    this.locationService.getCities(code).subscribe({
      next: (res) => {
        this.cities = res.data ?? [];
        cityControl?.enable();
      },
      error: () => {
        // Keep city enabled so required validator fires and prevents accidental submission.
        this.cities = [];
        cityControl?.enable();
      },
    });
  }

  private applyTeamToForm(t: TeamRow): void {
    this.form.patchValue(
      {
        name: t.name,
        code: t.code,
        country: t.country ?? '',
        city: t.city ?? '',
        sponsor_user_id: t.sponsor_id,
      },
      { emitEvent: false }
    );
    this.sponsor = t.sponsor ?? null;
    this.sponsorSearch.setValue('', { emitEvent: false });
    const icons = t.icon_players?.length ? t.icon_players : [];
    this.iconPlayers = [...icons];
    if (t.logo) {
      this.form.patchValue({ logo: { files: [], existingUrls: [t.logo] } as FileUploadValue }, { emitEvent: false });
    }
    this.fillCitiesForCountry(t.country || null);
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /** Chip text (matches tournament overview Broadcaster / Organizer). */
  public userChipLabel(u: TeamUserCandidate): string {
    const nick = u.nickname?.trim();
    if (nick) {
      return nick;
    }
    return u.name?.trim() || `#${u.id}`;
  }

  /** Autocomplete line (matches tournament overview). */
  public userOptionLabel(c: TeamUserCandidate): string {
    const tail = c.email || c.phone || c.nickname || `#${c.id}`;
    return `${c.name} — ${tail}`;
  }

  public onSponsorChipInputTokenEnd(event: MatChipInputEvent): void {
    event.chipInput?.clear();
  }

  public onIconChipInputTokenEnd(event: MatChipInputEvent): void {
    event.chipInput?.clear();
  }

  public onSponsorSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as TeamUserCandidate;
    if (!user?.id) {
      return;
    }
    this.sponsor = user;
    this.form.patchValue({ sponsor_user_id: user.id });
    this.sponsorSearch.setValue('', { emitEvent: false });
    this.sponsorCandidates = [];
  }

  public onIconSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as TeamUserCandidate;
    if (!user?.id || this.iconPlayers.some((p) => p.id === user.id)) {
      return;
    }
    this.iconPlayers = [...this.iconPlayers, user];
    this.iconSearch.setValue('', { emitEvent: false });
    this.iconCandidates = [];
  }

  public removeSponsor(): void {
    this.sponsor = null;
    this.form.patchValue({ sponsor_user_id: 0 });
    this.sponsorSearch.setValue('', { emitEvent: false });
    this.sponsorCandidates = [];
  }

  public removeIconPlayer(user: TeamUserCandidate): void {
    this.iconPlayers = this.iconPlayers.filter((p) => p.id !== user.id);
  }

  private buildPayload(): TeamSavePayload {
    const v = this.form.getRawValue();
    return {
      name: String(v.name).trim(),
      code: String(v.code).trim(),
      country: String(v.country).trim(),
      city: String(v.city).trim(),
      sponsor_user_id: Number(v.sponsor_user_id),
      icon_player_ids: this.iconPlayers.map((p) => p.id),
    };
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid || !this.form.value.sponsor_user_id) {
      this.messageService.error('Fill all required fields and choose a sponsor (app user).');
      return;
    }
    const payload = this.buildPayload();
    const logoVal = this.form.getRawValue().logo as FileUploadValue | null;

    this.isSubmitting = true;
    const request$ =
      this.data.mode === 'create' ? this.teamsService.create(payload) : this.teamsService.update(this.data.team!.id, payload);

    request$
      .pipe(
        switchMap((res) => this.mediaService.applyField('team', res.data.id, 'logo', logoVal, this.originalHasLogo)),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => {
          this.messageService.success(this.data.mode === 'create' ? 'Team created.' : 'Team updated.');
          this.dialogRef.close(true);
        },
        error: () => this.messageService.error('Could not save team.'),
      });
  }
}
