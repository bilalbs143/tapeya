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
  ApexFill,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

export interface customerChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  fill: ApexFill;
  responsive: ApexResponsive;
}
@Component({
  selector: 'app-customers',
  imports: [NgApexchartsModule, MaterialModule, TablerIconsModule],
  templateUrl: './customers.component.html',
})
export class AppCustomersComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public customerChart!: Partial<customerChart> | any;

  constructor() {
    this.customerChart = {
      series: [
        {
          name: '',
          color: 'var(--mat-sys-secondary)',
          data: [30, 25, 35, 20, 30, 40],
        },
      ],

      chart: {
        type: 'area',
        fontFamily: "inherit",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
        height: 80,
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
        opacityFrom: 0.12,
        opacityTo: 0,
        stops: [20, 180],
      },
    },
      markers: {
        size: 0,
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
      },
    };
  }
}
