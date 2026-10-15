import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital, MapPin, Phone, Calendar, Clock, Star, Video, UserCheck, ArrowRight } from 'lucide-react';
import { Modal } from '../components/Modal';

export const HealthcareView = () => {
  const { clinics, bookings, addBooking, user } = useApp();

  const [activeTab, setActiveTab] = useState('clinics'); // clinics, bookings
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');

  const handleConfirmBooking = () => {
    if (selectedClinic && selectedSlot) {
      addBooking(
        selectedClinic.name,
        selectedClinic.doctors[0],
        selectedSlot.type,
        selectedSlot.date,
        selectedSlot.time,
        bookingNotes
      );
      setSelectedClinic(null);
      setSelectedSlot(null);
      setBookingNotes('');
      setActiveTab('bookings');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Nearby Women's Healthcare</span>
            <span className="text-xl">🏥</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Find nearby gynecologists, health clinics & book appointments
          </p>
        </div>
      </div>

      {/* Location Bar */}
      <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 p-3.5 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-teal-900 dark:text-teal-200">
          <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Location: {user.city}</span>
        </div>
        <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">
          GPS Approved
        </span>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
        {[
          { id: 'clinics', label: 'Nearby Clinics' },
          { id: 'bookings', label: `My Consultations (${bookings.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: NEARBY CLINICS LIST */}
      {activeTab === 'clinics' && (
        <div className="space-y-4 animate-fade-in">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {clinic.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {clinic.address}
                  </p>
                </div>
                <span className="text-xs font-bold text-pink-600 bg-pink-50 dark:bg-pink-950 px-2.5 py-1 rounded-full border border-pink-200 shrink-0">
                  {clinic.distanceKm}
                </span>
              </div>

              {/* Rating & Hours */}
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{clinic.rating}</span>
                  <span className="text-slate-400 font-normal">({clinic.reviewsCount})</span>
                </div>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{clinic.hours}</span>
              </div>

              {/* Doctors & Specialties */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-800 dark:text-slate-100">Specialists:</div>
                {clinic.doctors.map((doc, idx) => (
                  <div key={idx} className="text-[11px] font-medium">• {doc}</div>
                ))}
              </div>

              {/* Actions: Call, Directions, Book */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${clinic.phone}`}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call Clinic</span>
                </a>

                <button
                  onClick={() => setSelectedClinic(clinic)}
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CONSULTATION HISTORY */}
      {activeTab === 'bookings' && (
        <div className="space-y-3 animate-fade-in">
          {bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border text-center text-xs text-slate-400">
              No consultations booked yet. Select a nearby clinic to schedule an appointment.
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{b.clinicName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{b.doctorName} • {b.type}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-pink-600 dark:text-pink-400 pt-1">
                  <span>📅 {b.date}</span>
                  <span>⏰ {b.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* BOOKING MODAL */}
      <Modal
        isOpen={!!selectedClinic}
        onClose={() => setSelectedClinic(null)}
        title={selectedClinic ? `Book Appointment at ${selectedClinic.name}` : "Book Consultation"}
      >
        {selectedClinic && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Available Slot & Consultation Type
              </label>
              <div className="space-y-2">
                {selectedClinic.availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedSlot?.id === slot.id
                        ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold ring-2 ring-pink-400/30'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{slot.date} at {slot.time}</div>
                      <div className="text-[10px] text-slate-500">{slot.type}</div>
                    </div>
                    {slot.type.includes('Online') ? (
                      <Video className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Hospital className="w-4 h-4 text-pink-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Visit / Optional Notes
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="e.g. Routine checkup, cycle regularity inquiry..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>

            <button
              disabled={!selectedSlot}
              onClick={handleConfirmBooking}
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
            >
              Confirm Appointment Booking
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};
