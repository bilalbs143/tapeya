import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { BrandingComponent } from '../../vertical/sidebar/branding.component';

import { AppSettings } from 'src/app/config';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';
import type { Notification } from 'src/app/services/notifications.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ADMIN_NOTIFICATION_TYPE_LABELS, AdminNotificationType } from 'src/app/shared/constants/notification.constants';

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-horizontal-header',
  imports: [RouterModule, TablerIconsModule, MaterialModule, BrandingComponent, NgScrollbarModule],
  templateUrl: './header.component.html',
})
export class AppHorizontalHeaderComponent implements OnInit {
  @Input() public showToggle = true;
  @Input() public toggleChecked = false;
  @Output() public readonly toggleMobileNav = new EventEmitter<void>();
  @Output() public readonly toggleMobileFilterNav = new EventEmitter<void>();
  @Output() public readonly toggleCollapsed = new EventEmitter<void>();
  @Output() public readonly optionsChange = new EventEmitter<AppSettings>();

  public showFiller = false;
  public readonly AdminNotificationType = AdminNotificationType;

  private readonly settings = inject(CoreService);
  private readonly notificationsService = inject(NotificationsService);

  public apiNotifications: Notification[] = [];
  public notificationsUnreadCount = 0;
  public notificationsLoading = false;

  public get options(): AppSettings {
    return this.settings.getOptions();
  }

  private emitOptions(): void {
    this.optionsChange.emit(this.settings.getOptions());
  }

  public setlightDark(theme: 'light' | 'dark'): void {
    this.settings.setOptions({ theme });
    this.emitOptions();
  }

  public ngOnInit(): void {
    this.loadNotifications();
  }

  public loadNotifications(): void {
    this.notificationsLoading = true;
    this.notificationsService.getList({ page: 1, per_page: 5 }).subscribe({
      next: (res) => {
        this.apiNotifications = res?.data ?? [];
        this.notificationsUnreadCount = res?.meta?.unread_count ?? 0;
        this.notificationsLoading = false;
      },
      error: () => {
        this.notificationsLoading = false;
      },
    });
  }

  public notificationTypeLabel(type: string | null): string {
    if (!type) return 'Notification';
    return ADMIN_NOTIFICATION_TYPE_LABELS[type as keyof typeof ADMIN_NOTIFICATION_TYPE_LABELS] ?? type;
  }

  public notificationIcon(type: string | null): string {
    if (type === AdminNotificationType.ORDER_PLACED) return 'shopping-cart';
    if (type === AdminNotificationType.TOURNAMENT_REQUEST_SUBMITTED) return 'file-text';
    return 'user';
  }

  public profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '/',
    },
  ];

  public apps: apps[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-dd-chat.svg',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-dd-cart.svg',
      title: 'Todo App',
      subtitle: 'Completed task',
      link: '/',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-dd-invoice.svg',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/',
    },
    {
      id: 4,
      img: '/assets/images/svgs/icon-dd-date.svg',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/',
    },
    {
      id: 5,
      img: '/assets/images/svgs/icon-dd-mobile.svg',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/',
    },
    {
      id: 6,
      img: '/assets/images/svgs/icon-dd-lifebuoy.svg',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/',
    },
    {
      id: 7,
      img: '/assets/images/svgs/icon-dd-message-box.svg',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/',
    },
    {
      id: 8,
      img: '/assets/images/svgs/icon-dd-application.svg',
      title: 'Conatct List',
      subtitle: 'Create new contact',
      link: '/',
    },
  ];

  public quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Pricing Page',
      link: '/t',
    },
    {
      id: 2,
      title: 'Authentication Design',
      link: '/',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/',
    },
    {
      id: 8,
      title: 'Treeview',
      link: '/',
    },
  ];
}
