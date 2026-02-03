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

export interface salesChart {
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
  selector: 'app-sales',
  imports: [NgApexchartsModule, MaterialModule],
  templateUrl: './sales.component.html',
})
export class AppSalesComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public salesChart!: Partial<salesChart> | any;

  constructor() {
    this.salesChart = {
      series: [
        {
          name: 'PRODUCT A',
          data: [11, 17, 15, 15, 21, 14, 11,]
        }
      ],
      colors: ["var(--mat-sys-secondary)"],
      grid: {
        show: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
          borderRadius: [3],
          borderRadiusApplication: 'around',
          borderRadiusWhenStacked: 'around',
        }
      },
      dataLabels: {
        enabled: false
      },
      chart: {
        type: 'bar',
        height: 100,
        stacked: false,
        toolbar: {
          show: false
        },
        sparkline: {
          enabled: true
        }
      },
      xaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false
        }
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      legend: {
        show: false,
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false
        }
      },
    };
  }
}
