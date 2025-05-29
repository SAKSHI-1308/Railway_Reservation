'use client';
import React, { useEffect, useState } from 'react';
// import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
// import dayjs from 'dayjs';

// import { config } from '@/config';
// import { Balance } from '@/components/dashboard/overview/budget';
import { LatestReservations } from '@/components/dashboard/overview/latest-orders';
// import { LatestProducts } from '@/components/dashboard/overview/latest-products';
// import { Sales } from '@/components/dashboard/overview/sales';
// import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
// import { Traffic } from '@/components/dashboard/overview/traffic';

import { getDocs, query, where, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';


// export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;


export default function Page(): React.JSX.Element {
  const [reservationCount, setReservationCount] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const fetchReservations = async (): Promise<void> => {
    const email = auth.currentUser?.email;
    if (email) {
      const q = query(collection(db, 'reservations'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      setReservationCount(querySnapshot.size);
      let tickets = 0;
      querySnapshot.forEach((doc) => {
        tickets += Number(doc.data().numTickets || 0);
      });
      setTotalTickets(tickets);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchReservations();
    })();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid lg={4} sm={6} xs={12}>
        <TotalCustomers diff={0} trend="down" sx={{ height: '100%' }} value={reservationCount.toString()} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} value={totalTickets.toString()} />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <LatestReservations />
      </Grid>
    </Grid>
  );
}