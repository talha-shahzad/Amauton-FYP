// @ts-nocheck
import React from 'react';
import { TextField, Button, Box } from '@mui/material';
import Filter from './Filter'
import { useState } from 'react';

function SellerOperation() {
    const [selectedValue, setSelectedValue] = useState(1); // Default value

    const handleFilterChange = (event) => {
      setSelectedValue(event.target.value);
    };


  return (
    <div>
      <h1 style={{textAlign: 'center', fontSize: '4em', fontFamily: 'Georgia', margin: '2rem' }}>
        Seller Operations
      </h1>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection:'column',
          justifyContent: 'space-between',
          width: '90%',
          margin: '0 auto', // Centers the form horizontally
        }}
      >
        <div style={{display:'flex', flexDirection:'row', margin:'1rem'}}>
            <Filter selectedValue={selectedValue} handleChange={handleFilterChange} />
        </div>
        <div style={{display:'flex', flexDirection:'row',}}>
        <TextField
          variant="outlined"
          fullWidth // Takes all available width
          sx={{
            borderRadius: '15px 0px 0px 15px', // Rounded corners
            '& .MuiOutlinedInput-root': {
                borderRadius: '15px 0px 0px 15px', // Ensures rounded corners on input
            },
          }}
          placeholder="Enter Keyword....." // Optional placeholder
        />
        <Button
          variant="contained" // You can use "outlined" if you prefer
          sx={{
            borderRadius: '0px 15px 15px 0px', // Rounded corners
          }}
        >
          Submit
        </Button>
        </div>
      </Box>
    </div>
  );
}

export default SellerOperation;
