// @ts-nocheck
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const salesData = [
  { name: 'Jan', profit: 2000, sales: 4000 },
  { name: 'Feb', profit: 1398, sales: 3500 },
  { name: 'Mar', profit: 3000, sales: 9800 },
  { name: 'Apr', profit: 2780, sales: 3908 },
  { name: 'May', profit: 1890, sales: 4800 },
  { name: 'Jun', profit: 2390, sales: 3800 },
  { name: 'Jul', profit: 3490, sales: 4300 },
];

const Dashboard = () => {
  return (
    <div>
       <h1 style={{ textAlign:'center', fontSize:'4em', fontFamily:'Georgia', margin:'2rem'}}>Sales Analytics Dashboard</h1>
      <div className="row d-flex flex-firection-row justify-content-evenly">
        <div className="col-md-6 d-flex flex-column justify-content-between align-items-center"  style={{ backgroundColor: '#fe9a0540',padding:'1rem', borderRadius:'2rem', width:'45%', }}>
          <span>Sales Trend</span>
          <ResponsiveContainer width="90%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6 d-flex flex-column justify-content-between align-items-center" style={{ backgroundColor: '#fe9a0540', padding:'1rem', borderRadius:'2rem',width:'45%',}}>
        <span>Sales and Profit</span>
          <ResponsiveContainer width="90%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
              <Bar dataKey="profit" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
