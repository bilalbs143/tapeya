import { Component } from '@angular/core';
import { IconModule } from 'src/app/icon/icon.module';
import { MaterialModule } from 'src/app/material.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [MaterialModule, IconModule, RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  applicationsItems = [
    {
      title: 'Pricing',
      href: "/theme-pages/pricing"
    },
    {
      title: 'Account Settings',
      href: "/theme-pages/account-setting"
    },
    {
      title: 'FAQ',
      href: "/theme-pages/faq"
    },
    {
      title: 'Casl',
      href: "/apps/permission"
    },
  ];

  formsItems = [
    {
      title: 'Cards',
      href: "/widgets/cards"
    },
    {
      title: 'Banners',
      href: "/widgets/banners"
    },
    {
      title: 'Charts',
      href: "/widgets/charts"
    },
  ];

  tablesItems = [
    {
      title: 'Form Layouts',
      href: "/forms/form-layouts"
    },
    {
      title: 'Tables',
      href: "/tables/basic-table"
    },
    {
      title: 'Datatable',
      href: "/datatable/kichen-sink"
    },
    {
      title: 'Dynamic',
      href: "/tables/dynamic-table"
    },
    {
      title: 'Expand',
      href: "/tables/expand-table"
    },
  ];

  socialIcons = [
    { src: 'assets/images/front-pages/icon-facebook.svg', tooltip: 'Facebook' },
    { src: 'assets/images/front-pages/icon-twitter.svg', tooltip: 'Twitter' },
    { src: 'assets/images/front-pages/icon-instagram.svg', tooltip: 'Instagram' },
  ];
}
