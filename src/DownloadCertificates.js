import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CertificateData } from "./CertificateData";
import CertificateTemplate from "./CertificateTemplate";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { BounceLoader } from "react-spinners";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DownloadCertificates() {
  // Initialize all filters as empty strings for consistency.
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get unique values from CertificateData for each dropdown.
  const batches = [...new Set(CertificateData.map((cert) => cert.batch))];
  const centers = [...new Set(CertificateData.map((cert) => cert.center))];
  const courses = [...new Set(CertificateData.map((cert) => cert.course))];

  const handleDownloadZip = async () => {
    // Filter certificates based on selected criteria.
    const filteredCertificates = CertificateData.filter((cert) =>
      (selectedBatch === "" || cert.batch === parseInt(selectedBatch, 10)) &&
      (selectedCenter === "" || cert.center === selectedCenter) &&
      (selectedCourse === "" || cert.course === selectedCourse)
    );

    if (filteredCertificates.length === 0) {
      alert("No certificates found for the selected criteria!");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const zip = new JSZip();

    for (let i = 0; i < filteredCertificates.length; i++) {
      const cert = filteredCertificates[i];

      // Create an off-screen container for rendering the certificate.
      const certificateContainer = document.createElement("div");
      certificateContainer.style.position = "absolute";
      certificateContainer.style.top = "-10000px";
      certificateContainer.style.left = "-10000px";
      document.body.appendChild(certificateContainer);

      // Render the certificate component into the container.
      const root = createRoot(certificateContainer);
      root.render(
        <CertificateTemplate
          name={cert.name}
          course={cert.course}
          center={cert.center}
          id={cert.certificate_id}
        />
      );

      // Wait for the certificate to render.
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Use html2canvas to capture the certificate.
      const canvas = await html2canvas(certificateContainer, {
        scale: 3,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
      });

      // Create a PDF from the captured image.
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      // Convert the PDF to a blob and add it to the ZIP file.
      const pdfBlob = pdf.output("blob");
      // Replace spaces in the name with underscores for the file name.
      const safeName = cert.name.replace(/ /g, "_");
      zip.file(`${safeName}_${cert.certificate_id}_certificate.pdf`, pdfBlob);

      // Remove the off-screen container.
      document.body.removeChild(certificateContainer);

      // Update progress.
      setProgress(Math.round(((i + 1) / filteredCertificates.length) * 100));
    }

    // Generate the ZIP file and trigger the download.
    zip.generateAsync({ type: "blob" }).then((content) => {
      // Provide default values in the file name if center or course are not selected.
      const centerName = selectedCenter || "AllCenters";
      const courseName = selectedCourse || "AllCourses";
      saveAs(content, `${centerName}_${courseName}_certificates.zip`);
      setIsLoading(false);
    });
  };

  return (
    <div className="download-container">
      <h2 className="title">Download All Certificates</h2>
      <div className="filters">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="dropdown"
        >
          <option value="">Choose by Batch</option>
          {batches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>

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

      {isLoading && (
        <div className="modal">
          <center>
            <div className="modal-content">
              <BounceLoader color="#36d7b7" loading={isLoading} size={60} />
              <p>Generating Certificates, please wait...</p>
              <p>{`Progress: ${progress}%`}</p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${progress}%`,
                    height: "10px",
                    background: "#36d7b7",
                  }}
                />
              </div>
            </div>
          </center>
        </div>
      )}
    </div>
  );
}
