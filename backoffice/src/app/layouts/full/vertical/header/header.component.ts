import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Signal,
  computed,
  inject,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

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
  selector: 'app-header',
  imports: [RouterModule, NgScrollbarModule, TablerIconsModule, MaterialModule, LoaderComponent],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @Input() public showToggle = true;
  @Input() public toggleChecked = false;
  @Output() public readonly toggleMobileNav = new EventEmitter<void>();
  @Output() public readonly toggleCollapsed = new EventEmitter<void>();
  @Output() public readonly optionsChange = new EventEmitter<AppSettings>();

  private readonly settings = inject(CoreService);
  private readonly auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly reverb = inject(BackofficeReverbService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.notificationsService.adminInboxBroadcast$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!authUserIsAdmin(this.auth.currentUser())) {
        return;
      }
      this.loadNotifications();
    });
  }

  public readonly AdminNotificationType = AdminNotificationType;
  public apiNotifications: Notification[] = [];
  public notificationsUnreadCount = 0;
  public notificationsLoading = false;

  public get options(): AppSettings {
    return this.settings.getOptions();
  }

  public readonly currentUser: Signal<AuthUser | null> = computed(() => this.auth.currentUser());

  public readonly profileMenuUserName = computed(() => authUserDisplayName(this.currentUser()));

  public readonly profileMenuUserRole = computed(() => authUserDisplayRole(this.currentUser()));

  public readonly isAdmin = computed(() => authUserIsAdmin(this.currentUser()));

  private emitOptions(): void {
    this.optionsChange.emit(this.settings.getOptions());
  }

  public setlightDark(theme: 'light' | 'dark'): void {
    this.settings.setOptions({ theme });
    this.emitOptions();
  }

  public logout() {
    this.reverb.disconnect();
    this.auth.logout();
  }

  public ngOnInit(): void {
    if (authUserIsAdmin(this.auth.currentUser())) {
      this.loadNotifications();
    }
    this.reverb.connect();
  }

  public loadNotifications(): void {
    if (!authUserIsAdmin(this.auth.currentUser())) {
      return;
    }
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
  ];
}
