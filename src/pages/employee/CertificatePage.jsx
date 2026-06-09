import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCertificateByCourse } from '../../api/certificateApi';
import { generateCertificatePDF } from '../../utils/certificateGenerator';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CertificatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificateByCourse(courseId)
      .then((res) => setCert(res.data.data))
      .catch(() => {
        toast.error('Certificate not found. You may not have passed the assessment.');
        navigate(`/courses/${courseId}/assessment`);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleDownload = () => {
    generateCertificatePDF({
      userName: cert.user.name,
      courseTitle: cert.course.title,
      issuedAt: cert.issuedAt,
      certificateId: cert.id,
    });
    toast.success('Certificate downloaded!');
  };

  if (loading) return <LoadingSpinner />;
  if (!cert) return null;

  const dateStr = new Date(cert.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/courses/${courseId}`} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to course
      </Link>

      {/* Certificate Preview */}
      <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-lg">
        {/* Header stripe */}
        <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="px-8 py-10 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>

          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium mb-2">
            Certificate of Completion
          </p>
          <div className="w-16 h-px bg-blue-200 mx-auto mb-6" />

          <p className="text-gray-600 mb-2">This is to certify that</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{cert.user.name}</h2>
          <div className="w-48 h-0.5 bg-blue-500 mx-auto mb-6" />

          <p className="text-gray-600 mb-3">has successfully completed</p>
          <h3 className="text-xl font-bold text-blue-700 mb-8 px-4">{cert.course.title}</h3>

          <div className="inline-flex flex-col items-center">
            <p className="text-lg font-semibold text-gray-800">{dateStr}</p>
            <div className="w-36 h-px bg-gray-300 mt-1 mb-1" />
            <p className="text-xs text-gray-500">Date of Completion</p>
          </div>
        </div>

        <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Certificate ID</p>
          <p className="font-mono text-sm text-gray-700">{cert.id}</p>
        </div>
        <Button variant="primary" onClick={handleDownload}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </Button>
      </div>
    </div>
  );
}
