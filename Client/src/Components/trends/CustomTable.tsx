// @ts-nocheck
import { Paper, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.css'; // Ensure Bootstrap is imported
import './Trends.css'; // Custom CSS for Amazon theme
const CustomTable = ({ tableTitle, columns, data }) => {

    const columnKeyMapping = {
        'Image': 'image',
        'Name': 'name',
        'Ratings': 'ratings',
        'Sold in Last Month': 'sold_in_last_month',
        'BSR Classification Rank': 'BSR_classificationRanks_rank',
        'Score': 'score',
        'Main Category': 'main_category',
        'Sub Category': 'sub_category',
        'BSR Display Group Rank': 'BSR_displayGroupRanks_rank'
      };


  return (
    <div style={{ marginBottom: '1rem'}}>
       <Typography
        variant="h5"
        sx={{
          color: '#fe9b05',
          margin: '40px',
          textTransform: 'uppercase',
          textAlign: 'center',
          fontSize: '1.5em',
        }}
      >{tableTitle}</Typography>
      <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{background:'rgb(0,0,0,0.7)'}}>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell sx={{color:'white'}} key={index}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((item, index) => (
                <TableRow key={index} hover>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column === 'Image' ? (
                        <img src={item.image} alt={item.name} style={{ width: '100px', height: 'autpo'}} />
                      ) : column === 'Name' ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                        style={{
                            textDecoration: 'none',
                            color: '#007185;',
                            
                        }}>{item.name}</a>
                      ) : (
                        item[columnKeyMapping[column]]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

CustomTable.propTypes = {
  tableTitle: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CustomTable;
