import { Component, ViewChild } from '@angular/core';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

export interface useractivityChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string | any;
  labels: string | any;
}

@Component({
  selector: 'app-user-activity',
  imports: [MaterialModule, NgApexchartsModule, TablerIconsModule],
  templateUrl: './user-activity.component.html',
})
export class AppUserActivityComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public useractivityChart!: Partial<useractivityChart> | any;

  constructor() {
    this.useractivityChart = {
      series: [
        {
          name: 'Checkout',
          data: [48, 48, 69, 60, 90, 113, 49],
        },
        {
          name: 'Viewed',
          data: [35, 63, 77, 65, 51, 71, 61],
        },
      ],
      chart: {
        fontFamily: 'inherit',
        foreColor: '#adb0bb',
        type: 'bar',
        height: 335,
        stacked: true,
        offsetX: -5,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: false,
        borderColor: 'rgba(0,0,0,0.1)',
        strokeDashArray: 1,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      colors: ['var(--mat-sys-primary)', 'var(--mat-sys-secondary)'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '28%',
          borderRadius: [3],
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [['M'], ['T'], ['W'], ['T'], ['F'], ['S'], ['S']],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: true,
        },
      },
      yaxis: {
        min: 0,
        max: 200,
        stepSize: 50,
        labels: {
          show: true,
        },
      },
      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
      legend: {
        show: false,
      },
    };
  }
}