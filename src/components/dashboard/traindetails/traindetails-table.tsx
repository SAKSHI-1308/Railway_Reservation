'use client'
import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { db } from '@/lib/firebase';
import { onSnapshot, collection } from 'firebase/firestore';

export interface Train {
  id: string;
  trainNo: string;
  trainName: string;
  fromCity: string;
  toCity: string;
  seatsAvailable: number;
  trainType: string;
  frequency: string;
  departureDateTime: string; // Updated field name
  destinationDateTime: string; // Updated field name
  ticketPrice: string;
}
function formatDateWithSuffix(dateString: string): string {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return 'Invalid Date'; // Return a fallback value for invalid or undefined dates
  }

  const date = new Date(dateString);

  const day = date.getDate();
  const daySuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatterDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatterTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = formatterDate.format(date); // Format the date part
  const formattedTime = formatterTime.format(date); // Format the time part

  // Extract the month, day, and year from the formatted date
  const [month, dayNumber, year] = formattedDate.replace(',', '').split(' ');

  return `${month} ${day}${daySuffix(day)}, ${year} at ${formattedTime}`;
}
export function TrainsTable(): React.JSX.Element {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'trains'),
      (snapshot) => {
        const newTrains: Train[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Train)
        );
        setTrains(newTrains);
        setLoading(false);
      },
      (_) => {
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    }; // Cleanup function
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Train No</TableCell>
          <TableCell>Train Name</TableCell>
          <TableCell>Source</TableCell>
          <TableCell>Destination</TableCell>
          <TableCell>Seats</TableCell>
          <TableCell>Train Type</TableCell>
          <TableCell>Frequency</TableCell>
          <TableCell>Departure Date & Time</TableCell>
          <TableCell>Destination Date & Time</TableCell>
          <TableCell>Ticket Price</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {trains.map((train) => (
          <TableRow key={train.id}>
            <TableCell>{train.trainNo}</TableCell>
            <TableCell>{train.trainName}</TableCell>
            <TableCell>{train.fromCity}</TableCell>
            <TableCell>{train.toCity}</TableCell>
            <TableCell>{train.seatsAvailable}</TableCell>
            <TableCell>{train.trainType}</TableCell>
            <TableCell>{train.frequency}</TableCell>
            <TableCell>
            {formatDateWithSuffix(train.departureDateTime)}
          </TableCell>
          <TableCell>
            {formatDateWithSuffix(train.destinationDateTime)}
          </TableCell>
            <TableCell>{train.ticketPrice}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}