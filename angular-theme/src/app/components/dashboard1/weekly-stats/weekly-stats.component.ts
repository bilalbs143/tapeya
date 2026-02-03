import { Component, ViewChild } from '@angular/core';
import {
  ApexChart,
  ChartComponent,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

export interface weeklyCart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  fill: ApexFill;
  stroke: ApexStroke;
}

interface stats {
  id: number;
  color: string;
  title: string;
  subtitle: string;
  percent: string;
}

@Component({
  selector: 'app-weekly-stats',
  imports: [NgApexchartsModule, MaterialModule, TablerIconsModule],
  templateUrl: './weekly-stats.component.html',
})
export class AppWeeklyStatsComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public weeklyCart!: Partial<weeklyCart> | any;

  constructor() {
    this.weeklyCart = {
      series: [
        {
          name: 'Weekly Stats',
          color: 'var(--mat-sys-primary)',
          data: [5, 15, 5, 10, 5],
        },
      ],

      chart: {
        type: 'area',
        fontFamily: "inherit",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
        height: 115,
        sparkline: {
          enabled: true,
        },
        group: 'sparklines',
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0.2,
          opacityTo: 0,
          stops: [20, 180],
        },
      },
      markers: {
        size: 0,
      },
      tooltip: {
        theme: 'dark',
      },
    };
  }

  stats: stats[] = [
    {
      id: 1,
      color: 'primary',
      title: 'Top Sales',
      subtitle: 'Johnathan Doe',
      percent: '68',
    },
    {
      id: 2,
      color: 'success',
      title: 'Best Seller',
      subtitle: 'MaterialPro Admin',
      percent: '45',
    },
    {
      id: 3,
      color: 'error',
      title: 'Most Commented',
      subtitle: 'Ample Admin',
      percent: '14',
    },
  ];
}
