import React, { useState } from "react";
import { createRoot } from "react-dom/client"; // Import createRoot
import { CertificateData } from "./CertificateData";
import CertificateTemplate from "./CertificateTemplate";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function DownloadCertificates() {
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const centers = [...new Set(CertificateData.map((cert) => cert.center))];
  const courses = [...new Set(CertificateData.map((cert) => cert.course))];

  const handleDownloadZip = async () => {
    const filteredCertificates = CertificateData.filter(
      (cert) =>
        (selectedCenter === "" || cert.center === selectedCenter) &&
        (selectedCourse === "" || cert.course === selectedCourse)
    );

    if (filteredCertificates.length === 0) {
      alert("No certificates found for the selected criteria!");
      return;
    }

    const zip = new JSZip();

    for (const cert of filteredCertificates) {
      const certificateContainer = document.createElement("div");
      certificateContainer.style.position = "absolute";
      certificateContainer.style.top = "-10000px"; // Hide off-screen
      certificateContainer.style.left = "-10000px";
      document.body.appendChild(certificateContainer);

      // Render the certificate component using createRoot
      const root = createRoot(certificateContainer);
      root.render(
        <CertificateTemplate
          name={cert.name}
          course={cert.course}
          center={cert.center}
          id={cert.certificate_id}
        />
      );

      // Allow a slight delay to ensure the QR code is rendered
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Capture the rendered certificate
      const canvas = await html2canvas(certificateContainer, { useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // Add the image to the ZIP file
      zip.file(`${cert.name}_certificate.png`, imgData.split(",")[1], {
        base64: true,
      });

      // Clean up the DOM
      document.body.removeChild(certificateContainer);
    }

    // Generate the ZIP and trigger the download
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "certificates.zip");
    });
  };

  return (
    <div className="download-container">
      <h2 className="title">Download All Certificates</h2>
      <div className="filters">
        <select
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          className="dropdown"
        >
          <option value="">Choose by Center</option>
          {centers.map((center) => (
            <option key={center} value={center}>
              {center}
            </option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="dropdown"
        >
          <option value="">Choose by Course</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>
      <button className="download-btn" onClick={handleDownloadZip}>
        Download All Certificates as ZIP
      </button>
    </div>
  );
}