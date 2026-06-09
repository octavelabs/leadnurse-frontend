import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyCertificates } from '../../api/certificateApi';
import { generateCertificatePDF } from '../../utils/certificateGenerator';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MyCertificatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCertificates().then((res) => setCertificates(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleDownload = (cert) => {
    generateCertificatePDF({
      userName: user.name,
      courseTitle: cert.course.title,
      issuedAt: cert.issuedAt,
      certificateId: cert.id,
    });
    toast.success('Certificate downloaded!');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-500 mt-1">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138..." />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No certificates yet</h3>
          <p className="text-gray-500 text-sm mb-4">Complete courses and pass assessments to earn certificates.</p>
          <Link to="/courses" className="text-primary-700 font-medium text-sm hover:text-primary-800">Browse courses →</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 bg-gradient-to-r from-primary-500 to-indigo-600" />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{cert.course.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Issued {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/courses/${cert.courseId}/certificate`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(cert)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
