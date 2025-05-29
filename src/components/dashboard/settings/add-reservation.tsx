'use client';

import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { collection, query, where, getDocs, setDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { QRCodeCanvas } from 'qrcode.react';

export interface Train {
  id: string;
  trainNo: string;
  trainName: string;
  fromCity: string;
  toCity: string;
  seatsAvailable: number;
  trainType: string;
  frequency: string;
  departureDateTime: string;
  destinationDateTime: string;
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
export function CreateReservation(): React.JSX.Element {
  const user = auth.currentUser;
  const email = user?.email || '';
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSeatDialog, setOpenSeatDialog] = useState(false);
  const [dialogData, setDialogData] = useState<{ totalPrice: number; trainId: string; numTickets: number } | null>(null);
  const [numTickets, setNumTickets] = useState(0);
  const [seatPreferences, setSeatPreferences] = useState<string[]>([]);

  const handleSubmitSearch = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    const trainsRef = collection(db, 'trains');
    const q = query(trainsRef, where('fromCity', '==', fromCity), where('toCity', '==', toCity));

    const querySnapshot = await getDocs(q);
    const newTrains: Train[] = querySnapshot.docs.map((docs) => ({
      id: docs.id,
      ...docs.data(),
    } as Train));
    
    if (newTrains.length === 0) {
      alert('No trains found for the selected route.');
    } else {
      setTrains(newTrains);
    }

    setLoading(false);
  };

  const handleReserve = async (trainId: string): Promise<void> => {
    const ticketsToReserve = prompt('Enter number of tickets:', '1');
    if (ticketsToReserve !== null) {
      const num = parseInt(ticketsToReserve, 10);

      // Fetch current train data
      const trainDoc = doc(db, 'trains', trainId);
      const trainSnapshot = await getDoc(trainDoc);
      if (!trainSnapshot.exists()) {
        alert('Train not found');
        return;
      }
      const trainData = trainSnapshot.data() as Train;

      // Check if there are enough seats available
      if (trainData.seatsAvailable < num) {
        alert('Not enough seats available');
        return;
      }

      const totalPrice = num * parseFloat(trainData.ticketPrice);

      setNumTickets(num);
      setSeatPreferences(Array(num).fill('')); // Initialize preferences for each ticket
      setDialogData({ totalPrice, trainId, numTickets: num });
      setOpenSeatDialog(true); // Open seat preference dialog
    }
  };

  const handleSeatPreferenceChange = (index: number, value: string): void => {
    const updatedPreferences = [...seatPreferences];
    updatedPreferences[index] = value;
    setSeatPreferences(updatedPreferences);
  };

  const handleConfirmPreferences = (): void => {
    if (seatPreferences.some((pref) => pref === '')) {
      alert('Please select a preference for all tickets.');
      return;
    }

    setOpenSeatDialog(false);
    setOpenDialog(true); // Open payment dialog
  };

  const handlePay = async (): Promise<void> => {
    if (!dialogData) return;

    const { trainId, numTickets } = dialogData;

    // Simulate a 10-second payment delay
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second delay

    // Fetch current train data
    const trainDoc = doc(db, 'trains', trainId);
    const trainSnapshot = await getDoc(trainDoc);
    if (!trainSnapshot.exists()) {
      alert('Train not found');
      setOpenDialog(false);
      return;
    }
    const trainData = trainSnapshot.data() as Train;

    // Update seatsAvailable in the train data
    await updateDoc(trainDoc, {
      seatsAvailable: trainData.seatsAvailable - numTickets,
    });

    const reservationData = {
      email,
      referenceNo: generateReferenceNo(),
      fromCity,
      toCity,
      trainId,
      numTickets,
      seatPreferences,
      dateTime: new Date().toISOString(),
    };
    const docRef = doc(collection(db, 'reservations'), reservationData.referenceNo);
    await setDoc(docRef, reservationData);

    setOpenDialog(false);
    alert('Reservation successful!');
  };

  const generateReferenceNo = (): string => {
    return 'REF' + Math.floor(Math.random() * 1000000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmitSearch}>
        <Card>
          <CardHeader subheader="Search your desired train" title="Search" />
          <Divider />
          <CardContent>
            <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
              <FormControl fullWidth>
                <InputLabel>From City</InputLabel>
                <OutlinedInput label="From City" name="city" value={fromCity} onChange={(e) => { setFromCity(e.target.value); }} />
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>To City</InputLabel>
                <OutlinedInput label="To City" name="toCity" type="city" value={toCity} onChange={(e) => { setToCity(e.target.value); }} />
              </FormControl>
            </Stack>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained">Search</Button>
          </CardActions>
        </Card>
      </form>
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
            <TableCell>Departure Date and Time</TableCell>
            <TableCell>Destination Date and Time</TableCell>
            <TableCell>Ticket Price</TableCell>
            <TableCell>Actions</TableCell>
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
              <TableCell>
                <Button onClick={() => handleReserve(train.id)}>Reserve</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Seat Preference Dialog */}
      <Dialog open={openSeatDialog} onClose={() => setOpenSeatDialog(false)}>
        <DialogTitle>Select Seat Preferences</DialogTitle>
        <DialogContent>
          {Array.from({ length: numTickets }).map((_, index) => (
            <FormControl fullWidth key={index} margin="normal">
              <InputLabel>Seat Preference for Ticket {index + 1}</InputLabel>
              <Select
                value={seatPreferences[index] || ''}
                onChange={(e) => handleSeatPreferenceChange(index, e.target.value)}
              >
                <MenuItem value="upper">Upper</MenuItem>
                <MenuItem value="middle">Middle</MenuItem>
                <MenuItem value="lower">Lower</MenuItem>
                <MenuItem value="side_upper">Side Upper</MenuItem>
                <MenuItem value="side_lower">Side Lower</MenuItem>
              </Select>
            </FormControl>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSeatDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmPreferences} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Total price: ₹{dialogData?.totalPrice.toFixed(2)}
          </DialogContentText>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <QRCodeCanvas
              value={`upi://pay?pa=sakshipopli1308@oksbi&pn=Sakshi popli&am=${dialogData?.totalPrice}&cu=INR`}
              size={150}
            />
            <p>Scan this QR code to pay</p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handlePay} variant="contained" color="primary">Pay</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}