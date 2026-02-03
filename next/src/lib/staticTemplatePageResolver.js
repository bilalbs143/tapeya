'use client';

/* eslint-disable simple-import-sort/imports */
// Import both templates and select by environment variable
import T1_Home from '@/dynamic-components/template1/home/HomePage';
import T1_Slots from '@/dynamic-components/template1/slots/SlotsPage';
import T1_LiveCasino from '@/dynamic-components/template1/live-casino/LiveCasinoPage';
import T1_About from '@/dynamic-components/template1/about/AboutPage';
import T1_Contact from '@/dynamic-components/template1/contact-us/ContactUsPage';
import T1_CookiePolicy from '@/dynamic-components/template1/cookie-policy/CookiePolicyPage';
import T1_Disclaimer from '@/dynamic-components/template1/disclaimer/DisclaimerPage';
import T1_Faq from '@/dynamic-components/template1/faq/FaqPage';
import T1_PrivacyPolicy from '@/dynamic-components/template1/privacy-policy/PrivacyPolicyPage';
import T1_ResponsibleGambling from '@/dynamic-components/template1/responsible-gambling/ResponsibleGamblingPage';
import T1_TermsOfUse from '@/dynamic-components/template1/terms-of-use/TermsOfUsePage';

// Template 2 imports
import T2_Home from '@/dynamic-components/template2/home/HomePage';
import T2_SlotProviders from '@/dynamic-components/template2/slot-providers/SlotProvidersPage';
import T2_Slots from '@/dynamic-components/template2/slots/SlotsPage';
import T2_LiveCasino from '@/dynamic-components/template2/live-casino/LiveCasinoPage';
import T2_About from '@/dynamic-components/template2/about/AboutPage';
import T2_Contact from '@/dynamic-components/template2/contact-us/ContactUsPage';
import T2_CookiePolicy from '@/dynamic-components/template2/cookie-policy/CookiePolicyPage';
import T2_Disclaimer from '@/dynamic-components/template2/disclaimer/DisclaimerPage';
import T2_Faq from '@/dynamic-components/template2/faq/FaqPage';
import T2_PrivacyPolicy from '@/dynamic-components/template2/privacy-policy/PrivacyPolicyPage';
import T2_ResponsibleGambling from '@/dynamic-components/template2/responsible-gambling/ResponsibleGamblingPage';
import T2_TermsOfUse from '@/dynamic-components/template2/terms-of-use/TermsOfUsePage';

// Template 3 imports
import T3_Home from '@/dynamic-components/template3/home/HomePage';
import T3_SlotProviders from '@/dynamic-components/template3/slot-providers/SlotProvidersPage';
import T3_Slots from '@/dynamic-components/template3/slots/SlotsPage';
import T3_LiveCasino from '@/dynamic-components/template3/live-casino/LiveCasinoPage';
import T3_About from '@/dynamic-components/template3/about/AboutPage';
import T3_Contact from '@/dynamic-components/template3/contact-us/ContactUsPage';
import T3_CookiePolicy from '@/dynamic-components/template3/cookie-policy/CookiePolicyPage';
import T3_Disclaimer from '@/dynamic-components/template3/disclaimer/DisclaimerPage';
import T3_Faq from '@/dynamic-components/template3/faq/FaqPage';
import T3_PrivacyPolicy from '@/dynamic-components/template3/privacy-policy/PrivacyPolicyPage';
import T3_ResponsibleGambling from '@/dynamic-components/template3/responsible-gambling/ResponsibleGamblingPage';
import T3_TermsOfUse from '@/dynamic-components/template3/terms-of-use/TermsOfUsePage';

// Template 4 imports
import T4_Home from '@/dynamic-components/template4/home/HomePage';
import T4_SlotProviders from '@/dynamic-components/template4/slot-providers/SlotProvidersPage';
import T4_Slots from '@/dynamic-components/template4/slots/SlotsPage';
import T4_LiveCasino from '@/dynamic-components/template4/live-casino/LiveCasinoPage';
import T4_About from '@/dynamic-components/template4/about/AboutPage';
import T4_Contact from '@/dynamic-components/template4/contact-us/ContactUsPage';
import T4_CookiePolicy from '@/dynamic-components/template4/cookie-policy/CookiePolicyPage';
import T4_Disclaimer from '@/dynamic-components/template4/disclaimer/DisclaimerPage';
import T4_Faq from '@/dynamic-components/template4/faq/FaqPage';
import T4_PrivacyPolicy from '@/dynamic-components/template4/privacy-policy/PrivacyPolicyPage';
import T4_ResponsibleGambling from '@/dynamic-components/template4/responsible-gambling/ResponsibleGamblingPage';
import T4_TermsOfUse from '@/dynamic-components/template4/terms-of-use/TermsOfUsePage';

// Template 5 imports
import T5_Home from '@/dynamic-components/template5/home/HomePage';
import T5_SlotProviders from '@/dynamic-components/template5/slot-providers/SlotProvidersPage';
import T5_Slots from '@/dynamic-components/template5/slots/SlotsPage';
import T5_LiveCasino from '@/dynamic-components/template5/live-casino/LiveCasinoPage';
import T5_About from '@/dynamic-components/template5/about/AboutPage';
import T5_Contact from '@/dynamic-components/template5/contact-us/ContactUsPage';
import T5_CookiePolicy from '@/dynamic-components/template5/cookie-policy/CookiePolicyPage';
import T5_Disclaimer from '@/dynamic-components/template5/disclaimer/DisclaimerPage';
import T5_Faq from '@/dynamic-components/template5/faq/FaqPage';
import T5_PrivacyPolicy from '@/dynamic-components/template5/privacy-policy/PrivacyPolicyPage';
import T5_ResponsibleGambling from '@/dynamic-components/template5/responsible-gambling/ResponsibleGamblingPage';
import T5_TermsOfUse from '@/dynamic-components/template5/terms-of-use/TermsOfUsePage';
import T5_Announcements from '@/dynamic-components/template5/announcements/AnnouncementsPage';
import T5_BettingManagement from '@/dynamic-components/template5/dashboard/BettingManagementPage';
import T5_Coupons from '@/dynamic-components/template5/dashboard/CouponsPage';
import T5_DashboardCustomerInquiry from '@/dynamic-components/template5/dashboard/CustomerInquiryPage';
import T5_Deposit from '@/dynamic-components/template5/dashboard/DepositPage';
import T5_Exchange from '@/dynamic-components/template5/dashboard/ExchangePage';
import T5_Faqs from '@/dynamic-components/template5/dashboard/FaqsPage';
import T5_Note from '@/dynamic-components/template5/dashboard/NotePage';
import T5_Points from '@/dynamic-components/template5/dashboard/PointsPage';
import T5_Profile from '@/dynamic-components/template5/dashboard/ProfilePage';
import T5_Referrals from '@/dynamic-components/template5/dashboard/ReferralsPage';
import T5_Withdrawal from '@/dynamic-components/template5/dashboard/WithdrawalPage';

// Template 6 imports
import T6_Home from '@/dynamic-components/template6/home/HomePage';
import T6_SlotProviders from '@/dynamic-components/template6/slot-providers/SlotProvidersPage';
import T6_Slots from '@/dynamic-components/template6/slots/SlotsPage';
import T6_LiveCasino from '@/dynamic-components/template6/live-casino/LiveCasinoPage';
import T6_About from '@/dynamic-components/template6/about/AboutPage';
import T6_Contact from '@/dynamic-components/template6/contact-us/ContactUsPage';
import T6_CookiePolicy from '@/dynamic-components/template6/cookie-policy/CookiePolicyPage';
import T6_Disclaimer from '@/dynamic-components/template6/disclaimer/DisclaimerPage';
import T6_Faq from '@/dynamic-components/template6/faq/FaqPage';
import T6_PrivacyPolicy from '@/dynamic-components/template6/privacy-policy/PrivacyPolicyPage';
import T6_ResponsibleGambling from '@/dynamic-components/template6/responsible-gambling/ResponsibleGamblingPage';
import T6_TermsOfUse from '@/dynamic-components/template6/terms-of-use/TermsOfUsePage';
import T6_Announcements from '@/dynamic-components/template6/announcements/AnnouncementsPage';
import T6_BettingManagement from '@/dynamic-components/template6/dashboard/BettingManagementPage';
import T6_Coupons from '@/dynamic-components/template6/dashboard/CouponsPage';
import T6_DashboardCustomerInquiry from '@/dynamic-components/template6/dashboard/CustomerInquiryPage';
import T6_Deposit from '@/dynamic-components/template6/dashboard/DepositPage';
import T6_Exchange from '@/dynamic-components/template6/dashboard/ExchangePage';
import T6_Faqs from '@/dynamic-components/template6/dashboard/FaqsPage';
import T6_Note from '@/dynamic-components/template6/dashboard/NotePage';
import T6_Points from '@/dynamic-components/template6/dashboard/PointsPage';
import T6_Profile from '@/dynamic-components/template6/dashboard/ProfilePage';
import T6_Referrals from '@/dynamic-components/template6/dashboard/ReferralsPage';
import T6_Withdrawal from '@/dynamic-components/template6/dashboard/WithdrawalPage';

// Template 7 imports
import T7_Home from '@/dynamic-components/template7/home/HomePage';
import T7_SlotProviders from '@/dynamic-components/template7/slot-providers/SlotProvidersPage';
import T7_Slots from '@/dynamic-components/template7/slots/SlotsPage';
import T7_LiveCasino from '@/dynamic-components/template7/live-casino/LiveCasinoPage';
import T7_About from '@/dynamic-components/template7/about/AboutPage';
import T7_Contact from '@/dynamic-components/template7/contact-us/ContactUsPage';
import T7_CookiePolicy from '@/dynamic-components/template7/cookie-policy/CookiePolicyPage';
import T7_Disclaimer from '@/dynamic-components/template7/disclaimer/DisclaimerPage';
import T7_Faq from '@/dynamic-components/template7/faq/FaqPage';
import T7_PrivacyPolicy from '@/dynamic-components/template7/privacy-policy/PrivacyPolicyPage';
import T7_ResponsibleGambling from '@/dynamic-components/template7/responsible-gambling/ResponsibleGamblingPage';
import T7_TermsOfUse from '@/dynamic-components/template7/terms-of-use/TermsOfUsePage';
import T7_Announcements from '@/dynamic-components/template7/announcements/AnnouncementsPage';
import T7_BettingManagement from '@/dynamic-components/template7/dashboard/BettingManagementPage';
import T7_Coupons from '@/dynamic-components/template7/dashboard/CouponsPage';
import T7_DashboardCustomerInquiry from '@/dynamic-components/template7/dashboard/CustomerInquiryPage';
import T7_Deposit from '@/dynamic-components/template7/dashboard/DepositPage';
import T7_Exchange from '@/dynamic-components/template7/dashboard/ExchangePage';
import T7_Faqs from '@/dynamic-components/template7/dashboard/FaqsPage';
import T7_Note from '@/dynamic-components/template7/dashboard/NotePage';
import T7_Points from '@/dynamic-components/template7/dashboard/PointsPage';
import T7_Profile from '@/dynamic-components/template7/dashboard/ProfilePage';
import T7_Referrals from '@/dynamic-components/template7/dashboard/ReferralsPage';
import T7_Withdrawal from '@/dynamic-components/template7/dashboard/WithdrawalPage';

// Template 8 imports
import T8_Home from '@/dynamic-components/template8/home/HomePage';
import T8_SlotProviders from '@/dynamic-components/template8/slot-providers/SlotProvidersPage';
import T8_Slots from '@/dynamic-components/template8/slots/SlotsPage';
import T8_LiveCasino from '@/dynamic-components/template8/live-casino/LiveCasinoPage';
import T8_About from '@/dynamic-components/template8/about/AboutPage';
import T8_Contact from '@/dynamic-components/template8/contact-us/ContactUsPage';
import T8_CookiePolicy from '@/dynamic-components/template8/cookie-policy/CookiePolicyPage';
import T8_Disclaimer from '@/dynamic-components/template8/disclaimer/DisclaimerPage';
import T8_Faq from '@/dynamic-components/template8/faq/FaqPage';
import T8_PrivacyPolicy from '@/dynamic-components/template8/privacy-policy/PrivacyPolicyPage';
import T8_ResponsibleGambling from '@/dynamic-components/template8/responsible-gambling/ResponsibleGamblingPage';
import T8_TermsOfUse from '@/dynamic-components/template8/terms-of-use/TermsOfUsePage';
import T8_Announcements from '@/dynamic-components/template8/announcements/AnnouncementsPage';
import T8_BettingManagement from '@/dynamic-components/template8/dashboard/BettingManagementPage';
import T8_Coupons from '@/dynamic-components/template8/dashboard/CouponsPage';
import T8_DashboardCustomerInquiry from '@/dynamic-components/template8/dashboard/CustomerInquiryPage';
import T8_Deposit from '@/dynamic-components/template8/dashboard/DepositPage';
import T8_Exchange from '@/dynamic-components/template8/dashboard/ExchangePage';
import T8_Faqs from '@/dynamic-components/template8/dashboard/FaqsPage';
import T8_Note from '@/dynamic-components/template8/dashboard/NotePage';
import T8_Points from '@/dynamic-components/template8/dashboard/PointsPage';
import T8_Profile from '@/dynamic-components/template8/dashboard/ProfilePage';
import T8_Referrals from '@/dynamic-components/template8/dashboard/ReferralsPage';
import T8_Withdrawal from '@/dynamic-components/template8/dashboard/WithdrawalPage';

// Template 9 imports
import T9_Home from '@/dynamic-components/template9/home/HomePage';
import T9_Slots from '@/dynamic-components/template9/slots/SlotsPage';
import T9_LiveCasino from '@/dynamic-components/template9/live-casino/LiveCasinoPage';
import T9_About from '@/dynamic-components/template9/about/AboutPage';
import T9_Contact from '@/dynamic-components/template9/contact-us/ContactUsPage';
import T9_CookiePolicy from '@/dynamic-components/template9/cookie-policy/CookiePolicyPage';
import T9_Disclaimer from '@/dynamic-components/template9/disclaimer/DisclaimerPage';
import T9_Faq from '@/dynamic-components/template9/faq/FaqPage';
import T9_PrivacyPolicy from '@/dynamic-components/template9/privacy-policy/PrivacyPolicyPage';
import T9_ResponsibleGambling from '@/dynamic-components/template9/responsible-gambling/ResponsibleGamblingPage';
import T9_TermsOfUse from '@/dynamic-components/template9/terms-of-use/TermsOfUsePage';
import T9_Announcements from '@/dynamic-components/template9/announcements/AnnouncementsPage';
import T9_SlotProviders from '@/dynamic-components/template9/slot-providers/SlotProvidersPage';
import T9_BettingManagement from '@/dynamic-components/template9/dashboard/BettingManagementPage';
import T9_Coupons from '@/dynamic-components/template9/dashboard/CouponsPage';
import T9_DashboardCustomerInquiry from '@/dynamic-components/template9/dashboard/CustomerInquiryPage';
import T9_Deposit from '@/dynamic-components/template9/dashboard/DepositPage';
import T9_Exchange from '@/dynamic-components/template9/dashboard/ExchangePage';
import T9_Faqs from '@/dynamic-components/template9/dashboard/FaqsPage';
import T9_Note from '@/dynamic-components/template9/dashboard/NotePage';
import T9_Points from '@/dynamic-components/template9/dashboard/PointsPage';
import T9_Profile from '@/dynamic-components/template9/dashboard/ProfilePage';
import T9_Referrals from '@/dynamic-components/template9/dashboard/ReferralsPage';
import T9_Withdrawal from '@/dynamic-components/template9/dashboard/WithdrawalPage';

// Template 10 imports
import T10_Home from '@/dynamic-components/template10/home/HomePage';
import T10_Slots from '@/dynamic-components/template10/slots/SlotsPage';
import T10_LiveCasino from '@/dynamic-components/template10/live-casino/LiveCasinoPage';
import T10_About from '@/dynamic-components/template10/about/AboutPage';
import T10_Contact from '@/dynamic-components/template10/contact-us/ContactUsPage';
import T10_CookiePolicy from '@/dynamic-components/template10/cookie-policy/CookiePolicyPage';
import T10_Disclaimer from '@/dynamic-components/template10/disclaimer/DisclaimerPage';
import T10_Faq from '@/dynamic-components/template10/faq/FaqPage';
import T10_PrivacyPolicy from '@/dynamic-components/template10/privacy-policy/PrivacyPolicyPage';
import T10_ResponsibleGambling from '@/dynamic-components/template10/responsible-gambling/ResponsibleGamblingPage';
import T10_TermsOfUse from '@/dynamic-components/template10/terms-of-use/TermsOfUsePage';
import T10_Announcements from '@/dynamic-components/template10/announcements/AnnouncementsPage';
import T10_SlotProviders from '@/dynamic-components/template10/slot-providers/SlotProvidersPage';
import T10_BettingManagement from '@/dynamic-components/template10/dashboard/BettingManagementPage';
import T10_Coupons from '@/dynamic-components/template10/dashboard/CouponsPage';
import T10_DashboardCustomerInquiry from '@/dynamic-components/template10/dashboard/CustomerInquiryPage';
import T10_Deposit from '@/dynamic-components/template10/dashboard/DepositPage';
import T10_Exchange from '@/dynamic-components/template10/dashboard/ExchangePage';
import T10_Faqs from '@/dynamic-components/template10/dashboard/FaqsPage';
import T10_Note from '@/dynamic-components/template10/dashboard/NotePage';
import T10_Points from '@/dynamic-components/template10/dashboard/PointsPage';
import T10_Profile from '@/dynamic-components/template10/dashboard/ProfilePage';
import T10_Referrals from '@/dynamic-components/template10/dashboard/ReferralsPage';
import T10_Withdrawal from '@/dynamic-components/template10/dashboard/WithdrawalPage';

// Template 11 imports
import T11_Home from '@/dynamic-components/template11/home/HomePage';
import T11_SlotProviders from '@/dynamic-components/template11/slot-providers/SlotProvidersPage';
import T11_Slots from '@/dynamic-components/template11/slots/SlotsPage';
import T11_LiveCasino from '@/dynamic-components/template11/live-casino/LiveCasinoPage';
import T11_About from '@/dynamic-components/template11/about/AboutPage';
import T11_Contact from '@/dynamic-components/template11/contact-us/ContactUsPage';
import T11_CookiePolicy from '@/dynamic-components/template11/cookie-policy/CookiePolicyPage';
import T11_Disclaimer from '@/dynamic-components/template11/disclaimer/DisclaimerPage';
import T11_Faq from '@/dynamic-components/template11/faq/FaqPage';
import T11_PrivacyPolicy from '@/dynamic-components/template11/privacy-policy/PrivacyPolicyPage';
import T11_ResponsibleGambling from '@/dynamic-components/template11/responsible-gambling/ResponsibleGamblingPage';
import T11_TermsOfUse from '@/dynamic-components/template11/terms-of-use/TermsOfUsePage';

// Template 12 imports
import T12_Home from '@/dynamic-components/template12/home/HomePage';
import T12_Slots from '@/dynamic-components/template12/slots/SlotsPage';
import T12_LiveCasino from '@/dynamic-components/template12/live-casino/LiveCasinoPage';
import T12_About from '@/dynamic-components/template12/about/AboutPage';
import T12_Contact from '@/dynamic-components/template12/contact-us/ContactUsPage';
import T12_CookiePolicy from '@/dynamic-components/template12/cookie-policy/CookiePolicyPage';
import T12_Disclaimer from '@/dynamic-components/template12/disclaimer/DisclaimerPage';
import T12_Faq from '@/dynamic-components/template12/faq/FaqPage';
import T12_PrivacyPolicy from '@/dynamic-components/template12/privacy-policy/PrivacyPolicyPage';
import T12_ResponsibleGambling from '@/dynamic-components/template12/responsible-gambling/ResponsibleGamblingPage';
import T12_TermsOfUse from '@/dynamic-components/template12/terms-of-use/TermsOfUsePage';
import T12_SlotProviders from '@/dynamic-components/template12/slot-providers/SlotProvidersPage';
import T12_Promotions from '@/dynamic-components/template12/promotions/PromotionsPage';
import T12_Sports from '@/dynamic-components/template12/sports/SportsPage';
import T12_SportsGames from '@/dynamic-components/template12/sports-games/SportsGamesPage';

// Template 13 imports
import T13_Home from '@/dynamic-components/template13/home/HomePage';
import T13_Slots from '@/dynamic-components/template13/slots/SlotsPage';
import T13_LiveCasino from '@/dynamic-components/template13/live-casino/LiveCasinoPage';
import T13_About from '@/dynamic-components/template13/about/AboutPage';
import T13_Contact from '@/dynamic-components/template13/contact-us/ContactUsPage';
import T13_CookiePolicy from '@/dynamic-components/template13/cookie-policy/CookiePolicyPage';
import T13_Disclaimer from '@/dynamic-components/template13/disclaimer/DisclaimerPage';
import T13_Faq from '@/dynamic-components/template13/faq/FaqPage';
import T13_PrivacyPolicy from '@/dynamic-components/template13/privacy-policy/PrivacyPolicyPage';
import T13_ResponsibleGambling from '@/dynamic-components/template13/responsible-gambling/ResponsibleGamblingPage';
import T13_TermsOfUse from '@/dynamic-components/template13/terms-of-use/TermsOfUsePage';
import T13_Announcements from '@/dynamic-components/template13/announcements/AnnouncementsPage';
import T13_SlotProviders from '@/dynamic-components/template13/slot-providers/SlotProvidersPage';
import T13_BettingManagement from '@/dynamic-components/template13/dashboard/BettingManagementPage';
import T13_Coupons from '@/dynamic-components/template13/dashboard/CouponsPage';
import T13_DashboardCustomerInquiry from '@/dynamic-components/template13/dashboard/CustomerInquiryPage';
import T13_Deposit from '@/dynamic-components/template13/dashboard/DepositPage';
import T13_Exchange from '@/dynamic-components/template13/dashboard/ExchangePage';
import T13_Faqs from '@/dynamic-components/template13/dashboard/FaqsPage';
import T13_Note from '@/dynamic-components/template13/dashboard/NotePage';
import T13_Points from '@/dynamic-components/template13/dashboard/PointsPage';
import T13_Profile from '@/dynamic-components/template13/dashboard/ProfilePage';
import T13_Referrals from '@/dynamic-components/template13/dashboard/ReferralsPage';
import T13_Withdrawal from '@/dynamic-components/template13/dashboard/WithdrawalPage';
import T13_Promotions from '@/dynamic-components/template13/promotions/PromotionsPage';
import T13_Sports from '@/dynamic-components/template13/sports/SportsPage';
import T13_SportsGames from '@/dynamic-components/template13/sports-games/SportsGamesPage';

// Template 14 imports
import T14_Home from '@/dynamic-components/template14/home/HomePage';
import T14_Slots from '@/dynamic-components/template14/slots/SlotsPage';
import T14_LiveCasino from '@/dynamic-components/template14/live-casino/LiveCasinoPage';
import T14_About from '@/dynamic-components/template14/about/AboutPage';
import T14_Contact from '@/dynamic-components/template14/contact-us/ContactUsPage';
import T14_CookiePolicy from '@/dynamic-components/template14/cookie-policy/CookiePolicyPage';
import T14_Disclaimer from '@/dynamic-components/template14/disclaimer/DisclaimerPage';
import T14_Faq from '@/dynamic-components/template14/faq/FaqPage';
import T14_PrivacyPolicy from '@/dynamic-components/template14/privacy-policy/PrivacyPolicyPage';
import T14_ResponsibleGambling from '@/dynamic-components/template14/responsible-gambling/ResponsibleGamblingPage';
import T14_TermsOfUse from '@/dynamic-components/template14/terms-of-use/TermsOfUsePage';
import T14_Announcements from '@/dynamic-components/template14/announcements/AnnouncementsPage';
import T14_SlotProviders from '@/dynamic-components/template14/slot-providers/SlotProvidersPage';
import T14_BettingManagement from '@/dynamic-components/template14/dashboard/BettingManagementPage';
import T14_Coupons from '@/dynamic-components/template14/dashboard/CouponsPage';
import T14_DashboardCustomerInquiry from '@/dynamic-components/template14/dashboard/CustomerInquiryPage';
import T14_Deposit from '@/dynamic-components/template14/dashboard/DepositPage';
import T14_Exchange from '@/dynamic-components/template14/dashboard/ExchangePage';
import T14_Faqs from '@/dynamic-components/template14/dashboard/FaqsPage';
import T14_Note from '@/dynamic-components/template14/dashboard/NotePage';
import T14_Points from '@/dynamic-components/template14/dashboard/PointsPage';
import T14_Profile from '@/dynamic-components/template14/dashboard/ProfilePage';
import T14_Referrals from '@/dynamic-components/template14/dashboard/ReferralsPage';
import T14_Withdrawal from '@/dynamic-components/template14/dashboard/WithdrawalPage';
import T14_Promotions from '@/dynamic-components/template14/promotions/PromotionsPage';
import T14_Sports from '@/dynamic-components/template14/sports/SportsPage';
import T14_SportsGames from '@/dynamic-components/template14/sports-games/SportsGamesPage';

// Template 15 imports
import T15_Home from '@/dynamic-components/template15/home/HomePage';
import T15_Slots from '@/dynamic-components/template15/slots/SlotsPage';
import T15_LiveCasino from '@/dynamic-components/template15/live-casino/LiveCasinoPage';
import T15_About from '@/dynamic-components/template15/about/AboutPage';
import T15_Contact from '@/dynamic-components/template15/contact-us/ContactUsPage';
import T15_CookiePolicy from '@/dynamic-components/template15/cookie-policy/CookiePolicyPage';
import T15_Disclaimer from '@/dynamic-components/template15/disclaimer/DisclaimerPage';
import T15_Faq from '@/dynamic-components/template15/faq/FaqPage';
import T15_PrivacyPolicy from '@/dynamic-components/template15/privacy-policy/PrivacyPolicyPage';
import T15_ResponsibleGambling from '@/dynamic-components/template15/responsible-gambling/ResponsibleGamblingPage';
import T15_TermsOfUse from '@/dynamic-components/template15/terms-of-use/TermsOfUsePage';
import T15_SlotProviders from '@/dynamic-components/template15/slot-providers/SlotProvidersPage';

// Template 16 imports
import T16_Home from '@/dynamic-components/template16/home/HomePage';
import T16_Slots from '@/dynamic-components/template16/slots/SlotsPage';
import T16_LiveCasino from '@/dynamic-components/template16/live-casino/LiveCasinoPage';
import T16_About from '@/dynamic-components/template16/about/AboutPage';
import T16_Contact from '@/dynamic-components/template16/contact-us/ContactUsPage';
import T16_CookiePolicy from '@/dynamic-components/template16/cookie-policy/CookiePolicyPage';
import T16_Disclaimer from '@/dynamic-components/template16/disclaimer/DisclaimerPage';
import T16_Faq from '@/dynamic-components/template16/faq/FaqPage';
import T16_PrivacyPolicy from '@/dynamic-components/template16/privacy-policy/PrivacyPolicyPage';
import T16_ResponsibleGambling from '@/dynamic-components/template16/responsible-gambling/ResponsibleGamblingPage';
import T16_TermsOfUse from '@/dynamic-components/template16/terms-of-use/TermsOfUsePage';
import T16_SlotProviders from '@/dynamic-components/template16/slot-providers/SlotProvidersPage';
import T16_Promotions from '@/dynamic-components/template16/promotions/PromotionsPage';
import T16_Deposit from '@/dynamic-components/template16/dashboard/DepositPage';
import T16_Withdrawal from '@/dynamic-components/template16/dashboard/WithdrawalPage';
import T16_Coupons from '@/dynamic-components/template16/dashboard/CouponsPage';
import T16_CustomerInquiry from '@/dynamic-components/template16/dashboard/CustomerInquiryPage';
import T16_Points from '@/dynamic-components/template16/dashboard/PointsPage';
import T16_Profile from '@/dynamic-components/template16/dashboard/ProfilePage';
import T16_Referrals from '@/dynamic-components/template16/dashboard/ReferralsPage';
import T16_Register from '@/dynamic-components/template16/register/RegisterPage';
import T16_Transaction from '@/dynamic-components/template16/transaction/TransactionPage';
import T16_Announcements from '@/dynamic-components/template16/announcements/AnnouncementsPage';
import T16_BettingManagement from '@/dynamic-components/template16/dashboard/BettingManagementPage';
import T16_Exchange from '@/dynamic-components/template16/dashboard/ExchangePage';
import T16_Note from '@/dynamic-components/template16/dashboard/NotePage';

// Template 17 imports
import T17_Home from '@/dynamic-components/template17/home/HomePage';
import T17_Slots from '@/dynamic-components/template17/slots/SlotsPage';
import T17_LiveCasino from '@/dynamic-components/template17/live-casino/LiveCasinoPage';
import T17_Promotions from '@/dynamic-components/template17/promotions/PromotionsPage';
import T17_About from '@/dynamic-components/template17/about/AboutPage';
import T17_Contact from '@/dynamic-components/template17/contact-us/ContactUsPage';
import T17_CookiePolicy from '@/dynamic-components/template17/cookie-policy/CookiePolicyPage';
import T17_Disclaimer from '@/dynamic-components/template17/disclaimer/DisclaimerPage';
import T17_Faq from '@/dynamic-components/template17/faq/FaqPage';
import T17_PrivacyPolicy from '@/dynamic-components/template17/privacy-policy/PrivacyPolicyPage';
import T17_ResponsibleGambling from '@/dynamic-components/template17/responsible-gambling/ResponsibleGamblingPage';
import T17_TermsOfUse from '@/dynamic-components/template17/terms-of-use/TermsOfUsePage';
import T17_Announcements from '@/dynamic-components/template17/announcements/AnnouncementsPage';
import T17_SlotProviders from '@/dynamic-components/template17/slot-providers/SlotProvidersPage';
import T17_Sports from '@/dynamic-components/template17/sports/SportsPage';
import T17_BettingManagement from '@/dynamic-components/template17/dashboard/BettingManagementPage';
import T17_Coupons from '@/dynamic-components/template17/dashboard/CouponsPage';
import T17_CustomerInquiry from '@/dynamic-components/template17/dashboard/CustomerInquiryPage';
import T17_DashboardHome from '@/dynamic-components/template17/dashboard/DashboardHomePage';
import T17_Deposit from '@/dynamic-components/template17/dashboard/DepositPage';
import T17_Exchange from '@/dynamic-components/template17/dashboard/ExchangePage';
import T17_Note from '@/dynamic-components/template17/dashboard/NotePage';
import T17_Points from '@/dynamic-components/template17/dashboard/PointsPage';
import T17_Profile from '@/dynamic-components/template17/dashboard/ProfilePage';
import T17_Referrals from '@/dynamic-components/template17/dashboard/ReferralsPage';
import T17_Withdrawal from '@/dynamic-components/template17/dashboard/WithdrawalPage';
import T17_Register from '@/dynamic-components/template17/register/RegisterPage';
import T17_Transaction from '@/dynamic-components/template17/transaction/TransactionPage';
import T17_HowToPlay from '@/dynamic-components/template17/how-to-play/HowToPlayPage';

// Template 18 imports
import T18_Home from '@/dynamic-components/template18/home/HomePage';
import T18_Slots from '@/dynamic-components/template18/slots/SlotsPage';
import T18_LiveCasino from '@/dynamic-components/template18/live-casino/LiveCasinoPage';
import T18_About from '@/dynamic-components/template18/about/AboutPage';
import T18_Contact from '@/dynamic-components/template18/contact-us/ContactUsPage';
import T18_CookiePolicy from '@/dynamic-components/template18/cookie-policy/CookiePolicyPage';
import T18_Disclaimer from '@/dynamic-components/template18/disclaimer/DisclaimerPage';
import T18_Faq from '@/dynamic-components/template18/faq/FaqPage';
import T18_PrivacyPolicy from '@/dynamic-components/template18/privacy-policy/PrivacyPolicyPage';
import T18_ResponsibleGambling from '@/dynamic-components/template18/responsible-gambling/ResponsibleGamblingPage';
import T18_TermsOfUse from '@/dynamic-components/template18/terms-of-use/TermsOfUsePage';
import T18_SlotProviders from '@/dynamic-components/template18/slot-providers/SlotProvidersPage';

// Template 19 imports
import T19_Home from '@/dynamic-components/template19/home/HomePage';
import T19_Slots from '@/dynamic-components/template19/slots/SlotsPage';
import T19_LiveCasino from '@/dynamic-components/template19/live-casino/LiveCasinoPage';
import T19_About from '@/dynamic-components/template19/about/AboutPage';
import T19_Contact from '@/dynamic-components/template19/contact-us/ContactUsPage';
import T19_CookiePolicy from '@/dynamic-components/template19/cookie-policy/CookiePolicyPage';
import T19_Disclaimer from '@/dynamic-components/template19/disclaimer/DisclaimerPage';
import T19_Faq from '@/dynamic-components/template19/faq/FaqPage';
import T19_PrivacyPolicy from '@/dynamic-components/template19/privacy-policy/PrivacyPolicyPage';
import T19_ResponsibleGambling from '@/dynamic-components/template19/responsible-gambling/ResponsibleGamblingPage';
import T19_TermsOfUse from '@/dynamic-components/template19/terms-of-use/TermsOfUsePage';
import T19_SlotProviders from '@/dynamic-components/template19/slot-providers/SlotProvidersPage';

// Template 20 imports
import T20_Home from '@/dynamic-components/template20/home/HomePage';
import T20_Slots from '@/dynamic-components/template20/slots/SlotsPage';
import T20_LiveCasino from '@/dynamic-components/template20/live-casino/LiveCasinoPage';
import T20_About from '@/dynamic-components/template20/about/AboutPage';
import T20_Contact from '@/dynamic-components/template20/contact-us/ContactUsPage';
import T20_CookiePolicy from '@/dynamic-components/template20/cookie-policy/CookiePolicyPage';
import T20_Disclaimer from '@/dynamic-components/template20/disclaimer/DisclaimerPage';
import T20_Faq from '@/dynamic-components/template20/faq/FaqPage';
import T20_PrivacyPolicy from '@/dynamic-components/template20/privacy-policy/PrivacyPolicyPage';
import T20_ResponsibleGambling from '@/dynamic-components/template20/responsible-gambling/ResponsibleGamblingPage';
import T20_TermsOfUse from '@/dynamic-components/template20/terms-of-use/TermsOfUsePage';
import T20_SlotProviders from '@/dynamic-components/template20/slot-providers/SlotProvidersPage';

// Template 21 imports
import T21_Home from '@/dynamic-components/template21/home/HomePage';
import T21_Slots from '@/dynamic-components/template21/slots/SlotsPage';
import T21_LiveCasino from '@/dynamic-components/template21/live-casino/LiveCasinoPage';
import T21_Promotions from '@/dynamic-components/template21/promotions/PromotionsPage';
import T21_About from '@/dynamic-components/template21/about/AboutPage';
import T21_Contact from '@/dynamic-components/template21/contact-us/ContactUsPage';
import T21_CookiePolicy from '@/dynamic-components/template21/cookie-policy/CookiePolicyPage';
import T21_Disclaimer from '@/dynamic-components/template21/disclaimer/DisclaimerPage';
import T21_Faq from '@/dynamic-components/template21/faq/FaqPage';
import T21_PrivacyPolicy from '@/dynamic-components/template21/privacy-policy/PrivacyPolicyPage';
import T21_ResponsibleGambling from '@/dynamic-components/template21/responsible-gambling/ResponsibleGamblingPage';
import T21_TermsOfUse from '@/dynamic-components/template21/terms-of-use/TermsOfUsePage';
import T21_Announcements from '@/dynamic-components/template21/announcements/AnnouncementsPage';
import T21_SlotProviders from '@/dynamic-components/template21/slot-providers/SlotProvidersPage';
import T21_BettingManagement from '@/dynamic-components/template21/dashboard/BettingManagementPage';
import T21_Coupons from '@/dynamic-components/template21/dashboard/CouponsPage';
import T21_DashboardCustomerInquiry from '@/dynamic-components/template21/dashboard/CustomerInquiryPage';
import T21_DashboardHome from '@/dynamic-components/template21/dashboard/DashboardHomePage';
import T21_Deposit from '@/dynamic-components/template21/dashboard/DepositPage';
import T21_Exchange from '@/dynamic-components/template21/dashboard/ExchangePage';
import T21_Note from '@/dynamic-components/template21/dashboard/NotePage';
import T21_Points from '@/dynamic-components/template21/dashboard/PointsPage';
import T21_Profile from '@/dynamic-components/template21/dashboard/ProfilePage';
import T21_Referrals from '@/dynamic-components/template21/dashboard/ReferralsPage';
import T21_Withdrawal from '@/dynamic-components/template21/dashboard/WithdrawalPage';
import T21_Register from '@/dynamic-components/template21/register/RegisterPage';
import T21_Transaction from '@/dynamic-components/template21/transaction/TransactionPage';
import T21_HowToPlay from '@/dynamic-components/template21/how-to-play/HowToPlayPage';
import T21_Sports from '@/dynamic-components/template21/sports/SportsPage';

// Template 22 imports
import T22_Home from '@/dynamic-components/template22/home/HomePage';
import T22_Slots from '@/dynamic-components/template22/slots/SlotsPage';
import T22_LiveCasino from '@/dynamic-components/template22/live-casino/LiveCasinoPage';
import T22_About from '@/dynamic-components/template22/about/AboutPage';
import T22_Contact from '@/dynamic-components/template22/contact-us/ContactUsPage';
import T22_CookiePolicy from '@/dynamic-components/template22/cookie-policy/CookiePolicyPage';
import T22_Disclaimer from '@/dynamic-components/template22/disclaimer/DisclaimerPage';
import T22_Faq from '@/dynamic-components/template22/faq/FaqPage';
import T22_PrivacyPolicy from '@/dynamic-components/template22/privacy-policy/PrivacyPolicyPage';
import T22_ResponsibleGambling from '@/dynamic-components/template22/responsible-gambling/ResponsibleGamblingPage';
import T22_TermsOfUse from '@/dynamic-components/template22/terms-of-use/TermsOfUsePage';
import T22_Announcements from '@/dynamic-components/template22/announcements/AnnouncementsPage';
import T22_SlotProviders from '@/dynamic-components/template22/slot-providers/SlotProvidersPage';
import T22_BettingManagement from '@/dynamic-components/template22/dashboard/BettingManagementPage';
import T22_Coupons from '@/dynamic-components/template22/dashboard/CouponsPage';
import T22_DashboardCustomerInquiry from '@/dynamic-components/template22/dashboard/CustomerInquiryPage';
import T22_DashboardHome from '@/dynamic-components/template22/dashboard/DashboardHomePage';
import T22_Deposit from '@/dynamic-components/template22/dashboard/DepositPage';
import T22_Exchange from '@/dynamic-components/template22/dashboard/ExchangePage';
import T22_Note from '@/dynamic-components/template22/dashboard/NotePage';
import T22_Points from '@/dynamic-components/template22/dashboard/PointsPage';
import T22_Profile from '@/dynamic-components/template22/dashboard/ProfilePage';
import T22_Referrals from '@/dynamic-components/template22/dashboard/ReferralsPage';
import T22_Withdrawal from '@/dynamic-components/template22/dashboard/WithdrawalPage';
import T22_Register from '@/dynamic-components/template22/register/RegisterPage';
import T22_Transaction from '@/dynamic-components/template22/transaction/TransactionPage';
import T22_HowToPlay from '@/dynamic-components/template22/how-to-play/HowToPlayPage';
import T22_Sports from '@/dynamic-components/template22/sports/SportsPage';
import T22_Promotions from '@/dynamic-components/template22/promotions/PromotionsPage';

const ACTIVE_TEMPLATE = process.env.NEXT_PUBLIC_TEMPLATE || 'template1';

// Per-template page maps. Add new templates by appending a new entry.
const PAGE_COMPONENTS_MAP_T1 = {
  home: T1_Home,
  slots: T1_Slots,
  'live-casino': T1_LiveCasino,
  about: T1_About,
  'contact-us': T1_Contact,
  'cookie-policy': T1_CookiePolicy,
  disclaimer: T1_Disclaimer,
  faq: T1_Faq,
  'privacy-policy': T1_PrivacyPolicy,
  'responsible-gambling': T1_ResponsibleGambling,
  'terms-of-use': T1_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T2 = {
  home: T2_Home,
  'slot-providers': T2_SlotProviders,
  slots: T2_Slots,
  'live-casino': T2_LiveCasino,
  about: T2_About,
  'contact-us': T2_Contact,
  'cookie-policy': T2_CookiePolicy,
  disclaimer: T2_Disclaimer,
  faq: T2_Faq,
  'privacy-policy': T2_PrivacyPolicy,
  'responsible-gambling': T2_ResponsibleGambling,
  'terms-of-use': T2_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T3 = {
  home: T3_Home,
  'slot-providers': T3_SlotProviders,
  slots: T3_Slots,
  'live-casino': T3_LiveCasino,
  about: T3_About,
  'contact-us': T3_Contact,
  'cookie-policy': T3_CookiePolicy,
  disclaimer: T3_Disclaimer,
  faq: T3_Faq,
  'privacy-policy': T3_PrivacyPolicy,
  'responsible-gambling': T3_ResponsibleGambling,
  'terms-of-use': T3_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T4 = {
  home: T4_Home,
  'slot-providers': T4_SlotProviders,
  slots: T4_Slots,
  'live-casino': T4_LiveCasino,
  about: T4_About,
  'contact-us': T4_Contact,
  'cookie-policy': T4_CookiePolicy,
  disclaimer: T4_Disclaimer,
  faq: T4_Faq,
  'privacy-policy': T4_PrivacyPolicy,
  'responsible-gambling': T4_ResponsibleGambling,
  'terms-of-use': T4_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T5 = {
  home: T5_Home,
  'slot-providers': T5_SlotProviders,
  slots: T5_Slots,
  'live-casino': T5_LiveCasino,
  about: T5_About,
  'contact-us': T5_Contact,
  'cookie-policy': T5_CookiePolicy,
  disclaimer: T5_Disclaimer,
  faq: T5_Faq,
  'privacy-policy': T5_PrivacyPolicy,
  'responsible-gambling': T5_ResponsibleGambling,
  'terms-of-use': T5_TermsOfUse,
  announcements: T5_Announcements,
  'betting-management': T5_BettingManagement,
  coupons: T5_Coupons,
  'dashboard-customer-inquiry': T5_DashboardCustomerInquiry,
  deposit: T5_Deposit,
  exchange: T5_Exchange,
  faqs: T5_Faqs,
  note: T5_Note,
  points: T5_Points,
  profile: T5_Profile,
  referrals: T5_Referrals,
  withdrawal: T5_Withdrawal,
};

const PAGE_COMPONENTS_MAP_T6 = {
  home: T6_Home,
  'slot-providers': T6_SlotProviders,
  slots: T6_Slots,
  'live-casino': T6_LiveCasino,
  about: T6_About,
  'contact-us': T6_Contact,
  'cookie-policy': T6_CookiePolicy,
  disclaimer: T6_Disclaimer,
  faq: T6_Faq,
  'privacy-policy': T6_PrivacyPolicy,
  'responsible-gambling': T6_ResponsibleGambling,
  'terms-of-use': T6_TermsOfUse,
  announcements: T6_Announcements,
  'betting-management': T6_BettingManagement,
  coupons: T6_Coupons,
  'dashboard-customer-inquiry': T6_DashboardCustomerInquiry,
  deposit: T6_Deposit,
  exchange: T6_Exchange,
  faqs: T6_Faqs,
  note: T6_Note,
  points: T6_Points,
  profile: T6_Profile,
  referrals: T6_Referrals,
  withdrawal: T6_Withdrawal,
};

const PAGE_COMPONENTS_MAP_T7 = {
  home: T7_Home,
  'slot-providers': T7_SlotProviders,
  slots: T7_Slots,
  'live-casino': T7_LiveCasino,
  about: T7_About,
  'contact-us': T7_Contact,
  'cookie-policy': T7_CookiePolicy,
  disclaimer: T7_Disclaimer,
  faq: T7_Faq,
  'privacy-policy': T7_PrivacyPolicy,
  'responsible-gambling': T7_ResponsibleGambling,
  'terms-of-use': T7_TermsOfUse,
  announcements: T7_Announcements,
  'betting-management': T7_BettingManagement,
  coupons: T7_Coupons,
  'dashboard-customer-inquiry': T7_DashboardCustomerInquiry,
  deposit: T7_Deposit,
  exchange: T7_Exchange,
  faqs: T7_Faqs,
  note: T7_Note,
  points: T7_Points,
  profile: T7_Profile,
  referrals: T7_Referrals,
  withdrawal: T7_Withdrawal,
};

const PAGE_COMPONENTS_MAP_T8 = {
  home: T8_Home,
  'slot-providers': T8_SlotProviders,
  slots: T8_Slots,
  'live-casino': T8_LiveCasino,
  about: T8_About,
  'contact-us': T8_Contact,
  'cookie-policy': T8_CookiePolicy,
  disclaimer: T8_Disclaimer,
  faq: T8_Faq,
  'privacy-policy': T8_PrivacyPolicy,
  'responsible-gambling': T8_ResponsibleGambling,
  'terms-of-use': T8_TermsOfUse,
  announcements: T8_Announcements,
  'betting-management': T8_BettingManagement,
  coupons: T8_Coupons,
  'dashboard-customer-inquiry': T8_DashboardCustomerInquiry,
  deposit: T8_Deposit,
  exchange: T8_Exchange,
  faqs: T8_Faqs,
  note: T8_Note,
  points: T8_Points,
  profile: T8_Profile,
  referrals: T8_Referrals,
  withdrawal: T8_Withdrawal,
};

const PAGE_COMPONENTS_MAP_T9 = {
  home: T9_Home,
  'slot-providers': T9_SlotProviders,
  slots: T9_Slots,
  'live-casino': T9_LiveCasino,
  about: T9_About,
  'contact-us': T9_Contact,
  'cookie-policy': T9_CookiePolicy,
  disclaimer: T9_Disclaimer,
  faq: T9_Faq,
  'privacy-policy': T9_PrivacyPolicy,
  'responsible-gambling': T9_ResponsibleGambling,
  'terms-of-use': T9_TermsOfUse,
  announcements: T9_Announcements,
  'betting-management': T9_BettingManagement,
  coupons: T9_Coupons,
  'dashboard-customer-inquiry': T9_DashboardCustomerInquiry,
  deposit: T9_Deposit,
  exchange: T9_Exchange,
  faqs: T9_Faqs,
  note: T9_Note,
  points: T9_Points,
  profile: T9_Profile,
  referrals: T9_Referrals,
  withdrawal: T9_Withdrawal,
};

const PAGE_COMPONENTS_MAP_T10 = {
  home: T10_Home,
  'slot-providers': T10_SlotProviders,
  slots: T10_Slots,
  'live-casino': T10_LiveCasino,
  about: T10_About,
  'contact-us': T10_Contact,
  'cookie-policy': T10_CookiePolicy,
  disclaimer: T10_Disclaimer,
  faq: T10_Faq,
  'privacy-policy': T10_PrivacyPolicy,
  'responsible-gambling': T10_ResponsibleGambling,
  'terms-of-use': T10_TermsOfUse,
  announcements: T10_Announcements,
  'betting-management': T10_BettingManagement,
  coupons: T10_Coupons,
  'dashboard-customer-inquiry': T10_DashboardCustomerInquiry,
  deposit: T10_Deposit,
  exchange: T10_Exchange,
  faqs: T10_Faqs,
  note: T10_Note,
  points: T10_Points,
  profile: T10_Profile,
  referrals: T10_Referrals,
  withdrawal: T10_Withdrawal,
};

const PAGE_COMPONENTS_MAP_T11 = {
  home: T11_Home,
  'slot-providers': T11_SlotProviders,
  slots: T11_Slots,
  'live-casino': T11_LiveCasino,
  about: T11_About,
  'contact-us': T11_Contact,
  'cookie-policy': T11_CookiePolicy,
  disclaimer: T11_Disclaimer,
  faq: T11_Faq,
  'privacy-policy': T11_PrivacyPolicy,
  'responsible-gambling': T11_ResponsibleGambling,
  'terms-of-use': T11_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T12 = {
  home: T12_Home,
  'slot-providers': T12_SlotProviders,
  slots: T12_Slots,
  'live-casino': T12_LiveCasino,
  sports: T12_Sports,
  'sports-games': T12_SportsGames,
  promotions: T12_Promotions,
  about: T12_About,
  'contact-us': T12_Contact,
  'cookie-policy': T12_CookiePolicy,
  disclaimer: T12_Disclaimer,
  faq: T12_Faq,
  'privacy-policy': T12_PrivacyPolicy,
  'responsible-gambling': T12_ResponsibleGambling,
  'terms-of-use': T12_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T13 = {
  home: T13_Home,
  'slot-providers': T13_SlotProviders,
  slots: T13_Slots,
  'live-casino': T13_LiveCasino,
  about: T13_About,
  'contact-us': T13_Contact,
  'cookie-policy': T13_CookiePolicy,
  disclaimer: T13_Disclaimer,
  faq: T13_Faq,
  'privacy-policy': T13_PrivacyPolicy,
  'responsible-gambling': T13_ResponsibleGambling,
  'terms-of-use': T13_TermsOfUse,
  announcements: T13_Announcements,
  'betting-management': T13_BettingManagement,
  coupons: T13_Coupons,
  'dashboard-customer-inquiry': T13_DashboardCustomerInquiry,
  deposit: T13_Deposit,
  exchange: T13_Exchange,
  faqs: T13_Faqs,
  note: T13_Note,
  points: T13_Points,
  profile: T13_Profile,
  referrals: T13_Referrals,
  withdrawal: T13_Withdrawal,
  promotions: T13_Promotions,
  sports: T13_Sports,
  'sports-games': T13_SportsGames,
};

const PAGE_COMPONENTS_MAP_T14 = {
  home: T14_Home,
  'slot-providers': T14_SlotProviders,
  slots: T14_Slots,
  'live-casino': T14_LiveCasino,
  about: T14_About,
  'contact-us': T14_Contact,
  'cookie-policy': T14_CookiePolicy,
  disclaimer: T14_Disclaimer,
  faq: T14_Faq,
  'privacy-policy': T14_PrivacyPolicy,
  'responsible-gambling': T14_ResponsibleGambling,
  'terms-of-use': T14_TermsOfUse,
  announcements: T14_Announcements,
  'betting-management': T14_BettingManagement,
  coupons: T14_Coupons,
  'dashboard-customer-inquiry': T14_DashboardCustomerInquiry,
  deposit: T14_Deposit,
  exchange: T14_Exchange,
  faqs: T14_Faqs,
  note: T14_Note,
  points: T14_Points,
  profile: T14_Profile,
  referrals: T14_Referrals,
  withdrawal: T14_Withdrawal,
  promotions: T14_Promotions,
  sports: T14_Sports,
  'sports-games': T14_SportsGames,
};

const PAGE_COMPONENTS_MAP_T15 = {
  home: T15_Home,
  'slot-providers': T15_SlotProviders,
  slots: T15_Slots,
  'live-casino': T15_LiveCasino,
  about: T15_About,
  'contact-us': T15_Contact,
  'cookie-policy': T15_CookiePolicy,
  disclaimer: T15_Disclaimer,
  faq: T15_Faq,
  'privacy-policy': T15_PrivacyPolicy,
  'responsible-gambling': T15_ResponsibleGambling,
  'terms-of-use': T15_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T16 = {
  home: T16_Home,
  'slot-providers': T16_SlotProviders,
  slots: T16_Slots,
  'live-casino': T16_LiveCasino,
  promotions: T16_Promotions,
  about: T16_About,
  'contact-us': T16_Contact,
  'cookie-policy': T16_CookiePolicy,
  disclaimer: T16_Disclaimer,
  faq: T16_Faq,
  'privacy-policy': T16_PrivacyPolicy,
  'responsible-gambling': T16_ResponsibleGambling,
  'terms-of-use': T16_TermsOfUse,
  announcements: T16_Announcements,
  deposit: T16_Deposit,
  withdrawal: T16_Withdrawal,
  coupons: T16_Coupons,
  'dashboard-customer-inquiry': T16_CustomerInquiry,
  profile: T16_Profile,
  referrals: T16_Referrals,
  points: T16_Points,
  register: T16_Register,
  transaction: T16_Transaction,
  'betting-management': T16_BettingManagement,
  exchange: T16_Exchange,
  note: T16_Note,
};

const PAGE_COMPONENTS_MAP_T17 = {
  home: T17_Home,
  'slot-providers': T17_SlotProviders,
  slots: T17_Slots,
  'live-casino': T17_LiveCasino,
  promotions: T17_Promotions,
  sports: T17_Sports,
  'dashboard-promotion': T17_Promotions,
  about: T17_About,
  'contact-us': T17_Contact,
  'cookie-policy': T17_CookiePolicy,
  disclaimer: T17_Disclaimer,
  faq: T17_Faq,
  'how-to-play': T17_HowToPlay,
  'privacy-policy': T17_PrivacyPolicy,
  'responsible-gambling': T17_ResponsibleGambling,
  'terms-of-use': T17_TermsOfUse,
  announcements: T17_Announcements,
  'dashboard-home': T17_DashboardHome,
  deposit: T17_Deposit,
  withdrawal: T17_Withdrawal,
  coupons: T17_Coupons,
  'dashboard-customer-inquiry': T17_CustomerInquiry,
  profile: T17_Profile,
  referrals: T17_Referrals,
  points: T17_Points,
  register: T17_Register,
  transaction: T17_Transaction,
  'betting-management': T17_BettingManagement,
  exchange: T17_Exchange,
  note: T17_Note,
};

const PAGE_COMPONENTS_MAP_T18 = {
  home: T18_Home,
  'slot-providers': T18_SlotProviders,
  slots: T18_Slots,
  'live-casino': T18_LiveCasino,
  about: T18_About,
  'contact-us': T18_Contact,
  'cookie-policy': T18_CookiePolicy,
  disclaimer: T18_Disclaimer,
  faq: T18_Faq,
  'privacy-policy': T18_PrivacyPolicy,
  'responsible-gambling': T18_ResponsibleGambling,
  'terms-of-use': T18_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T19 = {
  home: T19_Home,
  'slot-providers': T19_SlotProviders,
  slots: T19_Slots,
  'live-casino': T19_LiveCasino,
  about: T19_About,
  'contact-us': T19_Contact,
  'cookie-policy': T19_CookiePolicy,
  disclaimer: T19_Disclaimer,
  faq: T19_Faq,
  'privacy-policy': T19_PrivacyPolicy,
  'responsible-gambling': T19_ResponsibleGambling,
  'terms-of-use': T19_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T20 = {
  home: T20_Home,
  'slot-providers': T20_SlotProviders,
  slots: T20_Slots,
  'live-casino': T20_LiveCasino,
  about: T20_About,
  'contact-us': T20_Contact,
  'cookie-policy': T20_CookiePolicy,
  disclaimer: T20_Disclaimer,
  faq: T20_Faq,
  'privacy-policy': T20_PrivacyPolicy,
  'responsible-gambling': T20_ResponsibleGambling,
  'terms-of-use': T20_TermsOfUse,
};

const PAGE_COMPONENTS_MAP_T21 = {
  home: T21_Home,
  'slot-providers': T21_SlotProviders,
  slots: T21_Slots,
  'live-casino': T21_LiveCasino,
  sports: T21_Sports,
  promotions: T21_Promotions,
  'dashboard-promotion': T21_Promotions,
  about: T21_About,
  'contact-us': T21_Contact,
  'cookie-policy': T21_CookiePolicy,
  disclaimer: T21_Disclaimer,
  faq: T21_Faq,
  'how-to-play': T21_HowToPlay,
  'privacy-policy': T21_PrivacyPolicy,
  'responsible-gambling': T21_ResponsibleGambling,
  'terms-of-use': T21_TermsOfUse,
  announcements: T21_Announcements,
  'dashboard-home': T21_DashboardHome,
  deposit: T21_Deposit,
  withdrawal: T21_Withdrawal,
  coupons: T21_Coupons,
  'dashboard-customer-inquiry': T21_DashboardCustomerInquiry,
  profile: T21_Profile,
  referrals: T21_Referrals,
  points: T21_Points,
  register: T21_Register,
  transaction: T21_Transaction,
  'betting-management': T21_BettingManagement,
  exchange: T21_Exchange,
  note: T21_Note,
};

const PAGE_COMPONENTS_MAP_T22 = {
  home: T22_Home,
  'slot-providers': T22_SlotProviders,
  slots: T22_Slots,
  'live-casino': T22_LiveCasino,
  sports: T22_Sports,
  promotions: T22_Promotions,
  'dashboard-promotion': T22_Promotions,
  about: T22_About,
  'contact-us': T22_Contact,
  'cookie-policy': T22_CookiePolicy,
  disclaimer: T22_Disclaimer,
  faq: T22_Faq,
  'how-to-play': T22_HowToPlay,
  'privacy-policy': T22_PrivacyPolicy,
  'responsible-gambling': T22_ResponsibleGambling,
  'terms-of-use': T22_TermsOfUse,
  announcements: T22_Announcements,
  'dashboard-home': T22_DashboardHome,
  deposit: T22_Deposit,
  withdrawal: T22_Withdrawal,
  coupons: T22_Coupons,
  'dashboard-customer-inquiry': T22_DashboardCustomerInquiry,
  profile: T22_Profile,
  referrals: T22_Referrals,
  points: T22_Points,
  register: T22_Register,
  transaction: T22_Transaction,
  'betting-management': T22_BettingManagement,
  exchange: T22_Exchange,
  note: T22_Note,
};

const TEMPLATE_PAGES_REGISTRY = {
  template1: PAGE_COMPONENTS_MAP_T1,
  template2: PAGE_COMPONENTS_MAP_T2,
  template3: PAGE_COMPONENTS_MAP_T3,
  template4: PAGE_COMPONENTS_MAP_T4,
  template5: PAGE_COMPONENTS_MAP_T5,
  template6: PAGE_COMPONENTS_MAP_T6,
  template7: PAGE_COMPONENTS_MAP_T7,
  template8: PAGE_COMPONENTS_MAP_T8,
  template9: PAGE_COMPONENTS_MAP_T9,
  template10: PAGE_COMPONENTS_MAP_T10,
  template11: PAGE_COMPONENTS_MAP_T11,
  template12: PAGE_COMPONENTS_MAP_T12,
  template13: PAGE_COMPONENTS_MAP_T13,
  template14: PAGE_COMPONENTS_MAP_T14,
  template15: PAGE_COMPONENTS_MAP_T15,
  template16: PAGE_COMPONENTS_MAP_T16,
  template17: PAGE_COMPONENTS_MAP_T17,
  template18: PAGE_COMPONENTS_MAP_T18,
  template19: PAGE_COMPONENTS_MAP_T19,
  template20: PAGE_COMPONENTS_MAP_T20,
  template21: PAGE_COMPONENTS_MAP_T21,
  template22: PAGE_COMPONENTS_MAP_T22,
};

export function resolveStaticPageComponent(pageKey) {
  const map =
    TEMPLATE_PAGES_REGISTRY[ACTIVE_TEMPLATE] ||
    TEMPLATE_PAGES_REGISTRY.template1;
  return map?.[pageKey] || null;
}
