// @ts-nocheck
import Button from '@mui/material/Button';

interface ButtonCompProps {
  value: string;
  onClick: () => void; // Define the onClick prop type
}

function ButtonComp({ value, onClick }: ButtonCompProps) {
  return (
    <Button
      color="inherit"
      sx={{
        mr: 2,
        '&:hover': {
          color: '#fe9b05',
          backgroundColor: '#e1e1e1',
          py: 2,
        },
      }}
      onClick={onClick} // Pass the onClick prop here
    >
      {value}
    </Button>
  );
}

export default ButtonComp;
