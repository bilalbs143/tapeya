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

export interface growthChart {
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
  selector: 'app-growth',
  imports: [NgApexchartsModule, MaterialModule],
  templateUrl: './growth.component.html',
})
export class AppGrowthComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public growthChart!: Partial<growthChart> | any;

  constructor() {
    this.growthChart = {
      series: [
        {
          name: "Sales",
          colors: ["var(--mat-sys-primary)"],
          data: [0, 10, 10, 10, 35, 45, 30, 30, 30, 50, 52, 30, 25, 45, 50, 80, 60, 65]
        },
      ],
      chart: {
        id: "growth",
        type: "area",
        height: 100,
        sparkline: {
          enabled: true,
        },
        group: "growth",
        fontFamily: "inherit",
        foreColor: "#adb0bb",
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        colors: ["var(--mat-sys-secondary)"],
        opacity: 0,
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [20, 280],
        },
      },

      markers: {
        size: 0,
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
