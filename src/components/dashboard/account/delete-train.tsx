'use client'
import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { collection, doc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';

interface Train {
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

// Helper function to format date with suffix
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

  const formattedDate = formatterDate.format(date);
  const formattedTime = formatterTime.format(date);

  const [month, dayNumber, year] = formattedDate.replace(',', '').split(' ');

  return `${month} ${day}${daySuffix(day)}, ${year} at ${formattedTime}`;
}

// Validation function to check date and time inputs
const validateTrainData = (train: Partial<Train>): boolean => {
  if (!train.departureDateTime || isNaN(new Date(train.departureDateTime).getTime())) {
    alert('Please enter a valid Departure Date & Time.');
    return false;
  }
  if (!train.destinationDateTime || isNaN(new Date(train.destinationDateTime).getTime())) {
    alert('Please enter a valid Destination Date & Time.');
    return false;
  }
  return true;
};

export default function DeleteTrain(): React.JSX.Element {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [newTrain, setNewTrain] = useState<Partial<Train>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'trains'), (snapshot) => {
      const newTrains: Train[] = snapshot.docs.map((docs) => {
        const data = docs.data() as Train;
        return {
          id: docs.id,
          trainNo: data.trainNo,
          trainName: data.trainName,
          fromCity: data.fromCity,
          toCity: data.toCity,
          seatsAvailable: data.seatsAvailable,
          trainType: data.trainType,
          frequency: data.frequency,
          departureDateTime: data.departureDateTime,
          destinationDateTime: data.destinationDateTime,
          ticketPrice: data.ticketPrice,
        };
      });
      setTrains(newTrains);
      setLoading(false);
    }, (_) => {
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const deleteTrain = async (id: string): Promise<void> => {
    const confirmDelete = window.confirm('Are you sure you want to delete this train?');
    if (confirmDelete) {
      await deleteDoc(doc(db, 'trains', id));
      alert('Train deleted successfully!');
    }
  };

  const startEdit = (train: Train): void => {
    setEditId(train.id);
    setNewTrain(train);
  };

  const updateTrain = async (): Promise<void> => {
    if (editId && newTrain) {
      // Validate the train data before updating
      if (!validateTrainData(newTrain)) {
        return; // Stop the update if validation fails
      }

      const trainRef = doc(db, 'trains', editId);
      await updateDoc(trainRef, newTrain);
      setEditId(null);
      setNewTrain({});
      alert('Train details updated successfully!');
    }
  };

  const handleChange = (field: keyof Train, value: string): void => {
    setNewTrain(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Train No</TableCell>
                <TableCell>Train Name</TableCell>
                <TableCell>From City</TableCell>
                <TableCell>To City</TableCell>
                <TableCell>Seats Available</TableCell>
                <TableCell>Train Type</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Departure Date & Time</TableCell>
                <TableCell>Destination Date & Time</TableCell>
                <TableCell>Ticket Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trains.map((train) => (
                <TableRow key={train.id}>
                  {editId === train.id ? (
                    <>
                      <TableCell>
                        <TextField value={newTrain.trainNo} onChange={(e) => { handleChange('trainNo', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <TextField value={newTrain.trainName} onChange={(e) => { handleChange('trainName', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <TextField value={newTrain.fromCity} onChange={(e) => { handleChange('fromCity', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <TextField value={newTrain.toCity} onChange={(e) => { handleChange('toCity', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <TextField value={newTrain.seatsAvailable} type="number" onChange={(e) => { handleChange('seatsAvailable', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <TextField value={newTrain.trainType} onChange={(e) => { handleChange('trainType', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <TextField value={newTrain.frequency} onChange={(e) => { handleChange('frequency', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          value={newTrain.departureDateTime || ''}
                          onChange={(e) => handleChange('departureDateTime', e.target.value)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          value={newTrain.destinationDateTime || ''}
                          onChange={(e) => handleChange('destinationDateTime', e.target.value)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField value={newTrain.ticketPrice} onChange={(e) => { handleChange('ticketPrice', e.target.value); }} />
                      </TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={updateTrain}>
                          Save
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
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
                      <TableCell sx={{ spacing: 3 }}>
                        <Button variant="contained" color="primary" onClick={() => { startEdit(train); }}>
                          Edit
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => deleteTrain(train.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}