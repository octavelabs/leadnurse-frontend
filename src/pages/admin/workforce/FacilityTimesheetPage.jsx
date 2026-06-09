import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { getFacilities } from '../../../api/facilityApi';
import { getFacilityTimesheet } from '../../../api/shiftApi';

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtMoney = (n) => `£${(n ?? 0).toFixed(2)}`;
const fmtHours = (n) => `${(n ?? 0).toFixed(2)}h`;

function generatePDF(data, from, to) {
  const { facility, shifts, summary } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;
  const ML = 14;
  const MR = 14;
  const CW = PW - ML - MR; // 182mm usable
  const PRIMARY = [63, 62, 89];
  const LIGHT = [248, 247, 255];

  let y = 14;

  // ── Header band ──────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PW, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TIMESHEET INVOICE', ML, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Lead Nurse Workforce', ML, 21);
  doc.text(`Generated: ${fmt(new Date().toISOString())}`, PW - MR, 14, { align: 'right' });
  doc.text(`Period: ${fmt(from)} — ${fmt(to)}`, PW - MR, 21, { align: 'right' });

  y = 38;

  // ── Facility details ─────────────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Prepared for:', ML, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(facility.name, ML, y + 6);
  if (facility.address) doc.text(facility.address, ML, y + 12);
  if (facility.email) doc.text(facility.email, ML, y + 18);

  // Summary box (top-right)
  const SX = 120;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(SX, y - 4, CW - (SX - ML), 30, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY);
  doc.text('SUMMARY', SX + 4, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.text(`Total Shifts:`, SX + 4, y + 9);
  doc.text(`${summary.shiftCount}`, SX + 40, y + 9, { align: 'right' });
  doc.text(`Total Hours:`, SX + 4, y + 15);
  doc.text(fmtHours(summary.totalHours), SX + 40, y + 15, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text(`Amount Due:`, SX + 4, y + 23);
  doc.text(fmtMoney(summary.totalFacilityAmount), SX + 65, y + 23, { align: 'right' });

  y += 36;

  // ── Table ────────────────────────────────────────────────────────────────────
  const COL = [22, 38, 28, 38, 16, 18, 22]; // Date,Shift,Role,Worker,Hours,Rate,Amount
  const HEADERS = ['Date', 'Shift', 'Role', 'Worker', 'Hours', 'Rate(£)', 'Amount(£)'];
  const ROW_H = 7;
  const PAD = 1.5;

  const drawTableHeader = (yPos) => {
    doc.setFillColor(...PRIMARY);
    let x = ML;
    HEADERS.forEach((h, i) => {
      doc.rect(x, yPos, COL[i], ROW_H, 'F');
      x += COL[i];
    });
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    x = ML;
    HEADERS.forEach((h, i) => {
      doc.text(h, x + PAD, yPos + ROW_H - PAD);
      x += COL[i];
    });
    return yPos + ROW_H;
  };

  const drawRow = (yPos, cells, isEven) => {
    doc.setFillColor(isEven ? 248 : 255, isEven ? 247 : 255, isEven ? 255 : 255);
    let x = ML;
    COL.forEach((w) => { doc.rect(x, yPos, w, ROW_H, 'F'); x += w; });
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    x = ML;
    cells.forEach((cell, i) => {
      const txt = String(cell ?? '—');
      const maxW = COL[i] - PAD * 2;
      const trimmed = doc.getTextWidth(txt) > maxW
        ? txt.substring(0, Math.floor(txt.length * maxW / doc.getTextWidth(txt)) - 1) + '…'
        : txt;
      doc.text(trimmed, x + PAD, yPos + ROW_H - PAD);
      x += COL[i];
    });
    return yPos + ROW_H;
  };

  y = drawTableHeader(y);

  let rowIndex = 0;
  shifts.forEach((shift) => {
    const shiftDate = fmt(shift.date);
    const role = shift.role?.name ?? '—';

    if (shift.attendance.length === 0) {
      // Show shift with no attendance
      if (y > 265) { doc.addPage(); y = drawTableHeader(14); }
      y = drawRow(y, [shiftDate, shift.title, role, 'No attendance', '0.00h', fmtMoney(shift.facilityHourlyRate), '£0.00'], rowIndex % 2 === 0);
      rowIndex++;
    } else {
      shift.attendance.forEach((att) => {
        if (y > 265) { doc.addPage(); y = drawTableHeader(14); }
        y = drawRow(y, [
          shiftDate,
          shift.title,
          role,
          att.user?.name ?? '—',
          fmtHours(att.hours),
          fmtMoney(shift.facilityHourlyRate),
          fmtMoney(att.facilityAmount),
        ], rowIndex % 2 === 0);
        rowIndex++;
      });
    }
  });

  // ── Totals row ────────────────────────────────────────────────────────────────
  y += 2;
  doc.setFillColor(...PRIMARY);
  doc.rect(ML, y, CW, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL', ML + PAD, y + 5.5);
  doc.text(fmtHours(summary.totalHours), ML + COL[0] + COL[1] + COL[2] + COL[3] + PAD, y + 5.5);
  doc.text(fmtMoney(summary.totalFacilityAmount), ML + CW - PAD, y + 5.5, { align: 'right' });

  // ── Footer ────────────────────────────────────────────────────────────────────
  y += 18;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated document. Please contact us if you have any queries.', ML, y);

  const safeName = facility.name.replace(/[^a-z0-9]/gi, '_');
  doc.save(`timesheet_${safeName}_${from}_${to}.pdf`);
}

export default function FacilityTimesheetPage() {
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({ facilityId: '', from: '', to: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getFacilities().then((r) => setFacilities(r.data.data)).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!form.facilityId) return toast.error('Please select a facility');
    if (!form.from || !form.to) return toast.error('Please select a date range');
    if (new Date(form.from) > new Date(form.to)) return toast.error('Start date must be before end date');
    setLoading(true);
    setData(null);
    try {
      const res = await getFacilityTimesheet(form);
      setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load timesheet');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      generatePDF(data, form.from, form.to);
    } catch (e) {
      toast.error('PDF generation failed');
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const totalAttendanceRows = data?.shifts.reduce((s, sh) => s + Math.max(sh.attendance.length, 1), 0) ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facility Timesheets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate and export timesheet invoices by facility</p>
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Select Period & Facility</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
            <select
              value={form.facilityId}
              onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">Select facility…</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2 bg-primary-700 text-white text-sm font-semibold rounded-lg hover:bg-primary-800 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Generating…' : 'Generate Timesheet'}
          </button>
          {data && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {data && (
        <div className="space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Facility', value: data.facility.name },
              { label: 'Total Shifts', value: data.summary.shiftCount },
              { label: 'Total Hours', value: fmtHours(data.summary.totalHours) },
              { label: 'Amount Due', value: fmtMoney(data.summary.totalFacilityAmount), highlight: true },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.highlight ? 'bg-primary-700 border-primary-700 text-white' : 'bg-white border-gray-200'}`}>
                <p className={`text-xs font-medium ${s.highlight ? 'text-primary-200' : 'text-gray-500'}`}>{s.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${s.highlight ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Timesheet table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">
                Timesheet — {fmt(form.from)} to {fmt(form.to)}
              </h2>
              <span className="text-xs text-gray-400">{totalAttendanceRows} line items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Shift</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Worker</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Clock In</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Clock Out</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Hours</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Rate (£/h)</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Signed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.shifts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-gray-400">No shifts found for this period</td>
                    </tr>
                  ) : (
                    data.shifts.map((shift) => {
                      if (shift.attendance.length === 0) {
                        return (
                          <tr key={shift.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmt(shift.date)}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{shift.title}</td>
                            <td className="px-4 py-3 text-gray-600">{shift.role?.name}</td>
                            <td colSpan={4} className="px-4 py-3 text-gray-400 italic">No attendance recorded</td>
                            <td className="px-4 py-3 text-right text-gray-600">{fmtMoney(shift.facilityHourlyRate)}</td>
                            <td className="px-4 py-3 text-right text-gray-400">£0.00</td>
                            <td className="px-4 py-3 text-gray-400">—</td>
                          </tr>
                        );
                      }
                      return shift.attendance.map((att, ai) => (
                        <tr key={att.id} className="hover:bg-gray-50">
                          {ai === 0 && (
                            <>
                              <td className="px-4 py-3 text-gray-700 whitespace-nowrap" rowSpan={shift.attendance.length}>{fmt(shift.date)}</td>
                              <td className="px-4 py-3 font-medium text-gray-900" rowSpan={shift.attendance.length}>{shift.title}</td>
                              <td className="px-4 py-3 text-gray-600" rowSpan={shift.attendance.length}>{shift.role?.name}</td>
                            </>
                          )}
                          <td className="px-4 py-3 text-gray-800">{att.user?.name}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtTime(att.checkInTime)}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtTime(att.checkOutTime)}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{fmtHours(att.hours)}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{fmtMoney(shift.facilityHourlyRate)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtMoney(att.facilityAmount)}</td>
                          <td className="px-4 py-3">
                            {att.signoff?.signedAt ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Signed
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Pending</span>
                            )}
                          </td>
                        </tr>
                      ));
                    })
                  )}
                </tbody>
                {data.shifts.length > 0 && (
                  <tfoot>
                    <tr className="bg-primary-50 border-t-2 border-primary-200">
                      <td colSpan={6} className="px-4 py-3 font-bold text-primary-800 text-sm">TOTAL</td>
                      <td className="px-4 py-3 text-right font-bold text-primary-800">{fmtHours(data.summary.totalHours)}</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right font-bold text-primary-800 text-base">{fmtMoney(data.summary.totalFacilityAmount)}</td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
