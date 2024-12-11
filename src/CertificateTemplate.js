import React, { useEffect, useRef, useState } from "react";
import "./Certificate.css";
import ribbon from "./image/RIBBON.png";
import signs from "./image/signs.png";
import backImg from "./image/back.jpg";
import QRCode from "qrcode";
import copy from "copy-to-clipboard";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CertificateTemplate = React.forwardRef((props, ref) => {
  const { name, course, center, id } = props;
  const url = `https://verifypitp.netlify.app/certificate/${id}`;
  const qrCanvasRef = useRef(null);
  const [copyButtonText, setCopyButtonText] = useState("Copy Sharable URL");

  useEffect(() => {
    // Generate QR code onto the canvas
    QRCode.toCanvas(qrCanvasRef.current, url, { width: 80 }, (error) => {
      if (error) console.error("QR Code generation failed:", error);
    });
  }, [url]);

  const downloadCertificate = () => {
    const certificateDiv = document.getElementById("certificate");

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
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [3375, 2625],
      });
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${name+"_"+id}_certificate_pitp.pdf`);
    });
  };

  const handleCopyButtonClick = () => {
    copy(url);
    setCopyButtonText("Copied!");
    setTimeout(() => setCopyButtonText("Copy Sharable URL"), 2000);
  };

  return (
    <center>
      <div className="certificate" id="certificate" ref={ref}>
        <img src={backImg} alt="Background" className="background-image" />
        <div className="logos">
          <img src={ribbon} alt="Ribbon" style={{ width: "530px" }} />
        </div>
        <div className="text">
          <b>THIS CERTIFICATE IS PRESENTED TO</b>
        </div>
        <div className="StudentName">{name}</div>
        <div className="line">___________________</div>
        <div className="belowText">
          <b>
            FOR SUCCESSFULLY COMPLETING TWO MONTHS HANDS-ON TRAINING OF <br />
            <span className="course">{course}</span>
            <br />
            UNDER THE INITIATIVE OF GOVERNMENT OF SINDH <br />
            <span className="coursename">
              PEOPLES INFORMATION TECHNOLOGY PROGRAM (PITP)
            </span>
            <br />
            AT {center}
          </b>
        </div>
        <div className="signs">
          <img src={signs} alt="Signs" style={{ width: "420px" }} />
        </div>
        <div className="verifyNote">
          <div className="qr-container">
            <canvas ref={qrCanvasRef}></canvas>
          </div>
          <br />
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
        <br />
        <br />
      </div>
    </center>
  );
});

export default CertificateTemplate;