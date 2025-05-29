'use client'
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export interface Reservation {
  referenceNo: string;
  trainId: string;
  fromCity: string;
  toCity: string;
  numTickets: number;
  dateTime: Date;
}

export interface Train {
  id: string;
  trainNo: string;
  trainName: string;
  fromCity: string;
  toCity: string;
  seatsAvailable: number;
  trainType: string;
  frequency: string;
  departureTime: string;
  destinationTime: string;
  ticketPrice: string;
}

export function LatestReservations(): React.JSX.Element {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const fetchReservations = async (): Promise<void> => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        const email = user?.email;
        if (user) {
          const q = query(collection(db, 'reservations'), where('email', '==', email));
          const querySnapshot = await getDocs(q);
          const newFetchedReservations: Reservation[] = querySnapshot.docs.map((docs) => ({
            referenceNo: docs.id,
            ...docs.data(),
          } as Reservation));
          setReservations(newFetchedReservations);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleOpenDialog = (reservation: Reservation): void => {
    setSelectedReservation(reservation);
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedReservation(null);
  };

  const confirmCancelReservation = async (): Promise<void> => {
    if (!selectedReservation) return;

    try {
      // Delete the reservation
      await deleteDoc(doc(collection(db, 'reservations'), selectedReservation.referenceNo));
      setReservations(reservations.filter((r) => r.referenceNo !== selectedReservation.referenceNo));

      // Update train seats available
      const trainDoc = doc(db, 'trains', selectedReservation.trainId);
      const trainSnap = await getDoc(trainDoc);
      const train = trainSnap.data() as Train;
      await updateDoc(trainDoc, {
        seatsAvailable: train.seatsAvailable + selectedReservation.numTickets,
      });

      alert('Reservation canceled successfully.');
    } catch (error) {
      console.error('Error canceling reservation:', error);
    } finally {
      handleCloseDialog();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader title="Latest Reservations" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Reference No</TableCell>
              <TableCell>Train ID</TableCell>
              <TableCell>From City</TableCell>
              <TableCell>To City</TableCell>
              <TableCell>Number of Tickets</TableCell>
              <TableCell>Reservation Date and Time</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.referenceNo}>
                <TableCell>{reservation.referenceNo}</TableCell>
                <TableCell>{reservation.trainId}</TableCell>
                <TableCell>{reservation.fromCity}</TableCell>
                <TableCell>{reservation.toCity}</TableCell>
                <TableCell>{reservation.numTickets}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  }).format(new Date(reservation.dateTime))}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenDialog(reservation)}>Cancel</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Cancel Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel? Your payment is non-refundable.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={confirmCancelReservation} color="error" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

