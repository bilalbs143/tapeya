import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';

import { toScreamingSnakeCase } from '../../shared/functions/core.function';
import { MembershipBonusesService } from '../../shared/services/membership-bonuses.service';
import { MessageService } from '../../shared/services/message.service';

export interface OriginalData {
  id: number;
  level: string;
  [key: string]: number | string;
}

export interface TransformedRow {
  BONUS_TYPE: string;
  [level: string]: string | number;
}

@Component({
  selector: 'app-membership-bonuses',
  templateUrl: './membership-bonuses.component.html',
  standalone: false,
})
export class MembershipBonusesComponent implements OnInit {
  private membershipBonusesService = inject(MembershipBonusesService);
  private readonly messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  public isSubmitting: boolean = false;
  public form: FormGroup;
  public dataSource = new MatTableDataSource<any>([]);
  public isLoading: boolean = true;

  public rawData: Array<any> = [];

  public displayedColumns: string[] = [
    'BONUS_TYPE',
    'LEVEL_1',
    'LEVEL_2',
    'LEVEL_3',
    'LEVEL_4',
    'LEVEL_5',
    'LEVEL_6',
    'LEVEL_7',
    'LEVEL_8',
    'LEVEL_9',
    'LEVEL_10',
  ];

  private readonly percentDepositKeys = ['NEW_SIGNUP_FIRST_DEPOSIT_BONUS', 'NEW_SIGNUP_FIRST_DEPOSIT_BONUS_OF_DAY', 'BONUS_PER_DEPOSIT'] as const;

  private readonly percentRechargeKeysFallback = [
    'NEW_SIGNUP_FIRST_RECHARGE_BONUS',
    'NEW_SIGNUP_FIRST_RECHARGE_BONUS_OF_DAY',
    'BONUS_PER_RECHARGE',
  ] as const;

  // Map backend property names (recharge) to frontend translation keys (deposit)
  private mapRechargeKeyToDepositKey(key: string): string {
    const keyMap: Record<string, string> = {
      NEW_SIGNUP_FIRST_RECHARGE_BONUS: 'NEW_SIGNUP_FIRST_DEPOSIT_BONUS',
      NEW_SIGNUP_FIRST_RECHARGE_BONUS_MAXIMUM_AMOUNT: 'NEW_SIGNUP_FIRST_DEPOSIT_BONUS_MAXIMUM_AMOUNT',
      NEW_SIGNUP_FIRST_RECHARGE_BONUS_OF_DAY: 'NEW_SIGNUP_FIRST_DEPOSIT_BONUS_OF_DAY',
      NEW_SIGNUP_FIRST_RECHARGE_BONUS_OF_DAY_MAXIMUM_AMOUNT: 'NEW_SIGNUP_FIRST_DEPOSIT_BONUS_OF_DAY_MAXIMUM_AMOUNT',
      BONUS_PER_RECHARGE: 'BONUS_PER_DEPOSIT',
      BONUS_PER_RECHARGE_MAXIMUM_AMOUNT: 'BONUS_PER_DEPOSIT_MAXIMUM_AMOUNT',
    };
    return keyMap[key] || key;
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.loadHttpData();
  }

  private initializeForm(): void {
    this.form = this.fb.group({});
  }

  private transformOriginalData(data: OriginalData[]): void {
    const properties = Object.keys(data[0]).filter((key) => key !== 'id' && key !== 'level' && key !== 'level_enum');

    const transformedData = properties.map((prop) => {
      const backendKey = toScreamingSnakeCase(prop);
      const displayKey = this.mapRechargeKeyToDepositKey(backendKey);
      const row: TransformedRow = {
        BONUS_TYPE: displayKey,
        _BACKEND_KEY: backendKey, // Store original backend key for form controls
      };
      data.forEach((d) => {
        // Show empty input if value is null/undefined; keep 0 as-is.
        row[toScreamingSnakeCase(d.level)] = (d as any)[prop] ?? '';
      });
      return row;
    });

    this.dataSource.data = transformedData;
    transformedData.forEach((levelData) => this.addRow(levelData));
  }

  public addRow(levelData: any): void {
    // Use DEPOSIT key for form controls (new standard)
    // Also check for RECHARGE key for backward compatibility
    const depositKey = levelData.BONUS_TYPE; // This is already mapped to DEPOSIT
    const rechargeKey = levelData._BACKEND_KEY; // Original backend key

    for (let index = 1; index <= 10; index++) {
      const depositControlKey = `${depositKey}_LEVEL_${index}`;
      const rechargeControlKey = rechargeKey ? `${rechargeKey}_LEVEL_${index}` : null;

      // Use existing value from either key, or use level data
      const existingValue =
        this.form.value[depositControlKey] ?? (rechargeControlKey ? this.form.value[rechargeControlKey] : null) ?? levelData[`LEVEL_${index}`];

      // Create form control with DEPOSIT key (new standard)
      this.form.addControl(depositControlKey, new FormControl(existingValue));
    }
  }

  private isPercentKey(key: string): boolean {
    // Allow both deposit and legacy recharge keys for backward compatibility (recharge = backend, deposit = frontend display)
    return [
      'NEW_SIGNUP_FIRST_DEPOSIT_BONUS',
      'NEW_SIGNUP_FIRST_DEPOSIT_BONUS_OF_DAY',
      'BONUS_PER_DEPOSIT',
      'NEW_SIGNUP_FIRST_RECHARGE_BONUS',
      'NEW_SIGNUP_FIRST_RECHARGE_BONUS_OF_DAY',
      'BONUS_PER_RECHARGE',
    ].includes(key);
  }

  private toNumberOrZero(value: unknown): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  private clampPercent(value: unknown): number {
    const num = this.toNumberOrZero(value);
    if (num < 0) return 0;
    if (num > 100) return 100;
    return num;
  }

  private getFormValue(level: string, depositKey: string, rechargeKey: string): unknown {
    return this.form.value[`${depositKey}_${level}`] ?? this.form.value[`${rechargeKey}_${level}`];
  }

  private buildLevelIdMap(): Record<string, number | undefined> {
    const map: Record<string, number | undefined> = {};
    for (const row of this.rawData) {
      map[row.level_enum] = row.id;
    }
    return map;
  }

  public loadHttpData(): void {
    this.isLoading = true;
    this.membershipBonusesService
      .get()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.rawData = response.data || [];
          this.transformOriginalData(this.rawData);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public onSubmit(): void {
    const data = [] as Array<any>;
    for (let index = 1; index <= 10; index++) {
      const level = `LEVEL_${index}`;
      const getValue = (depositKey: string, rechargeKey: string): any => this.getFormValue(level, depositKey, rechargeKey);
      const clampPercent = (v: unknown): number => this.clampPercent(v);
      const toNumberOrZero = (v: unknown): number => this.toNumberOrZero(v);
      const levelId = this.rawData.find((r) => r.level_enum === level)?.id;
      data.push({
        id: levelId,
        new_signup_first_recharge_bonus: clampPercent(getValue('NEW_SIGNUP_FIRST_DEPOSIT_BONUS', 'NEW_SIGNUP_FIRST_RECHARGE_BONUS')),
        new_signup_first_recharge_bonus_maximum_amount: toNumberOrZero(
          getValue('NEW_SIGNUP_FIRST_DEPOSIT_BONUS_MAXIMUM_AMOUNT', 'NEW_SIGNUP_FIRST_RECHARGE_BONUS_MAXIMUM_AMOUNT')
        ),
        first_recharge_bonus_of_day: clampPercent(
          getValue('NEW_SIGNUP_FIRST_DEPOSIT_BONUS_OF_DAY', 'NEW_SIGNUP_FIRST_RECHARGE_BONUS_OF_DAY')
        ),
        first_recharge_bonus_of_day_maximum_amount: toNumberOrZero(
          getValue('NEW_SIGNUP_FIRST_DEPOSIT_BONUS_OF_DAY_MAXIMUM_AMOUNT', 'NEW_SIGNUP_FIRST_RECHARGE_BONUS_OF_DAY_MAXIMUM_AMOUNT')
        ),
        bonus_per_recharge: clampPercent(getValue('BONUS_PER_DEPOSIT', 'BONUS_PER_RECHARGE')),
        bonus_per_recharge_maximum_amount: toNumberOrZero(getValue('BONUS_PER_DEPOSIT_MAXIMUM_AMOUNT', 'BONUS_PER_RECHARGE_MAXIMUM_AMOUNT')),
      });
    }

    this.isSubmitting = true;
    this.membershipBonusesService
      .update({ data })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.snackBar(response.message);
          this.loadHttpData();
        },
        error: (error) => {
          this.messageService.snackBar(error.error.message);
        },
      });
  }
}
