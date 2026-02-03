import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CommonModule } from '@angular/common';

export interface performanceData {
  id: number;
  imagePath: string;
  pname: string;
  category: string;
  date: string;
  price: number;
  status: string;
}

const ELEMENT_DATA: performanceData[] = [
  {
    id: 1,
    imagePath: 'assets/images/products/s6.jpg',
    pname: 'Gaming Console',
    category: 'Electronics',
    date: 'Tue, Sep 2 2025',
    price: 285,
    status: 'In Stock',
  },
  {
    id: 2,
    imagePath: 'assets/images/products/s9.jpg',
    pname: 'Leather Purse',
    category: 'Fashion',
    date: 'Mon, Sep 1 2025',
    price: 25,
    status: 'In Stock',
  },
  {
    id: 3,
    imagePath: 'assets/images/products/s7.jpg',
    pname: 'Red Velvate Dress',
    category: 'Womens Fashion',
    date: 'Mon, Sep 1 2025',
    price: 650,
    status: 'Out Of Stock',
  },
  {
    id: 4,
    imagePath: 'assets/images/products/s4.jpg',
    pname: 'Headphone Boat',
    category: 'Electronics',
    date: 'Thu, Aug 28 2025',
    price: 150,
    status: 'In Stock',
  },
];

@Component({
  selector: 'app-top-projects',
  imports: [
    NgApexchartsModule,
    MaterialModule,
    TablerIconsModule,
    CommonModule,
  ],
  templateUrl: './top-projects.component.html',
})
export class AppTopProjectsComponent {
  displayedColumns: string[] = ['product', 'date', 'status', 'price', 'action'];
  dataSource = ELEMENT_DATA;
}
