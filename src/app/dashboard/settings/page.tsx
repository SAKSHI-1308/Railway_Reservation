import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
// import { Notifications } from '@/components/dashboard/settings/notifications';
import { CreateReservation } from '@/components/dashboard/settings/add-reservation';

export const metadata = { title: `Reservation | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Create New Reservation </Typography>
      </div>
      {/* <Notifications /> */}
      <CreateReservation />
    </Stack>
  );
}
