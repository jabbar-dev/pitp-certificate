import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Certificate from './Certificate';
import strip from './image/strip certificate.png'


function App() {
  const [certificateNumber, setCertificateNumber] = useState('');

  const handleChange = (event) => {
    setCertificateNumber(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Redirect to the certificate page with the entered number
    window.location.href = `/certificate/${certificateNumber}`;
  };

  return (
    <div className="container"><br/>
    <div class="row justify-content-md-center">
    
      <center>
      <img src={strip} alt="Logo" style={{ width: '550px' }}/>
      </center>
      <div class="mt-5 col col-lg-5">
      <form onSubmit={handleSubmit} className="d-flex">
        <input
          type="text"
          value={certificateNumber}
          onChange={handleChange}
          placeholder="Enter Your CNIC Number Without Dashes"
          className="form-control me-2"
        />
        
        <button type="submit" className="btn btn-success">
          View Certificate
        </button>
      </form>
    </div></div></div>
  );
}

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="certificate/:hi" element={<Certificate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
