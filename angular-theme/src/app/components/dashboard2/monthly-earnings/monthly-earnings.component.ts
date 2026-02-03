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

export interface monthlytwoChart {
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
  selector: 'app-monthly-earnings-two',
  imports: [NgApexchartsModule, MaterialModule, TablerIconsModule],
  templateUrl: './monthly-earnings.component.html',
})
export class AppMonthlyEarningsTwoComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public monthlytwoChart!: Partial<monthlytwoChart> | any;

  constructor() {
    this.monthlytwoChart = {
      series: [
        {
          name: 'monthly earnings',
          color: "var(--mat-sys-primary)",
          data: [25, 66, 20, 40, 12, 58, 20],
        },
      ],
      chart: {
        id: "monthly-earning",
        type: "area",
        height: 115,
        sparkline: {
          enabled: true,
        },
        group: 'sparklines',
        fontFamily: "inherit",
        foreColor: "#adb0bb",

      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0.10,
          opacityTo: 0,
          stops: [20, 180],
        },
      },
      markers: {
        size: 0,
      },
      tooltip: {
        theme: "dark",
        fixed: {
          enabled: true,
          position: "right",
        },
        x: {
          show: false,
        },
        y: {
          formatter: function (value: number) {
            return `$${value.toLocaleString()}K`;
          }
        }
      },
    };
  }
}
