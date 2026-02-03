import { Component, ViewChild } from '@angular/core';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexGrid,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

export interface employeeChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
}

@Component({
  selector: 'app-employee-salary',
  imports: [NgApexchartsModule, MaterialModule, TablerIconsModule],
  templateUrl: './employee-salary.component.html',
})
export class AppEmployeeSalaryComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public employeeChart!: Partial<employeeChart> | any;

  constructor() {
    this.employeeChart = {
      series: [
        {
          name: "Employee Salary",
          data: [20, 15, 30, 25, 10, 15],
        },
      ],

      chart: {
        toolbar: {
          show: false,
        },
        height: 280,
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
      ],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "45%",
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
        categories: [["Apr"], ["May"], ["June"], ["July"], ["Aug"], ["Sept"]],
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
      },
    };
  }
}
