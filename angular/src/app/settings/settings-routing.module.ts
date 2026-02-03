import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'admin-profile',
    loadChildren: () => import('./admin-profile/admin-profile.module').then((m) => m.AdminProfileModule),
  },
  {
    path: 'additional-bonuses',
    loadChildren: () => import('./additional-bonuses/additional-bonuses.module').then((m) => m.AdditionalBonusesModule),
  },
  {
    path: 'system-settings',
    loadChildren: () => import('./system-settings/system-settings.module').then((m) => m.SystemSettingsModule),
  },
  {
    path: 'blacklisted-ips-management',
    loadChildren: () => import('./blacklisted-ips-management/blacklisted-ips-management.module').then((m) => m.BlacklistedIpsManagementModule),
  },
  {
    path: 'membership-bonuses',
    loadChildren: () => import('./membership-bonuses/membership-bonuses.module').then((m) => m.MembershipBonusesModule),
  },
  {
    path: 'sound-settings',
    loadChildren: () => import('./sound-settings/sound-settings.module').then((m) => m.SoundSettingsModule),
  },
  {
    path: 'sounds-management',
    loadChildren: () => import('./sounds-management/sounds-management.module').then((m) => m.SoundsManagementModule),
  },
  {
    path: 'whitelisted-ips-management',
    loadChildren: () => import('./whitelisted-ips-management/whitelisted-ips-management.module').then((m) => m.WhitelistedIpsManagementModule),
  },
  {
    path: 'banks',
    redirectTo: '/banks-management/banks',
  },
  {
    path: 'bank-accounts',
    redirectTo: '/banks-management/bank-accounts',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
