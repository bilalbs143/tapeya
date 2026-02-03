import { HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import moment from 'moment';

import { environment } from '../../../environments/environment';
import { AGENTS_STATS_COLUMN, BETS_HISTORY_STATS_COLUMNS, TRANSACTIONS_REQUESTS_STATS_COLUMNS, USER_STATS_COLUMN } from '../constants/constants';

export function apiUrl(path: string): string {
  return environment.API_URL + path;
}

export function titleToSnakeCase(title: string): string {
  if (title && title.length > 0) {
    return title.replace(/\s+/g, '_').toLowerCase();
  } else {
    return '';
  }
}

export function processValidationErrorMessages(errors: any): string {
  let processedMessages = '';

  for (const field in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, field)) {
      const fieldMessages = errors[field].map((message: string) => `- ${message}`).join('\n');
      processedMessages += `${snakeCaseToCapitalise(field)} validation error\n${fieldMessages}\n\n`;
    }
  }

  return processedMessages.trim();
}

export function response(message: string, code = 200): { error: { message: string }; status: number } {
  return { status: code, error: { message } };
}

export function snakeCaseToCapitalise(refCode: string): string {
  let formattedCode = refCode.replace(/_/g, ' ');
  formattedCode = formattedCode.charAt(0).toUpperCase() + formattedCode.slice(1);
  return formattedCode;
}

export function toScreamingSnakeCase(str: string): string {
  return (
    str
      // Insert underscores before capital letters and split on all non-alphanumeric characters
      .replace(/([A-Z])/g, '_$1')
      .split(/[^a-zA-Z0-9]/)
      // Remove empty strings from the array (occurs if there are leading/trailing non-alphanumeric characters)
      .filter(Boolean)
      // Convert all characters to uppercase and join with underscores
      .join('_')
      .toUpperCase()
  );
}

export function getUserIdByURL(): number {
  const url = window.location.href;
  return Number(url.split('/')[5]);
}

export function getUserTypeByURL(): string {
  const url = window.location.href;
  return url.split('/')[3].toLowerCase();
}

export function getLoggedInUserType(): string | null {
  const item = localStorage.getItem('user');
  return item ? JSON.parse(item).typeEnum : null;
}

// Check if value provided is blank
export function isBlank(value: any): boolean {
  return isNil(value) || (isObject(value) && Object.keys(value).length === 0) || value.toString().trim() === '';
}

// Check if value is null
export function isNil(value: any): value is null | undefined {
  return value === null || typeof value === 'undefined';
}

// Check if value is an object
export function isObject(value: any): boolean | any {
  return value && value.constructor === Object;
}

// Check if value is present
export function isPresent(value: any): boolean {
  return !isBlank(value);
}

// Merge multiple arrays based on a common key
export function mergeArrays(key: string, ...arrays: Array<any>): any[] {
  const finalMap = new Map();
  arrays.forEach((array) => array.forEach((item: { [x: string]: any }) => finalMap.set(item[key], item)));
  return Array.from(finalMap.values());
}

export function parseBooleanToIntString(value: boolean): '' | '1' | '0' {
  if (isPresent(value)) {
    return value ? '1' : '0';
  } else {
    return '';
  }
}

export function baseHttpParams(perPage: number, currentPage: number, sort: { active: string; direction: string }): HttpParams {
  return new HttpParams()
    .set('perPage', perPage)
    .set('page', currentPage.toString())
    .set('sort', (sort.direction === 'desc' ? '-' : '') + sort.active);
}

export function addUsernameFilter(base: HttpParams, form: FormGroup, prefix = ''): HttpParams {
  return base.set(`filter[${prefix}username]`, form.value.username || '').set(`filter[${prefix}name]`, form.value.name || '');
}

export function addCreatedFilter(base: HttpParams, form: FormGroup, prefix = ''): HttpParams {
  return base
    .set(`filter[${prefix}created_after]`, getDateFilter(form, 'created_after'))
    .set(`filter[${prefix}created_before]`, getDateFilter(form, 'created_before'));
}

export function getDateFilter(form: FormGroup, attr: string): string {
  return form.value[attr] ? moment(form.value[attr]).format('YYYY-MM-DD') : '';
}

export function calculateBetsStats(data: any[]): any {
  const sumStats = calculateColumnSums(data, BETS_HISTORY_STATS_COLUMNS.original);
  const highestWin = findHighestValueByKey(data, 'win');
  const highestBet = findHighestValueByKey(data, 'bet');
  const netBet = (sumStats.bet || 0) - (sumStats.refund_amount || 0);
  const betDiff = (sumStats.win || 0) - (sumStats.bet || 0);
  const netBetDiff = (sumStats.win || 0) - netBet;

  return {
    ...sumStats,
    highest_win: highestWin,
    highest_bet: highestBet,
    net_bet: netBet,
    bet_difference: betDiff,
    net_bet_difference: netBetDiff,
  };
}

export function calculateTransactionsRequestStats(data: any[]): any {
  const sumStats = calculateColumnSums(data, TRANSACTIONS_REQUESTS_STATS_COLUMNS.original);
  const highestApprovedAmount = findHighestValueByKey(data, 'approved_money');

  return {
    ...sumStats,
    highest_approved_amount: highestApprovedAmount,
  };
}

export function calculateColumnSums(data: any[], columns: string[]): any {
  return columns.reduce((acc: any, column) => {
    acc[column] = data.reduce((sum, curr) => sum + (curr[column] || 0), 0);
    return acc;
  }, {});
}

export function countDistinctByKey(data: any[], key: string): number {
  const uniqueValues = new Set(data.map((item) => item[key]));
  return uniqueValues.size;
}

export function findHighestValueByKey(data: any[], key: string): number | undefined {
  const values = data.map((item) => item[key]);
  return values.length > 0 ? Math.max(...values) : 0;
}

export function calculateUsersStats(data: any[]): any {
  const walletInfo = data.map((d) => ({
    ...d?.wallet,
  }));
  return calculateColumnSums(walletInfo, USER_STATS_COLUMN.original);
}

export function calculateAgentsStats(data: any[]): any {
  const extractedValues = data.map((d) => ({
    ...d,
    losing_money: d?.wallet?.losing_money,
    rolling_money: d?.wallet?.rolling_money,
    coupon_points: d?.wallet?.coupon_points,
  }));
  return calculateColumnSums(extractedValues, AGENTS_STATS_COLUMN.original);
}

export function calculateColumnSumsByCategory(data: any[], category?: string | string[]): any {
  const sumsByCategory: any = {};

  const filteredData = category
    ? Array.isArray(category)
      ? data.filter((item) => category.includes(item.category_enum))
      : data.filter((item) => item.category_enum === category)
    : data;

  filteredData.forEach((item) => {
    const currCategory = item.category_enum;

    if (!sumsByCategory[currCategory]) {
      sumsByCategory[currCategory] = 0;
    }

    const value = Math.abs(parseInt(item.amount.replace(/[^\d.-]/g, '')));
    sumsByCategory[currCategory] += value || 0;
  });

  return sumsByCategory;
}

export function calculateTransactionHistoryStatsByCategory(data: any[], categories: { key: string; value: string }[]): any {
  const extractedCategories = Array.from(new Set(categories?.map((d) => d?.key?.toUpperCase())));
  return calculateColumnSumsByCategory(data, extractedCategories);
}

export function cleanCommasFormData(data: any, keys: string[]): any {
  const cleanedData = { ...data };
  keys.forEach((key: string) => {
    if (cleanedData[key]) {
      cleanedData[key] = cleanedData[key].replace(/,/g, '');
    }
  });
  return cleanedData;
}

export function formatNumberWithCommas(value: string): string {
  // Allow "-" as a valid intermediate state
  if (value === '-') {
    return '-';
  }

  // Remove all commas first to get the raw number
  const valueWithoutCommas = value.replace(/,/g, '');

  // Check if it's a valid number
  if (!isNaN(Number(valueWithoutCommas)) && valueWithoutCommas !== '') {
    // Split into integer and decimal parts
    const parts = valueWithoutCommas.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1] : '';

    // Handle negative sign
    const isNegative = integerPart.startsWith('-');
    const digitsOnly = isNegative ? integerPart.substring(1) : integerPart;

    // Add commas to integer part (from right to left, every 3 digits)
    const formattedInteger = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Reconstruct the formatted number
    const formatted = (isNegative ? '-' : '') + formattedInteger + decimalPart;

    return formatted;
  }

  return value;
}

export function formatNumberCustom(value: number, decimalPlaces: number = 0): string {
  // Ensure the value is a number
  if (isNaN(value)) {
    return '';
  }

  // Create a string with the fixed decimal places
  const parts = value.toFixed(decimalPlaces).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1] : '';

  // Add commas to the integer part
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return formattedIntegerPart + decimalPart;
}

/**
 * Compares registration IP with login IP and returns appropriate CSS class
 * @param registrationIp - The IP address used during registration (created_at_ip)
 * @param loginIp - The IP address used during last login (last_login.ip_address)
 * @returns 'text-error' if IPs are different, 'text-success' if same, '' if either is missing
 */
export function getLoginIpColorClass(registrationIp: string | null | undefined, loginIp: string | null | undefined): string {
  if (!registrationIp || !loginIp) {
    return '';
  }

  // Normalize IPs by trimming whitespace
  const normalizedRegIp = registrationIp.trim();
  const normalizedLoginIp = loginIp.trim();

  if (normalizedRegIp === normalizedLoginIp) {
    return 'text-success';
  }

  return 'text-error';
}
