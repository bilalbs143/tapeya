import { Injectable } from '@angular/core';

import { type InterestCampaign } from 'src/app/services/interest-campaign.service';

/**
 * Scoped to CampaignDetailShellComponent via its providers array.
 * Allows child routes (overview, submissions) to read the already-loaded
 * campaign without issuing a second HTTP request.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- must stay out of root: one instance per shell via `providers: [CampaignDetailStateService]`
@Injectable()
export class CampaignDetailStateService {
  public campaign: InterestCampaign | null = null;
}
