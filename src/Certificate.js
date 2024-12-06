import { useEffect, useState } from "react";
import {useParams} from "react-router-dom"
import { CertificateData } from "./CertificateData";
import CertificateTemplate from "./CertificateTemplate";
export default function Certificate() {

  const [certificate, setCertificate] = useState(null);
  const params = useParams();
  const { hi } = params

  useEffect(() => {
    console.log(CertificateData);
    
    const selectedCertificate = CertificateData.find(
      (cert) => cert.certificate_id === parseInt(hi)
    );
    setCertificate(selectedCertificate);
  }, [hi]);

  if (!certificate) {
    return <div><center><br/><br/> <span style={{fontSize : '20px'}} className="badge text-bg-danger">SORRY! <br/><br/>CERTIFICATE NOT FOUND!</span></center></div>;
  }

  return (
    <div>
      <br/>
      <center>
      <span style={{fontSize : '20px'}} className="badge text-bg-success">CONGRATULATIONS! {certificate.name}</span></center>
      <br/>
      <CertificateTemplate name={certificate.name} course={certificate.course} center={certificate.center} id={parseInt(hi)}/>
    </div>
  );
}
