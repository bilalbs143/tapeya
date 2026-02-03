import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { HomepageDetailsComponent } from './homepage-details/homepage-details.component';
import { BlogComponent } from './blog/blog.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { PricingComponent } from './pricing/pricing.component';
import { ContactComponent } from './contact/contact.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';


export const FrontPagesRoutes: Routes = [

  {
    path: '',
    component: HomepageComponent, // acts as layout shell
    children: [
      {
        path: '',
        title: 'Homepage',
        redirectTo: 'homepage',
        pathMatch: 'full'
      },
      {
        path: 'homepage',
        title: 'Homepage',
        component: HomepageDetailsComponent
      },
      {
        path: 'about',
        title: 'AboutUs Page',
        component: AboutUsComponent
      },
      {
        path: 'blog',
        title: 'Blog Post Page',
        component: BlogComponent
      },
      {
        path: 'portfolio',
        title: 'Portfolio Page',
        component: PortfolioComponent
      },
      {
        path: 'pricing',
        title: 'Pricing Page',
        component: PricingComponent
      },
      {
        path: 'contact',
        title: 'Contact Page',
        component: ContactComponent
      },
      {
        path: 'blog-details',
        title: 'Blog Details',
        component: BlogDetailsComponent
      },
    ],
  },
];