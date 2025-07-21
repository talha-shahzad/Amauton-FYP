// @ts-nocheck
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

function Filter({ selectedValue, handleChange }) {
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="filter-label">Select Option</InputLabel>
        <Select
          labelId="filter-label"
          value={selectedValue}
          onChange={handleChange}
          variant="outlined"
          sx={{
            borderRadius: '15px', // Rounded corners for the select box
            '& .MuiSelect-outlined': {
              borderRadius: '15px', // Ensures rounded corners on select
            },
          }}
        >
          <MenuItem value={1}>Option 1</MenuItem>
          <MenuItem value={2}>Option 2</MenuItem>
          <MenuItem value={3}>Option 3</MenuItem>
          <MenuItem value={4}>Option 4</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default Filter;
