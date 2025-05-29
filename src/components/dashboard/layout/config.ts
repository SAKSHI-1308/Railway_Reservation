import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';


export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customer', title: 'Trains', href: paths.dashboard.customers, icon: 'plugs-connected' },
  // { key: 'integrations', title: 'Schedule', href: paths.dashboard.integrations, icon: 'users' },
  { key: 'settings', title: 'Reservations', href: paths.dashboard.settings, icon: 'gear-six' },
  // { key: 'account', title: 'Add / Delete Train', href: paths.dashboard.account, icon: 'x-square' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
