import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MessageService } from './message.service';

export interface BackofficeUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'blocked';
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly messages = inject(MessageService);

  // Simple in-memory store for now; can be replaced with HTTP later.
  private readonly usersSubject = new BehaviorSubject<BackofficeUser[]>([
    { id: 1, name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Bob Manager', email: 'bob@example.com', role: 'Manager', status: 'active' },
    { id: 3, name: 'Charlie Viewer', email: 'charlie@example.com', role: 'Viewer', status: 'blocked' },
  ]);

  public get users$(): Observable<BackofficeUser[]> {
    return this.usersSubject.asObservable();
  }

  public getSnapshot(): BackofficeUser[] {
    return this.usersSubject.getValue();
  }

  public upsert(user: Partial<BackofficeUser>): void {
    const current = this.getSnapshot();

    if (user.id) {
      const updated = current.map((u) => (u.id === user.id ? ({ ...u, ...user } as BackofficeUser) : u));
      this.usersSubject.next(updated);
      this.messages.success('User updated successfully.');
      return;
    }

    const nextId = current.length ? Math.max(...current.map((u) => u.id)) + 1 : 1;
    const created: BackofficeUser = {
      id: nextId,
      name: user.name ?? '',
      email: user.email ?? '',
      role: user.role ?? 'Viewer',
      status: (user.status as BackofficeUser['status']) ?? 'active',
    };
    this.usersSubject.next([...current, created]);
    this.messages.success('User created successfully.');
  }

  public remove(id: number): void {
    const current = this.getSnapshot();
    this.usersSubject.next(current.filter((u) => u.id !== id));
    this.messages.success('User deleted successfully.');
  }
}
