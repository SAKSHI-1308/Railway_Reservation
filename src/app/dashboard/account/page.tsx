import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { AddTrain } from '@/components/dashboard/account/add-train';
import DeleteTrain from '@/components/dashboard/account/delete-train';
// import { AccountInfo } from '@/components/dashboard/account/account-info';

export const metadata = { title: `Admin | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Add or Delete Trains</Typography>
      </div>
      <Grid container spacing={3}>
        {/* <Grid lg={4} md={6} xs={12}>
          <AccountInfo />
        </Grid> */}
        <Grid lg={12} md={6} xs={12}>
          <AddTrain />
        </Grid>
        <Grid lg={12} md={6} xs={12}>
          <DeleteTrain/>
        </Grid>
      </Grid>
    </Stack>
  );
}
