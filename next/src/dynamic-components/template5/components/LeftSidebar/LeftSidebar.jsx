'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

const LeftSidebar = memo(function LeftSidebar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const activeFill = (href) => (isActive(href) ? 'fill-[#20C5FE]' : '');
  const activeStroke = (href) => (isActive(href) ? 'stroke-[#20C5FE]' : '');

  const handleNavigation = (e, href) => {
    // Allow Home navigation without auth check
    if (href === '/' || href === '/announcements') {
      return; // Let the Link component handle navigation
    }

    // For dashboard routes, check authentication
    if (href.startsWith('/dashboard/')) {
      e.preventDefault();
      if (!isAuth) {
        dispatch(openModal('login'));
      } else {
        router.push(href);
      }
    }
  };

  const navItems = [
    { href: '/', key: 'home' },
    { href: '/dashboard/deposit', key: 'deposit' },
    { href: '/dashboard/withdrawal', key: 'withdrawal' },
    { href: '/dashboard/coupons', key: 'coupons' },
    { href: '/dashboard/customer-inquiry', key: 'customer_inquiry' },
    { href: '/dashboard/note', key: 'notes' },
    { href: '/announcements', key: 'announcement' },
    { href: '/dashboard/faqs', key: 'faq' },
  ];

  return (
    <motion.aside
      className="template5-left-sidebar hidden h-full w-64 flex-shrink-0 overflow-hidden border-r border-[#00374A] bg-[#00111A] lg:block lg:w-64 xl:w-64"
      initial={{ opacity: 0, x: -20 }}
      animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.1,
      }}
      style={{ willChange: 'opacity, transform' }}
      layout
    >
      <div className="flex h-full flex-col p-4">
        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2">
          {/* Home */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.2,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/"
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  className="h-5 w-5 transition-all duration-300"
                >
                  <path
                    d="M8.47259 2.41092L1.8828 7.68276V15.0624H6.58979V11.2968H10.3554V15.0624H15.0624V8.13557C15.0624 7.99439 15.0307 7.85501 14.9696 7.72774C14.9085 7.60047 14.8196 7.48857 14.7094 7.40034L8.47259 2.41092ZM8.47259 0L15.8852 5.93081C16.2157 6.19523 16.4826 6.53057 16.6661 6.91204C16.8496 7.2935 16.9449 7.71133 16.9452 8.13463V15.0624C16.9452 15.5617 16.7468 16.0406 16.3937 16.3937C16.0406 16.7468 15.5617 16.9452 15.0624 16.9452H1.8828C1.38345 16.9452 0.904552 16.7468 0.551459 16.3937C0.198366 16.0406 0 15.5617 0 15.0624V7.68276C3.52061e-05 7.40056 0.0635055 7.12197 0.185718 6.86761C0.30793 6.61325 0.485757 6.38961 0.706049 6.21323L8.47259 0Z"
                    fill="#7D7D7D"
                    className={`transition-all duration-300 group-hover:fill-[#20C5FE] ${activeFill('/')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('home') || 'Home'}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/')}`}
                />
              </svg>
            </Link>
          </motion.div>

          {/* Deposit */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.25,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/dashboard/deposit"
              onClick={(e) => handleNavigation(e, '/dashboard/deposit')}
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/dashboard/deposit')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                  className="h-5 w-5 transition-all duration-300"
                >
                  <path
                    d="M21.5 8.9C21.5 5.18615 21.5 3.3287 20.3944 2.08865C20.2163 1.88944 20.0213 1.70606 19.8116 1.54055C18.4949 0.5 16.523 0.5 12.575 0.5H9.425C5.47805 0.5 3.5051 0.5 2.18735 1.5395C1.97665 1.7075 1.78275 1.89055 1.60565 2.08865C0.5 3.32765 0.5 5.18615 0.5 8.9C0.5 12.6138 0.5 14.4713 1.60565 15.7113C1.78275 15.9101 1.97665 16.0928 2.18735 16.2594C3.5051 17.3 5.47805 17.3 9.425 17.3H11"
                    stroke="#7D7D7D"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/deposit')}`}
                  />
                  <path
                    d="M0.5 5.74998H21.5"
                    stroke="#7D7D7D"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/deposit')}`}
                  />
                  <path
                    d="M16.6094 20.2591C16.6094 20.5352 16.8332 20.7591 17.1094 20.7591C17.3855 20.7591 17.6094 20.5352 17.6094 20.2591L17.1094 20.2591L16.6094 20.2591ZM17.4629 11.3146C17.2677 11.1194 16.9511 11.1194 16.7558 11.3146L13.5738 14.4966C13.3786 14.6919 13.3786 15.0085 13.5738 15.2037C13.7691 15.399 14.0857 15.399 14.2809 15.2037L17.1094 12.3753L19.9378 15.2037C20.1331 15.399 20.4496 15.399 20.6449 15.2037C20.8402 15.0085 20.8402 14.6919 20.6449 14.4966L17.4629 11.3146ZM17.1094 20.2591L17.6094 20.2591L17.6094 11.6682L17.1094 11.6682L16.6094 11.6682L16.6094 20.2591L17.1094 20.2591Z"
                    fill="#7D7D7D"
                    className={`transition-all duration-300 group-hover:fill-[#20C5FE] ${activeFill('/dashboard/deposit')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/dashboard/deposit') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('deposit') || 'Deposit'}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/deposit')}`}
                />
              </svg>
            </Link>
          </motion.div>

          {/* Withdrawal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.3,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/dashboard/withdrawal"
              onClick={(e) => handleNavigation(e, '/dashboard/withdrawal')}
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/dashboard/withdrawal')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                  className="h-5 w-5 transition-all duration-300"
                >
                  <path
                    d="M21.5 8.9C21.5 5.18615 21.5 3.3287 20.3943 2.08865C20.2163 1.88944 20.0213 1.70606 19.8116 1.54055C18.4949 0.5 16.523 0.5 12.575 0.5H9.425C5.47805 0.5 3.5051 0.5 2.18735 1.5395C1.97665 1.7075 1.78275 1.89055 1.60565 2.08865C0.5 3.32765 0.5 5.18615 0.5 8.9C0.5 12.6138 0.5 14.4713 1.60565 15.7113C1.78275 15.9101 1.97665 16.0929 2.18735 16.2595C3.5051 17.3 5.47805 17.3 9.425 17.3H11"
                    stroke="#7D7D7D"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/withdrawal')}`}
                  />
                  <path
                    d="M0.5 5.75H21.5"
                    stroke="#7D7D7D"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/withdrawal')}`}
                  />
                  <path
                    d="M17.6094 11.6682C17.6094 11.392 17.3855 11.1682 17.1094 11.1682C16.8332 11.1682 16.6094 11.392 16.6094 11.6682L17.1094 11.6682L17.6094 11.6682ZM16.7558 20.6126C16.9511 20.8079 17.2677 20.8079 17.4629 20.6126L20.6449 17.4307C20.8402 17.2354 20.8402 16.9188 20.6449 16.7236C20.4496 16.5283 20.1331 16.5283 19.9378 16.7236L17.1094 19.552L14.2809 16.7236C14.0857 16.5283 13.7691 16.5283 13.5738 16.7236C13.3786 16.9188 13.3786 17.2354 13.5738 17.4307L16.7558 20.6126ZM17.1094 11.6682L16.6094 11.6682V20.2591L17.1094 20.2591L17.6094 20.2591V11.6682L17.1094 11.6682Z"
                    fill="#7D7D7D"
                    className={`transition-all duration-300 group-hover:fill-[#20C5FE] ${activeFill('/dashboard/withdrawal')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/dashboard/withdrawal') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('withdrawal') || 'Withdrawal'}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/withdrawal')}`}
                />
              </svg>
            </Link>
          </motion.div>

          {/* Points/Coupons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.35,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/dashboard/coupons"
              onClick={(e) => handleNavigation(e, '/dashboard/coupons')}
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/dashboard/coupons')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="21"
                  viewBox="0 0 23 21"
                  fill="none"
                  className="h-5 w-5 transition-colors duration-300 group-hover:text-[#20C5FE]"
                >
                  <path
                    d="M21 8.9C21 9.17614 21.2239 9.4 21.5 9.4C21.7761 9.4 22 9.17614 22 8.9H21.5H21ZM20.3944 2.08865L20.7675 1.7559L20.7672 1.75546L20.3944 2.08865ZM19.8116 1.54055L19.5016 1.93284L19.5019 1.93306L19.8116 1.54055ZM2.18735 1.5395L1.87768 1.14693L1.87564 1.14856L2.18735 1.5395ZM1.60565 2.08865L1.23289 1.75541L1.23259 1.75574L1.60565 2.08865ZM1.60565 15.7113L1.97899 15.3788L1.97885 15.3786L1.60565 15.7113ZM2.18735 16.2594L1.87723 16.6517L1.87749 16.6519L2.18735 16.2594ZM11 17.8C11.2761 17.8 11.5 17.5761 11.5 17.3C11.5 17.0239 11.2761 16.8 11 16.8V17.3V17.8ZM21.1853 17.9185C21.3809 17.7236 21.3814 17.407 21.1865 17.2114C20.9915 17.0158 20.6749 17.0153 20.4794 17.2103L20.8323 17.5644L21.1853 17.9185ZM13 14.1146C12.9994 13.8385 12.7751 13.6151 12.4989 13.6157C12.2228 13.6163 11.9994 13.8407 12 14.1168L12.5 14.1157L13 14.1146ZM19.9534 19.9489C19.8872 20.217 20.0509 20.488 20.319 20.5541C20.5871 20.6203 20.8581 20.4565 20.9243 20.1884L20.4388 20.0687L19.9534 19.9489ZM20.9242 18.1017L20.4403 17.9755L20.4387 17.9819L20.9242 18.1017ZM20.426 17.2955L20.3047 17.7806C20.3106 17.782 20.3165 17.7834 20.3224 17.7846L20.426 17.2955ZM18.5803 16.3187C18.3124 16.2517 18.0409 16.4146 17.9739 16.6825C17.9069 16.9504 18.0698 17.2218 18.3377 17.2888L18.459 16.8037L18.5803 16.3187ZM13.4516 11.4272C13.2561 11.6221 13.2556 11.9387 13.4506 12.1343C13.6456 12.3298 13.9622 12.3303 14.1577 12.1353L13.8047 11.7812L13.4516 11.4272ZM21.6376 15.2309C21.6382 15.5071 21.8625 15.7305 22.1386 15.7299C22.4148 15.7293 22.6382 15.505 22.6376 15.2289L22.1376 15.2299L21.6376 15.2309ZM14.6832 9.39676C14.7494 9.12866 14.5857 8.85769 14.3175 8.79154C14.0494 8.72539 13.7785 8.8891 13.7123 9.15721L14.1978 9.27698L14.6832 9.39676ZM13.7124 11.244L14.1964 11.3696L14.1979 11.3638L13.7124 11.244ZM14.2112 12.0501L14.3325 11.5651C14.3266 11.5636 14.3207 11.5623 14.3148 11.561L14.2112 12.0501ZM16.0563 13.027C16.3242 13.094 16.5957 12.9311 16.6627 12.6632C16.7297 12.3953 16.5668 12.1238 16.2989 12.0568L16.1776 12.5419L16.0563 13.027ZM21.5 8.9H22C22 7.05629 22.001 5.62595 21.8578 4.50339C21.7128 3.367 21.4136 2.48044 20.7675 1.7559L20.3944 2.08865L20.0212 2.4214C20.4808 2.93691 20.7343 3.5991 20.8658 4.62991C20.999 5.67455 21 7.02986 21 8.9H21.5ZM20.3944 2.08865L20.7672 1.75546C20.5699 1.5347 20.3538 1.33146 20.1213 1.14804L19.8116 1.54055L19.5019 1.93306C19.6889 2.08065 19.8628 2.24419 20.0215 2.42184L20.3944 2.08865ZM19.8116 1.54055L20.1216 1.14826C19.3592 0.545766 18.4311 0.268253 17.2362 0.133231C16.0505 -0.000749528 14.5373 0 12.575 0V0.5V1C14.5607 1 16.0074 1.00075 17.1239 1.12691C18.2311 1.25202 18.9473 1.49478 19.5016 1.93284L19.8116 1.54055ZM12.575 0.5V0H9.425V0.5V1H12.575V0.5ZM9.425 0.5V0C7.46325 0 5.95005 -0.000747502 4.76415 0.133092C3.56908 0.267967 2.64054 0.545158 1.87768 1.14694L2.18735 1.5395L2.49702 1.93206C3.05191 1.49434 3.76872 1.25178 4.8763 1.12678C5.99305 1.00075 7.4398 1 9.425 1V0.5ZM2.18735 1.5395L1.87564 1.14856C1.64332 1.3338 1.42895 1.5361 1.23289 1.75541L1.60565 2.08865L1.97841 2.42189C2.13655 2.245 2.30998 2.0812 2.49906 1.93044L2.18735 1.5395ZM1.60565 2.08865L1.23259 1.75574C0.58642 2.47985 0.287154 3.36655 0.142223 4.503C-0.000950873 5.62569 0 7.05629 0 8.9H0.5H1C1 7.02986 1.00095 5.67428 1.13419 4.62951C1.26567 3.5985 1.51923 2.93645 1.97871 2.42156L1.60565 2.08865ZM0.5 8.9H0C0 10.7437 -0.000951111 12.174 0.142224 13.2966C0.287163 14.433 0.586437 15.3196 1.23245 16.0441L1.60565 15.7113L1.97885 15.3786C1.51921 14.8631 1.26566 14.2009 1.13419 13.1701C1.00095 12.1254 1 10.7701 1 8.9H0.5ZM1.60565 15.7113L1.23231 16.0439C1.42888 16.2646 1.64397 16.4672 1.87723 16.6517L2.18735 16.2594L2.49747 15.8672C2.30933 15.7185 2.13662 15.5557 1.97899 15.3788L1.60565 15.7113ZM2.18735 16.2594L1.87749 16.6519C2.64036 17.2543 3.56895 17.5318 4.7641 17.6668C5.95003 17.8007 7.46326 17.8 9.425 17.8V17.3V16.8C7.43979 16.8 5.99307 16.7992 4.87635 16.6731C3.76885 16.548 3.05209 16.3052 2.49721 15.867L2.18735 16.2594ZM9.425 17.3V17.8H11V17.3V16.8H9.425V17.3ZM0.5 5.74999V6.24999H21.5V5.74999V5.24999H0.5V5.74999ZM20.8323 17.5644L20.4794 17.2103C19.8662 17.8214 19.0859 18.2374 18.2367 18.4057L18.3339 18.8962L18.4311 19.3866C19.474 19.1799 20.4323 18.6691 21.1853 17.9185L20.8323 17.5644ZM18.3339 18.8962L18.2367 18.4057C17.3875 18.574 16.5075 18.4872 15.7076 18.1561L15.5164 18.6181L15.3252 19.0801C16.3075 19.4867 17.3882 19.5933 18.4311 19.3866L18.3339 18.8962ZM15.5164 18.6181L15.7076 18.1561C14.9077 17.825 14.2237 17.2646 13.7419 16.5453L13.3265 16.8236L12.9111 17.1019C13.5028 17.9852 14.3428 18.6735 15.3252 19.0801L15.5164 18.6181ZM13.3265 16.8236L13.7419 16.5453C13.26 15.8261 13.0019 14.9804 13 14.1146L12.5 14.1157L12 14.1168C12.0023 15.18 12.3193 16.2187 12.9111 17.1019L13.3265 16.8236ZM20.4388 20.0687L20.9243 20.1884L21.4096 18.2214L20.9242 18.1017L20.4387 17.9819L19.9534 19.9489L20.4388 20.0687ZM20.9242 18.1017L21.408 18.2278C21.4474 18.0767 21.4557 17.9191 21.4325 17.7647L20.9381 17.839L20.4436 17.9133C20.4467 17.9341 20.4456 17.9552 20.4403 17.9755L20.9242 18.1017ZM20.9381 17.839L21.4325 17.7647C21.4093 17.6102 21.355 17.462 21.2729 17.3292L20.8475 17.592L20.4222 17.8548C20.4332 17.8727 20.4405 17.8926 20.4436 17.9133L20.9381 17.839ZM20.8475 17.592L21.2729 17.3292C21.1908 17.1963 21.0826 17.0815 20.9548 16.9916L20.6671 17.4006L20.3795 17.8095C20.3966 17.8216 20.4112 17.837 20.4222 17.8548L20.8475 17.592ZM20.6671 17.4006L20.9548 16.9916C20.827 16.9017 20.6824 16.8387 20.5296 16.8063L20.426 17.2955L20.3224 17.7846C20.3429 17.789 20.3623 17.7975 20.3795 17.8095L20.6671 17.4006ZM20.426 17.2955L20.5473 16.8104L18.5803 16.3187L18.459 16.8037L18.3377 17.2888L20.3047 17.7806L20.426 17.2955ZM13.8047 11.7812L14.1577 12.1353C14.7708 11.524 15.5512 11.1078 16.4005 10.9394L16.3032 10.449L16.206 9.95851C15.163 10.1654 14.2046 10.6764 13.4516 11.4272L13.8047 11.7812ZM16.3032 10.449L16.4005 10.9394C17.2498 10.771 18.1299 10.8578 18.9299 11.1889L19.1211 10.7269L19.3123 10.2649C18.3298 9.85828 17.249 9.75167 16.206 9.95851L16.3032 10.449ZM19.1211 10.7269L18.9299 11.1889C19.7299 11.52 20.414 12.0805 20.8959 12.7999L21.3113 12.5216L21.7267 12.2433C21.1349 11.3599 20.2948 10.6715 19.3123 10.2649L19.1211 10.7269ZM21.3113 12.5216L20.8959 12.7999C21.3777 13.5192 21.6358 14.3651 21.6376 15.2309L22.1376 15.2299L22.6376 15.2289C22.6354 14.1656 22.3185 13.1267 21.7267 12.2433L21.3113 12.5216ZM14.1978 9.27698L13.7123 9.15721L13.227 11.1242L13.7124 11.244L14.1979 11.3638L14.6832 9.39676L14.1978 9.27698ZM13.7124 11.244L13.2285 11.1184C13.1892 11.2695 13.181 11.427 13.2044 11.5815L13.6988 11.5067L14.1932 11.432C14.19 11.4112 14.1911 11.39 14.1964 11.3696L13.7124 11.244ZM13.6988 11.5067L13.2044 11.5815C13.2277 11.7359 13.2821 11.8839 13.3643 12.0167L13.7895 11.7537L14.2147 11.4906C14.2036 11.4727 14.1963 11.4528 14.1932 11.432L13.6988 11.5067ZM13.7895 11.7537L13.3643 12.0167C13.4464 12.1495 13.5547 12.2643 13.6824 12.3541L13.97 11.9451L14.2575 11.5361C14.2403 11.524 14.2258 11.5085 14.2147 11.4906L13.7895 11.7537ZM13.97 11.9451L13.6824 12.3541C13.8102 12.4439 13.9548 12.5069 14.1076 12.5393L14.2112 12.0501L14.3148 11.561C14.2942 11.5566 14.2748 11.5482 14.2575 11.5361L13.97 11.9451ZM14.2112 12.0501L14.0899 12.5352L16.0563 13.027L16.1776 12.5419L16.2989 12.0568L14.3325 11.5651L14.2112 12.0501Z"
                    fill="#7D7D7D"
                    className={`transition-all duration-300 group-hover:fill-[#20C5FE] ${activeFill('/dashboard/coupons')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/dashboard/coupons') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('coupons') || 'Coupons'}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/coupons')}`}
                />
              </svg>
            </Link>
          </motion.div>

          {/* Customer Inquiry */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.4,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/dashboard/customer-inquiry"
              onClick={(e) =>
                handleNavigation(e, '/dashboard/customer-inquiry')
              }
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/dashboard/customer-inquiry')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  className="h-5 w-5 transition-all duration-300"
                >
                  <path
                    d="M15.7504 10.555C15.7504 10.209 15.7504 10.036 15.8024 9.882C15.9534 9.434 16.3524 9.261 16.7524 9.079C17.2004 8.874 17.4244 8.772 17.6474 8.754C17.8994 8.734 18.1524 8.788 18.3684 8.909C18.6544 9.069 18.8544 9.375 19.0584 9.623C20.0014 10.769 20.4734 11.342 20.6454 11.973C20.7854 12.483 20.7854 13.017 20.6454 13.526C20.3944 14.448 19.5994 15.22 19.0104 15.936C18.7094 16.301 18.5584 16.484 18.3684 16.591C18.1487 16.7128 17.8978 16.7668 17.6474 16.746C17.4244 16.728 17.2004 16.626 16.7514 16.421C16.3514 16.239 15.9534 16.066 15.8024 15.618C15.7504 15.464 15.7504 15.291 15.7504 14.946V10.555ZM5.7504 10.555C5.7504 10.119 5.7384 9.728 5.3864 9.422C5.2584 9.311 5.0884 9.234 4.7494 9.079C4.3004 8.875 4.0764 8.772 3.8534 8.754C3.1864 8.7 2.8274 9.156 2.4434 9.624C1.4994 10.769 1.0274 11.342 0.854396 11.974C0.715201 12.4823 0.715201 13.0187 0.854396 13.527C1.1064 14.448 1.9024 15.221 2.4904 15.936C2.8614 16.386 3.2164 16.797 3.8534 16.746C4.0764 16.728 4.3004 16.626 4.7494 16.421C5.0894 16.267 5.2584 16.189 5.3864 16.078C5.7384 15.772 5.7504 15.381 5.7504 14.946V10.555Z"
                    stroke="#7D7D7D"
                    strokeWidth="1.5"
                    className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/customer-inquiry')}`}
                  />
                  <path
                    d="M18.75 9.25V7.75C18.75 3.884 15.168 0.75 10.75 0.75C6.332 0.75 2.75 3.884 2.75 7.75V9.25M18.75 16.25C18.75 20.75 14.75 20.75 10.75 20.75"
                    stroke="#7D7D7D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/customer-inquiry')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/dashboard/customer-inquiry') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('customer_inquiry') || 'Customer Inq'}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/customer-inquiry')}`}
                />
              </svg>
            </Link>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.45,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/dashboard/note"
              onClick={(e) => handleNavigation(e, '/dashboard/note')}
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/dashboard/note')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5 transition-all duration-300"
                >
                  <path
                    d="M0.75 18.04V2.75C0.75 2.21957 0.960714 1.71086 1.33579 1.33579C1.71086 0.960714 2.21957 0.75 2.75 0.75H16.75C17.2804 0.75 17.7891 0.960714 18.1642 1.33579C18.5393 1.71086 18.75 2.21957 18.75 2.75V12.75C18.75 13.2804 18.5393 13.7891 18.1642 14.1642C17.7891 14.5393 17.2804 14.75 16.75 14.75H5.711C5.41123 14.75 5.11531 14.8175 4.84511 14.9473C4.57491 15.0771 4.33735 15.266 4.15 15.5L1.819 18.414C1.74143 18.5112 1.63556 18.5819 1.51604 18.6164C1.39652 18.6508 1.26926 18.6472 1.15186 18.6061C1.03446 18.565 0.932729 18.4885 0.860735 18.3871C0.788741 18.2857 0.750045 18.1644 0.75 18.04Z"
                    stroke="#7D7D7D"
                    strokeWidth="1.5"
                    className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/note')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/dashboard/note') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('notes') || 'Notes'}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/note')}`}
                />
              </svg>
            </Link>
          </motion.div>

          {/* Announcement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.5,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/announcements"
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/announcements')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="23"
                  viewBox="0 0 18 23"
                  fill="none"
                  className="h-5 w-5 transition-all duration-300"
                >
                  <path
                    d="M0 19.125V16.875H2.25V9C2.25 7.44375 2.71875 6.06113 3.65625 4.85213C4.59375 3.64313 5.8125 2.85075 7.3125 2.475V1.6875C7.3125 1.21875 7.47675 0.820503 7.80525 0.492752C8.13375 0.165002 8.532 0.000752557 9 2.55682e-06C9.468 -0.000747443 9.86662 0.163502 10.1959 0.492752C10.5251 0.822003 10.689 1.22025 10.6875 1.6875V2.475C12.1875 2.85 13.4062 3.64238 14.3438 4.85213C15.2812 6.06188 15.75 7.4445 15.75 9V16.875H18V19.125H0ZM9 22.5C8.38125 22.5 7.85175 22.2799 7.4115 21.8396C6.97125 21.3994 6.75075 20.8695 6.75 20.25H11.25C11.25 20.8688 11.0299 21.3986 10.5896 21.8396C10.1494 22.2806 9.6195 22.5008 9 22.5ZM4.5 16.875H13.5V9C13.5 7.7625 13.0594 6.70313 12.1781 5.82188C11.2969 4.94063 10.2375 4.5 9 4.5C7.7625 4.5 6.70313 4.94063 5.82188 5.82188C4.94063 6.70313 4.5 7.7625 4.5 9V16.875Z"
                    fill="#7D7D7D"
                    className={`transition-all duration-300 group-hover:fill-[#20C5FE] ${activeFill('/announcements')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/announcements') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('announcement') || 'Announcement'}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/announcements')}`}
                />
              </svg>
            </Link>
          </motion.div>

          {/* FAQ's */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.55,
            }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Link
              href="/dashboard/faqs"
              onClick={(e) => handleNavigation(e, '/dashboard/faqs')}
              className={`group flex items-center justify-between rounded-[5px] border px-3 py-4 transition-all duration-300 hover:border-[#20C5FE] hover:bg-[#1A1F2A] ${
                isActive('/dashboard/faqs')
                  ? 'border-[#20C5FE] bg-[#1A1F2A]'
                  : 'border-[#00374A] bg-[#0F131C]'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="26"
                  viewBox="0 0 24 26"
                  fill="none"
                  className="h-5 w-5 transition-all duration-300"
                >
                  <path
                    d="M11.6667 0C18.1102 0 23.3333 5.22317 23.3333 11.6667C23.3333 18.1102 18.1102 23.3333 11.6667 23.3333C5.22317 23.3333 0 18.1102 0 11.6667C0 5.22317 5.22317 0 11.6667 0ZM11.6667 2.33333C9.19131 2.33333 6.81734 3.31666 5.067 5.067C3.31666 6.81734 2.33333 9.19131 2.33333 11.6667C2.33333 14.142 3.31666 16.516 5.067 18.2663C6.81734 20.0167 9.19131 21 11.6667 21C14.142 21 16.516 20.0167 18.2663 18.2663C20.0167 16.516 21 14.142 21 11.6667C21 9.19131 20.0167 6.81734 18.2663 5.067C16.516 3.31666 14.142 2.33333 11.6667 2.33333ZM11.6667 16.3333C11.9761 16.3333 12.2728 16.4562 12.4916 16.675C12.7104 16.8938 12.8333 17.1906 12.8333 17.5C12.8333 17.8094 12.7104 18.1062 12.4916 18.325C12.2728 18.5438 11.9761 18.6667 11.6667 18.6667C11.3572 18.6667 11.0605 18.5438 10.8417 18.325C10.6229 18.1062 10.5 17.8094 10.5 17.5C10.5 17.1906 10.6229 16.8938 10.8417 16.675C11.0605 16.4562 11.3572 16.3333 11.6667 16.3333ZM11.6667 5.25C12.6493 5.25003 13.6013 5.59225 14.3591 6.21787C15.1169 6.84349 15.6331 7.71346 15.8192 8.67834C16.0053 9.64322 15.8495 10.6428 15.3788 11.5053C14.908 12.3679 14.1515 13.0396 13.2393 13.405C13.1042 13.4547 12.9824 13.5349 12.8835 13.6395C12.8322 13.6978 12.824 13.7725 12.8252 13.8495L12.8333 14C12.833 14.2974 12.7191 14.5834 12.515 14.7996C12.3109 15.0158 12.0319 15.1459 11.735 15.1634C11.4382 15.1808 11.1459 15.0842 10.9179 14.8934C10.6898 14.7025 10.5433 14.4318 10.5082 14.1365L10.5 14V13.7083C10.5 12.3632 11.585 11.5558 12.3713 11.2397C12.6914 11.1119 12.9705 10.8993 13.1789 10.6248C13.3872 10.3503 13.5169 10.0243 13.5539 9.68165C13.5909 9.33904 13.5339 8.99282 13.3889 8.68016C13.244 8.36751 13.0167 8.10024 12.7313 7.90706C12.4459 7.71387 12.1133 7.60207 11.7692 7.58365C11.4251 7.56523 11.0825 7.64089 10.7781 7.80252C10.4738 7.96414 10.2192 8.20561 10.0417 8.50101C9.86426 8.7964 9.77061 9.13456 9.77083 9.47917C9.77083 9.78859 9.64792 10.0853 9.42912 10.3041C9.21033 10.5229 8.91359 10.6458 8.60417 10.6458C8.29475 10.6458 7.998 10.5229 7.77921 10.3041C7.56042 10.0853 7.4375 9.78859 7.4375 9.47917C7.4375 8.35752 7.88307 7.28182 8.6762 6.48869C9.46932 5.69557 10.545 5.25 11.6667 5.25Z"
                    fill="#7D7D7D"
                    className={`transition-all duration-300 group-hover:fill-[#20C5FE] ${activeFill('/dashboard/faqs')}`}
                  />
                </svg>
                <span
                  className={`${isActive('/dashboard/faqs') ? 'text-white' : 'text-[#7D7D7D]'} truncate font-medium whitespace-nowrap transition-colors duration-300 group-hover:text-white`}
                >
                  {t('faq') || "FAQ's"}
                </span>
              </div>
              <svg
                className="h-4 w-4 transition-all duration-300"
                fill="none"
                stroke="#7D7D7D"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                  className={`transition-all duration-300 group-hover:stroke-[#20C5FE] ${activeStroke('/dashboard/faqs')}`}
                />
              </svg>
            </Link>
          </motion.div>
        </nav>
        {/* Banner */}
        <motion.div
          className="mt-4 overflow-hidden rounded-lg border border-[#00374A]"
          initial={{ opacity: 0, y: 20 }}
          animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.6,
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <button
            className="relative block w-full cursor-pointer"
            onClick={() => dispatch(openModal('apkDownload'))}
            aria-label="Open APK Download"
          >
            {/* Image Container with text overlay */}
            <div className="relative w-full overflow-hidden rounded-lg">
              <motion.img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-new-banner-5.webp"
                alt="APK Banner"
                className="block h-auto w-full"
                style={{ transformOrigin: 'center center' }}
                whileHover={{
                  scale: 1.05,
                  transition: {
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                }}
                transition={{
                  scale: {
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                }}
              />
              {/* Button Text Container - Positioned relative to image container, unaffected by scale */}
              <div
                className="pointer-events-none absolute right-0 bottom-0 left-0 z-30 flex justify-center px-3 py-2"
                style={{ transform: 'none' }}
              >
                <span className="text-center text-sm font-semibold text-white drop-shadow-lg">
                  {t('download_apk')}
                </span>
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
});

export default LeftSidebar;
