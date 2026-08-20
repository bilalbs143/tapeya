import { Component, computed, DestroyRef, EventEmitter, inject, Input, OnInit, Output, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { BrandingComponent } from '../../vertical/sidebar/branding.component';

import { AppSettings } from 'src/app/config';
import { MaterialModule } from 'src/app/material.module';
import type { AuthUser } from 'src/app/models/auth.models';
import { AuthService } from 'src/app/services/auth.service';
import { BackofficeReverbService } from 'src/app/services/backoffice-reverb.service';
import { CoreService } from 'src/app/services/core.service';
import type { Notification } from 'src/app/services/notifications.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { HEADER_NOTIFICATION_PREVIEW_PER_PAGE } from 'src/app/shared/config/paginator.config';
import { ADMIN_NOTIFICATION_TYPE_LABELS, AdminNotificationType } from 'src/app/shared/constants/notification.constants';
import { authUserDisplayName, authUserDisplayRole, isAdmin as authUserIsAdmin } from 'src/app/shared/functions/auth-user-display';

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-horizontal-header',
  imports: [RouterModule, TablerIconsModule, MaterialModule, BrandingComponent, NgScrollbarModule, LoaderComponent],
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
  private readonly auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly reverb = inject(BackofficeReverbService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly currentUser: Signal<AuthUser | null> = this.auth.currentUser;

  public readonly profileMenuUserName = computed(() => authUserDisplayName(this.auth.currentUser()));

  public readonly profileMenuUserRole = computed(() => authUserDisplayRole(this.auth.currentUser()));

  public readonly isAdmin = computed(() => authUserIsAdmin(this.auth.currentUser()));

  constructor() {
    this.notificationsService.adminInboxBroadcast$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadNotifications());
  }

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
    if (this.auth.isAuthenticated()) {
      this.reverb.connect();
    }
  }

  public loadNotifications(): void {
    this.notificationsLoading = true;
    this.notificationsService.getList({ page: 1, per_page: HEADER_NOTIFICATION_PREVIEW_PER_PAGE }).subscribe({
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
    if (type === AdminNotificationType.VENDOR_APPLICATION_SUBMITTED) return 'building-store';
    if (type === AdminNotificationType.BROADCAST_CONCURRENCY_HIGH) return 'broadcast';
    if (type === AdminNotificationType.YOUTUBE_QUOTA_HIGH) return 'gauge';
    if (type === AdminNotificationType.SUPPORT_MESSAGE_SUBMITTED) return 'headset';
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
}
