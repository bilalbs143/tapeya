import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { finalize } from 'rxjs';

import { AgentBasicInfoComponent } from '../../shared/components/agent-basic-info/agent-basic-info.component';
import { CARD_LOADER } from '../../shared/constants/constants';
import { AgentsManagementService } from '../../shared/services/agents-management.service';

@Component({
  selector: 'app-hierarchy',
  templateUrl: './hierarchy.component.html',
  standalone: false,
})
export class HierarchyComponent implements OnInit {
  private agentsManagementService = inject(AgentsManagementService);

  @ViewChild(AgentBasicInfoComponent) public agentBasicInfoComponent: AgentBasicInfoComponent;

  protected readonly cardLoader = CARD_LOADER;
  public user: any;
  public isLoading: boolean = true;
  public branches: Array<any> = [];

  private getAgentHierarchy(): void {
    this.isLoading = true;
    this.agentsManagementService
      .hierarchy()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.branches = response.data || [];
          this.agentBasicInfoComponent.loadHttpData(this.branches[0].id);
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  public ngOnInit(): void {
    this.getAgentHierarchy();
  }

  public onItemClicked(id: any): void {
    this.agentBasicInfoComponent.loadHttpData(id);
  }
}
