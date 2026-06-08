# Component check report — one by one

Every JSX component checked against **docs/Coding guidelines.md**.  
**Guidelines** = file contains `"Coding guidelines: docs/Coding guidelines.md"` (or equivalent).  
**C/T** = CURSOR and TODO comment count (approximate).

**Last pass:** Added the guidelines reference to ExploreCategories, Profile, ScorecardHome, ShopSearchPopover, HeroSlider, ProfileStats, Button, ToastContext, StoreProvider.

---

## Root

| # | File | Guidelines | C/T | Notes |
|---|------|------------|-----|--------|
| 1 | App.jsx | ✅ | 0 | Root; import order done. |

---

## Layouts

| # | File | Guidelines | C/T | Notes |
|---|------|------------|-----|--------|
| 2 | layouts/MainLayout.jsx | ✅ | 0 | |
| 3 | layouts/AuthLayout.jsx | ✅ | 0 | |
| 4 | layouts/BlankLayout.jsx | ✅ | 0 | |

---

## Providers & contexts

| # | File | Guidelines | C/T | Notes |
|---|------|------------|-----|--------|
| 5 | providers/StoreProvider.jsx | ✅ | 0 | Header added. |
| 6 | context/ToastContext.jsx | ✅ | 0 | Guidelines line added. |

---

## Pages

| # | File | Guidelines | C/T | Notes |
|---|------|------------|-----|--------|
| 7 | pages/Home.jsx | ✅ | 0 | |
| 8 | pages/Profile.jsx | ✅ | 7 | Guidelines line added. |
| 9 | pages/NotificationCenter.jsx | ❌ | 18 | Add guidelines. |
| 10 | pages/TournamentRequest.jsx | ✅ | 2 | Done block in header. |
| 11 | pages/TournamentRequestSuccess.jsx | ✅ | 0 | |
| 12 | pages/auth/Login.jsx | ❌ | 12 | Add guidelines. |
| 13 | pages/auth/Register.jsx | ❌ | 3 | Add guidelines. |
| 14 | pages/auth/Otp.jsx | ❌ | 4 | Add guidelines. |
| 15 | pages/drafting/DraftingHome.jsx | ✅ | 0 | |
| 16 | pages/drafting/AddTeam.jsx | ✅ | 1 | |
| 17 | pages/drafting/TeamList.jsx | ✅ | 2 | |
| 18 | pages/drafting/TeamDetail.jsx | ✅ | 1 | |
| 19 | pages/feed/ActivityFeed.jsx | ❌ | 0 | Add guidelines. |
| 20 | pages/feed/ActivityFeedDetail.jsx | ❌ | 0 | Add guidelines. |
| 21 | pages/feed/PostCard.jsx | ❌ | 0 | Add guidelines. |
| 22 | pages/shop/ShopHome.jsx | ✅ | 0 | |
| 23 | pages/shop/ShopCheckout.jsx | ✅ | 0 | |
| 24 | pages/shop/ShopCart.jsx | ✅ | 0 | |
| 25 | pages/shop/ShopProductDetail.jsx | ✅ | 0 | |
| 26 | pages/shop/ShopFilter.jsx | ✅ | 0 | |
| 27 | pages/shop/ShopCategory.jsx | ✅ | 0 | |
| 28 | pages/shop/MyOrders.jsx | ✅ | 0 | |
| 29 | pages/shop/OrderPayment.jsx | ✅ | 0 | |
| 30 | pages/shop/OrderDetail.jsx | ✅ | 0 | |
| 31 | pages/shop/OrderSuccess.jsx | ✅ | 0 | |
| 32 | pages/pricing/Pricing.jsx | ✅ | 0 | |
| 33 | pages/pricing/PricingDetail.jsx | ✅ | 0 | |
| 34 | pages/reels/Reels.jsx | ✅ | 0 | |
| 35 | pages/reels/ReelItem.jsx | ✅ | 0 | |
| 36 | pages/reels/UploadReels.jsx | ✅ | 0 | |
| 37 | pages/ranking/Ranking.jsx | ❌ | 16 | Add guidelines. |
| 38 | pages/ranking/RankingStatsTotal.jsx | ❌ | 14 | Add guidelines. |
| 39 | pages/scorecard/ScorecardHome.jsx | ✅ | 1 | Uses layout + scorecardUtils. Guidelines added. |
| 40 | pages/scorecard/ScorecardDetails.jsx | ✅ | 6 | Uses layout. |
| 41 | pages/scorecard/ScorecardStatusDetails.jsx | ❌ | 16 | Add guidelines. |
| 42 | pages/scorecard/StatsTotal.jsx | ❌ | 14 | Add guidelines. |
| 43 | pages/scorecard/tabs/ScheduleTab.jsx | ✅ | 0 | |
| 44 | pages/scorecard/tabs/TableTab.jsx | ❌ | 7 | Add guidelines. |
| 45 | pages/scorecard/tabs/StatsTab.jsx | ❌ | 17 | Add guidelines. |
| 46 | pages/scorecard/tabs/TeamsTab.jsx | ❌ | 0 | Add guidelines. |
| 47 | pages/scorecard/tabs/SquadsTab.jsx | ❌ | 0 | Add guidelines. |
| 48 | pages/scorecard/tabs/SquadTeams.jsx | ✅ | 0 | |
| 49 | pages/scorecard/tabs/SquadSingle.jsx | ❌ | 0 | Add guidelines. |
| 50 | pages/scorecard/tabs/PlaceholderTab.jsx | ❌ | 0 | Add guidelines. |
| 51 | pages/scorecard/statusDetailsTabs/ScorecardTab.jsx | ❌ | 0 | Add guidelines. |
| 52 | pages/scorecard/statusDetailsTabs/LiveTab.jsx | ❌ | 0 | Add guidelines. |
| 53 | pages/scorecard/statusDetailsTabs/OversTab.jsx | ❌ | 0 | Add guidelines. |
| 54 | pages/scorecard/statusDetailsTabs/PlayingXITab.jsx | ❌ | 0 | Add guidelines. |
| 55 | pages/scorecard/statusDetailsTabs/PlaceholderTab.jsx | ❌ | 0 | Add guidelines. |
| 56 | pages/organizer/tournaments/Tournaments.jsx | ❌ | 10 | Add guidelines. |
| 57 | pages/organizer/tournaments/TournamentAddTeam.jsx | ❌ | 19 | Add guidelines. High CURSOR. |
| 58 | pages/organizer/tournaments/TournamentAddSquad.jsx | ❌ | 10 | Add guidelines. |
| 59 | pages/organizer/tournaments/TournamentEditSquad.jsx | ❌ | 16 | Add guidelines. |
| 60 | pages/organizer/tournaments/TournamentCreateTeamIntro.jsx | ❌ | 7 | Add guidelines. |
| 61 | pages/organizer/tournaments/TournamentFinalSquad.jsx | ❌ | 10 | Add guidelines. |
| 62 | pages/organizer/tournaments/TournamentSavedTeams.jsx | ❌ | 11 | Add guidelines. |
| 63 | pages/organizer/scoring/ScoringMatch.jsx | ❌ | 0 | Add guidelines. |
| 64 | pages/organizer/scoring/StartMatch.jsx | ❌ | 0 | Add guidelines. |
| 65 | pages/organizer/scoring/ShotAreaDialog.jsx | ❌ | 0 | Add guidelines. |
| 66 | pages/organizer/scoring/MatchStatsRow.jsx | ❌ | 0 | Add guidelines. |
| 67 | pages/organizer/scoring/scoring-tabs/ScoringTab.jsx | ❌ | 0 | Add guidelines. |
| 68 | pages/organizer/scoring/scoring-tabs/ScorecardTab.jsx | ❌ | 0 | Add guidelines. |
| 69 | pages/organizer/scoring/scoring-tabs/BallsTab.jsx | ❌ | 0 | Add guidelines. |
| 70 | pages/organizer/scoring/scoring-tabs/StatsTab.jsx | ❌ | 0 | Add guidelines. |
| 71 | pages/organizer/scoring/scoring-tabs/PartnershipTab.jsx | ❌ | 0 | Add guidelines. |
| 72 | pages/organizer/scoring/scoring-tabs/InfoTab.jsx | ❌ | 0 | Add guidelines. |
| 73 | pages/upcoming-tournaments/UpcomingTournaments.jsx | ❌ | 13 | Uses dateUtils. Add guidelines. |
| 74 | pages/upcoming-tournaments/UpcomingTournamentDetails.jsx | ❌ | 21 | Add guidelines. |
| 75 | pages/upcoming-tournaments/tabs/FixturesTab.jsx | ✅ | 11 | |
| 76 | pages/upcoming-tournaments/tabs/TeamsTab.jsx | ❌ | 9 | Add guidelines. |
| 77 | pages/upcoming-tournaments/tabs/SquadsTab.jsx | ❌ | 17 | Uses playerUtils. Add guidelines. |

---

## Components

| # | File | Guidelines | C/T | Notes |
|---|------|------------|-----|--------|
| 78 | components/RequireAuth.jsx | ✅ | 0 | |
| 79 | components/Navbar.jsx | ✅ | 5 | |
| 80 | components/Sidebar.jsx | ✅ | 19 | |
| 81 | components/BottomNav.jsx | ✅ | 10 | |
| 82 | components/HeroSlider.jsx | ✅ | 9 | Guidelines added. |
| 83 | components/ExploreCategories.jsx | ✅ | 5 | Guidelines added. |
| 84 | components/HighlightSlider.jsx | ❌ | 0 | Add guidelines. |
| 85 | components/LiveMatchSlider.jsx | ❌ | 0 | Add guidelines. |
| 86 | components/FloatingCartButton.jsx | ✅ | 8 | |
| 87 | components/SplashScreen.jsx | ✅ | 7 | |
| 88 | components/ScrollRestoration.jsx | ✅ | 4 | |
| 89 | components/ProfileHeader.jsx | ❌ | 0 | No JSDoc; add block + guidelines. |
| 90 | components/dialogs/DialogManager.jsx | ✅ | 0 | |
| 91 | components/dialogs/BaseDialog.jsx | ❌ | 0 | Add guidelines. |
| 92 | components/dialogs/PricingSuccessDialog.jsx | ❌ | 0 | Add guidelines. |
| 93 | components/dialogs/DraftingSubmitSquadSuccessDialog.jsx | ❌ | 0 | Add guidelines. |
| 94 | components/dialogs/TournamentSquadUpdatedSuccessDialog.jsx | ❌ | 0 | Add guidelines. |
| 95 | components/dialogs/scoring/TossDialog.jsx | ❌ | 0 | Add guidelines. |
| 96 | components/dialogs/scoring/TeamSelectDialog.jsx | ❌ | 0 | Add guidelines. |
| 97 | components/dialogs/scoring/TeamNameDialog.jsx | ❌ | 0 | Add guidelines. |
| 98 | components/dialogs/scoring/OversDialog.jsx | ❌ | 0 | Add guidelines. |
| 99 | components/dialogs/scoring/PlayersPerSideDialog.jsx | ❌ | 0 | Add guidelines. |
| 100 | components/dialogs/scoring/ScoringSquadPlayerPickerDialog.jsx | ❌ | 0 | Unified batting/bowling squad picker (replaces AddBatsmanDialog + AddBowlerDialog). Add guidelines. |
| 101 | components/dialogs/scoring/OutReasonDialog.jsx | ❌ | 0 | Add guidelines. |
| 102 | components/dialogs/scoring/FielderPickerDialog.jsx | ❌ | 0 | Add guidelines. |
| 103 | components/dialogs/scoring/CustomScoreDialog.jsx | ❌ | 0 | Add guidelines. |
| 104 | components/shop/ShopSearchPopover.jsx | ✅ | 7 | Uses useDebounce, search constants. Guidelines added. |
| 105 | components/shop/ListingProductCard.jsx | ❌ | 9 | Add guidelines. |
| 106 | components/scorecard/ScorecardTabs.jsx | ❌ | 0 | Add guidelines. |
| 107 | components/scorecard/MatchCard.jsx | ❌ | 0 | Add guidelines. |
| 108 | components/scorecard/CommentaryText.jsx | ❌ | 0 | Add guidelines. |
| 109 | components/UserProfileTabs/ProfileOverview.jsx | ❌ | 8 | Add guidelines. |
| 110 | components/UserProfileTabs/ProfileStats.jsx | ❌ | 5 | Uses displayUtils. Add guidelines. |
| 111 | components/UserProfileTabs/PlayerProfile.jsx | ❌ | 5 | Add guidelines. |
| 112 | components/UserProfileTabs/UserEdit.jsx | ❌ | 13 | Add guidelines. |
| 113 | components/UserProfileTabs/ProfileMetrics.jsx | ❌ | 0 | Add guidelines. |
| 114 | components/UserProfileTabs/ProfilePosts.jsx | ❌ | 0 | Add guidelines. |
| 115 | components/UserProfileTabs/OrganizerOverview.jsx | ❌ | 0 | Add guidelines. |
| 116 | components/UserProfileTabs/OrganizerStats.jsx | ❌ | 0 | Add guidelines. |
| 117 | components/UserProfileTabs/OrganizerEvents.jsx | ❌ | 0 | Add guidelines. |
| 118 | components/UserProfileTabs/SponsorOverview.jsx | ❌ | 0 | Add guidelines. |
| 119 | components/UserProfileTabs/SponsorStats.jsx | ❌ | 0 | Add guidelines. |
| 120 | components/UserProfileTabs/SponsorTeams.jsx | ❌ | 0 | Add guidelines. |
| 121 | components/UserProfileTabs/SponsorProfileTabs.jsx | ❌ | 0 | Add guidelines. |
| 122 | components/UserProfileTabs/OrganizerProfileTabs.jsx | ❌ | 0 | Add guidelines. |

---

## UI

| # | File | Guidelines | C/T | Notes |
|---|------|------------|-----|--------|
| 123 | ui/Button.jsx | ❌ | 0 | Add guidelines. |
| 124 | ui/Input.jsx | ❌ | 0 | Add guidelines. |
| 125 | ui/DatePicker.jsx | ❌ | 0 | Has error prop. Add guidelines. |
| 126 | ui/ToggleGroupField.jsx | ✅ | 0 | |
| 127 | ui/FormField.jsx | ❌ | 0 | Add guidelines. |
| 128 | ui/Select.jsx | ❌ | 0 | Add guidelines. |
| 129 | ui/Tabs.jsx | ❌ | 0 | Add guidelines. |
| 130 | ui/Checkbox.jsx | ❌ | 0 | Add guidelines. |
| 131 | ui/RadioGroup.jsx | ❌ | 0 | Add guidelines. |
| 132 | ui/Switch.jsx | ❌ | 0 | Add guidelines. |
| 133 | ui/Toggle.jsx | ❌ | 0 | Add guidelines. |
| 134 | ui/ToggleGroup.jsx | ❌ | 0 | Add guidelines. |
| 135 | ui/Dialog.jsx | ❌ | 0 | Add guidelines. |
| 136 | ui/AlertDialog.jsx | ❌ | 0 | Add guidelines. |
| 137 | ui/Popover.jsx | ❌ | 0 | Add guidelines. |
| 138 | ui/Container.jsx | ❌ | 0 | Add guidelines. |
| 139 | ui/Avatar.jsx | ❌ | 0 | Add guidelines. |
| 140 | ui/Label.jsx | ❌ | 0 | Add guidelines. |
| 141 | ui/PhoneInput.jsx | ❌ | 0 | Add guidelines. |
| 142 | ui/TimePicker.jsx | ❌ | 0 | Add guidelines. |
| 143 | ui/Progress.jsx | ❌ | 0 | Add guidelines. |
| 144 | ui/Slider.jsx | ❌ | 0 | Add guidelines. |
| 145 | ui/Separator.jsx | ❌ | 0 | Add guidelines. |
| 146 | ui/Toast.jsx | ❌ | 0 | Add guidelines. |
| 147 | ui/Tooltip.jsx | ❌ | 0 | Add guidelines. |
| 148 | ui/Accordion.jsx | ❌ | 0 | Add guidelines. |
| 149 | ui/Collapsible.jsx | ❌ | 0 | Add guidelines. |
| 150 | ui/DropdownMenu.jsx | ❌ | 0 | Add guidelines. |
| 151 | ui/ContextMenu.jsx | ❌ | 0 | Add guidelines. |
| 152 | ui/Menubar.jsx | ❌ | 0 | Add guidelines. |
| 153 | ui/NavigationMenu.jsx | ❌ | 0 | Add guidelines. |
| 154 | ui/HoverCard.jsx | ❌ | 0 | Add guidelines. |
| 155 | ui/AspectRatio.jsx | ❌ | 0 | Add guidelines. |
| 156 | ui/ScrollArea.jsx | ❌ | 0 | Add guidelines. |
| 157 | ui/Toolbar.jsx | ❌ | 0 | Add guidelines. |

---

## Summary

| Area | Total | With guidelines | Without |
|------|-------|-----------------|--------|
| Root | 1 | 1 | 0 |
| Layouts | 3 | 3 | 0 |
| Providers/contexts | 2 | 0 | 2 |
| Pages | 71 | 24 | 47 |
| Components | 45 | 10 | 35 |
| UI | 35 | 1 | 34 |
| **Total** | **157** | **39** | **118** |

---

## Quick fixes

1. **Add guidelines line** to any file that has a top `/**` block but does not contain `"Coding guidelines"`: add  
   ` * Coding guidelines: docs/Coding guidelines.md`  
   before the closing `*/`.
2. **Add full header** to files with no JSDoc:  
   `/**\n * ComponentName\n *\n * Short description.\n * Coding guidelines: docs/Coding guidelines.md\n */`
3. **CURSOR/TODO** — See §6 in previous report for patterns to roll out (parseTournamentId, useDebounce, playerDisplayRole, tableStyles, keys).

---

## Shared lib (reference)

| File | Purpose |
|------|--------|
| lib/constants/layout.js | NAVBAR_HEIGHT, BOTTOM_NAV_HEIGHT |
| lib/constants/search.js | DEBOUNCE_MS, MIN_SEARCH_LENGTH |
| lib/utils/dateUtils.js | toApiDate, toDateStr, parseDate |
| lib/utils/scorecardUtils.js | normaliseMatchStatus, normaliseTournamentMatches |
| lib/utils/displayUtils.js | formatNum, formatDecimal |
| lib/utils/playerUtils.js | playerDisplayRole |
| lib/utils/tournamentUtils.js | parseTournamentId, isValidTournamentId |
| hooks/useDebounce.js | useDebounce(value, delayMs) |
