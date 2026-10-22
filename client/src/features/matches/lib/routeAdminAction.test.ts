import { describe, expect, it } from 'vitest';

import { routeAdminAction } from './routeAdminAction';

describe('routeAdminAction', () => {
  it('routes known admin codes', () => {
    expect(routeAdminAction('change_squad')).toEqual({ kind: 'declare_squad' });
    expect(routeAdminAction('penalty')).toEqual({ kind: 'penalty' });
    expect(routeAdminAction('revise_target')).toEqual({ kind: 'state_sheet', action: 'revise_target' });
    expect(routeAdminAction('end_innings')).toEqual({ kind: 'state_sheet', action: 'end_innings' });
    expect(routeAdminAction('declare_result')).toEqual({ kind: 'declare_result' });
    expect(routeAdminAction('cancel_match')).toEqual({ kind: 'cancel_match' });
    expect(routeAdminAction('substitute')).toEqual({ kind: 'admin_sheet', action: 'substitute' });
  });
});
