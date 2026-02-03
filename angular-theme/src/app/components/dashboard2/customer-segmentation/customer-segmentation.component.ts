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

export interface customersegmentationChart {
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
  selector: 'app-customer-segmentation',
  imports: [MaterialModule, NgApexchartsModule, TablerIconsModule],
  templateUrl: './customer-segmentation.component.html',
})
export class AppCustomerSegmentationComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public customersegmentationChart!: Partial<customersegmentationChart> | any;

  constructor() {
    this.customersegmentationChart = {
      color: '#adb5bd',
      series: [60, 20, 20],
      labels: ['2.758', '350', '458'],
      chart: {
        height: 265,
        type: 'donut',
        fontFamily: 'inherit',
        foreColor: '#adb0bb',
      },
      stroke: {
        show: true,
        colors: `var(--mat-sys-outline-variant)'
          }`,
        width: 0,
      },
      dataLabels: {
        enabled: false,
      },

      legend: {
        show: false,
      },
      colors: [
        'var(--mat-sys-primary)',
        'var(--mat-sys-primary-fixed-dim)',
        'var(--mat-sys-secondary)',
      ],

      plotOptions: {
        pie: {
          donut: {
            size: '80%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: function (w: { globals: { seriesTotals: any[] } }) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                },
              },
            },
          },
        },
      },

      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
    };
  }
}
