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

export interface weeklysaleChart {
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
  selector: 'app-weekly-sales',
  imports: [NgApexchartsModule, MaterialModule, TablerIconsModule],
  templateUrl: './weekly-sales.component.html',
})
export class AppWeeklySalesComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public weeklysaleChart!: Partial<weeklysaleChart> | any;

  constructor() {
    this.weeklysaleChart = {
      series: [
        {
          name: "Employee Salary",
          data: [20, 15, 30, 25, 10, 15, 20],
        },
      ],
      chart: {
        toolbar: {
          show: false,
        },
        height: 290,
        type: "bar",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      colors: [
        "var(--mat-sys-primary-fixed-dim)",
        "var(--mat-sys-primary-fixed-dim)",
        "var(--mat-sys-primary)",
        "var(--mat-sys-primary-fixed-dim)",
        "var(--mat-sys-primary-fixed-dim)",
        "var(--mat-sys-primary-fixed-dim)",
        "var(--mat-sys-primary-fixed-dim)",
      ],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "55%",
          distributed: true,
          endingShape: "rounded-sm",

        },
      },

      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        yaxis: {
          lines: {
            show: false,
          },
        },
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      xaxis: {
        categories: [["Mon"], ["Tue"], ["Wed"], ["Thu"], ["Fri"], ["Sat"], ["Sun"]],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
        y: {
          formatter: function (value: number) {
            return `$${value.toLocaleString()}K`;
          }
        }
      },
    };
  }
}
