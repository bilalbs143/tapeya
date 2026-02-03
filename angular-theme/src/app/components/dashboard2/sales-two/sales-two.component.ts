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

export interface salestwoChart {
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
  selector: 'app-sales-two',
  imports: [NgApexchartsModule, MaterialModule],
  templateUrl: './sales-two.component.html',
})
export class AppSalesTwoComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public salestwoChart!: Partial<salestwoChart> | any;

  constructor() {
    this.salestwoChart = {
      series: [
        {
          name: "",
          data: [100, 60, 35, 90, 35, 100]
        },
      ],
      chart: {
        type: 'bar',
        height: 100,
        fontFamily: "inherit",
        toolbar: {
          show: false
        },
        sparkline: {
          enabled: true
        },
        width: "100%",

      },
      colors: ["var(--mat-sys-primary)"],
      grid: {
        show: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 4,
          distributed: true,
        }
      },
      dataLabels: {
        enabled: false
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
      axisBorder: {
        show: false
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
