import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Certificate.css';
import ribbon from './image/RIBBON.png';
import signs from './image/signs.png';
import backImg from './image/back.jpg';
import { Helmet } from 'react-helmet';
import copy from 'copy-to-clipboard';
import { QRCodeCanvas } from 'qrcode.react';

const CertificateTemplate = (props) => {
  let name = props.name;
  let course = props.course;
  let center = props.center;
  let id = props.id;

  const url = `https://verifypitp.netlify.app/certificate/${id}`;

  const [copyButtonText, setCopyButtonText] = useState('Copy Sharable URL');

  const downloadCertificate = () => {
    const certificateDiv = document.getElementById('certificate');

    html2canvas(certificateDiv, {
      scale: 3,
      scrollX: 0,
      scrollY: 0,
      width: certificateDiv.offsetWidth,
      height: certificateDiv.offsetHeight,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [3375, 2625],
      });
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${name}_certificate_pitp.pdf`);
    });
  };

  const handleCopyButtonClick = () => {
    copy(url);
    setCopyButtonText('Copied');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCopyButtonText('Copy Sharable URL');
    }, 2000);

    return () => clearTimeout(timer);
  }, [copyButtonText]);

  return (
    <center>
      <div className="certificate" id="certificate">
        <img src={backImg} alt="Background" className="background-image" />
        <div className="logos">
          <img src={ribbon} alt="Ribbon" style={{ width: '530px' }} />
        </div>
        <div className="text">
          <b>THIS CERTIFICATE IS PROUDLY PRESENTED TO</b>
        </div>
        <div className="StudentName">{name}</div>
        <div className="line">___________________</div>
        <div className="belowText">
          <b>
            FOR SUCCESSFULLY COMPLETING TWO MONTHS HANDS-ON TRAINING OF <br />
           <span className='course'>{course}  </span> 
            <br />
            UNDER THE INITIATIVE OF GOVERNMENT OF SINDH <br />
            <span className='coursename'>PEOPLES INFORMATION TECHNOLOGY PROGRAM (PITP)</span>
            <br />
            AT {center}
          </b>
        </div>
        <div className="signs">
          <img src={signs} alt="Signs" style={{ width: '420px' }} />
        </div>
        <div className="verifyNote">
          <div className="qr-container">
            <QRCodeCanvas value={url} size={60} />
          </div>
          <br/>
          <span className="badge text-bg-warning">Verify at</span>
          <b> {url} </b>
        </div>
        <br />
        <div className="btn-group">
          <button type="button" className="btn btn-success" onClick={downloadCertificate}>
            Download Certificate
          </button>
          <button type="button" className="btn btn-info" onClick={handleCopyButtonClick}>
            {copyButtonText}
          </button>
        </div>
        <br /> <br />
      </div>
      <Helmet>
        <title>CONGRATULATIONS {name} FOR COMPLETING PITP PROGRAM</title>
        <meta property="og:title" content="Peoples Information Technology Program" />
        <meta property="og:description" content="Congratulations For Completing PITP BY SUKKUR IBA UNIVERSITY & IS&TD GOVERNMENT OF SINDH" />
        <meta property="og:image" content="URL_of_the_image" />
        <meta property="og:url" content={url} />
      </Helmet>
    </center>
  );
};

export default CertificateTemplate;