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

export interface quarterlystatsCart {
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
  selector: 'app-quarterly-stats',
  imports: [NgApexchartsModule, MaterialModule, TablerIconsModule],
  templateUrl: './quarterly-stats.component.html',
})
export class AppQuarterlyStatsComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public quarterlystatsCart!: Partial<quarterlystatsCart> | any;

  constructor() {
    this.quarterlystatsCart = {
      series: [
        {
          name: "Sales",
          color: "var(--mat-sys-primary)",
          data: [5, 15, 5, 10, 5],
        },
      ],
      chart: {
        id: "weekly-stats2",
        type: "area",
        height: 155,
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
          opacityFrom: 0.1,
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
      },
    };
  }

  stats: stats[] = [
    {
      id: 1,
      color: 'primary',
      title: 'Top Sales',
      subtitle: 'Johnathan Doe',
      percent: '76',
    },
    {
      id: 2,
      color: 'success',
      title: 'Best Seller',
      subtitle: 'Footware',
      percent: '68',
    },
    {
      id: 3,
      color: 'secondary',
      title: 'Most Commented',
      subtitle: 'Fashionware',
      percent: '52',
    },
  ];
}
