import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import NavigationBar from './components/NavigationBar';
import NotFound from './components/NotFound';
function App() {
  return (

    <>
      <NavigationBar />
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />}> </Route>
        <Route path="/reset-password/:resetToken" element={<ResetPassword />}> </Route>

        <Route path="*" element={<NotFound />}></Route>
      </Routes>

    </>


  );
}

export default App;
