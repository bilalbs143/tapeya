import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

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

export interface expenseChart {
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
  selector: 'app-expense',
  imports: [MaterialModule, TablerIconsModule, NgApexchartsModule],
  templateUrl: './expense.component.html',
})
export class AppExpenseComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public expenseChart!: Partial<expenseChart> | any;

  constructor() {
    this.expenseChart = {
      series: [
        60, 25, 15
      ],
      labels: ["", "", ""],
      chart: {
        height: 96,
        type: "donut",
        fontFamily: "inherit",
        foreColor: "#c6d1e9",
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
      colors: ["var(--mat-sys-primary)", "var(--mat-sys-secondary)", "#13deb9"],
      dataLabels: {
        enabled: false,
      },

      legend: {
        show: false,
      },

      stroke: {
        show: false,
      },

      plotOptions: {
        pie: {
          donut: {
            size: "75%",
            background: "none",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "18px",
                color: undefined,
                offsetY: -10,
              },
              value: {
                show: false,
                color: "#98aab4",
              },
            },
          },
        },
      },
    };
  }
}
