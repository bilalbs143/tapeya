import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Subscription } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';
import { MessageService } from 'src/app/services/message.service';
import { BackofficeUser, UsersService } from 'src/app/services/users.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';

import { ManageUserDialogComponent } from './manage-user-dialog/manage-user-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    TablerIconsModule,
    TableWrapperComponent,
    PaginatorComponent,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly usersService = inject(UsersService);
  private readonly message = inject(MessageService);

  @ViewChild(PaginatorComponent) public appPaginator!: PaginatorComponent;

  public displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];
  public dataSource = new MatTableDataSource<BackofficeUser>([]);

  public searchText = '';
  private readonly sub = new Subscription();

  public ngOnInit(): void {
    this.sub.add(
      this.usersService.users$.subscribe((users) => {
        this.dataSource.data = users;
        this.connectPaginator();
        this.applyFilter(this.searchText);
      })
    );
  }

  public ngAfterViewInit(): void {
    this.connectPaginator();
  }

  private connectPaginator(): void {
    if (this.appPaginator?.matPaginator) {
      this.dataSource.paginator = this.appPaginator.matPaginator;
    }
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public applyFilter(value: string): void {
    this.searchText = value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  public openCreateDialog(): void {
    this.message.openDialog<ManageUserDialogComponent, boolean>(
      ManageUserDialogComponent,
      { mode: 'create' },
      (result) => {
        if (result) {
          this.applyFilter(this.searchText);
        }
      },
      { widthSize: 'xs', disableClose: true }
    );
  }

  public openEditDialog(user: BackofficeUser): void {
    this.message.openDialog<ManageUserDialogComponent, boolean>(
      ManageUserDialogComponent,
      { mode: 'edit', user },
      (result) => {
        if (result) {
          this.applyFilter(this.searchText);
        }
      },
      { widthSize: 'sm', disableClose: true }
    );
  }

  public openDeleteDialog(user: BackofficeUser): void {
    this.sub.add(
      this.message
        .prompt(
          'Delete User?',
          `Are you sure you want to delete ${user.name}?`,
          'Delete',
          'Cancel'
        )
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.usersService.remove(user.id);
            this.message.success('User deleted successfully.');
            this.applyFilter(this.searchText);
          }
        })
    );
  }
}
