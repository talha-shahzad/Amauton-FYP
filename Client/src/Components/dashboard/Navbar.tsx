// @ts-nocheck
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Logo from '../../assets/Logo.png'; 
import ButtonComp from './ButtonComp'; 
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleClick = (value: string) => {
    if (value === 'LogOut') {
      // Perform logout logic here (e.g., clearing tokens or session storage)
      localStorage.removeItem('authToken'); // Remove token from localStorage
      sessionStorage.removeItem('authToken'); // Remove token from sessionStorage
      navigate('/'); // Redirect to the login page
    }
    else if (value === 'Pricing') {
      navigate('/pricing'); // Redirect to pricing page
    }
  };

  return (
    <AppBar position="static" color="default" sx={{ mb: 2, p: 1, borderTop: '1rem solid #fe9b05' }}>
      <Toolbar>
        <img src={Logo} alt="Logo" style={{ height: 50 }} />
        <Box sx={{ flexGrow: 1 }} />
    
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
          {/* Button for Pricing */}
          <ButtonComp value="Pricing" onClick={() => handleClick('Pricing')} />
          {/* Button for LogOut */}
          <ButtonComp value="LogOut" onClick={() => handleClick('LogOut')} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
