import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Hospital, MapPin, Phone, Calendar, Clock, Star, Video,
  Navigation, Search, Filter, AlertCircle, RefreshCw, CheckCircle2,
  ExternalLink, Loader2
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const HealthcareView = () => {
  const {
    clinicsList,
    clinicsLoading,
    clinicsError,
    clinicsLocationPermission,
    userCoords,
    clinicSearchQuery,
    setClinicSearchQuery,
    clinicRadiusKm,
    setClinicRadiusKm,
    clinicFacilityFilter,
    setClinicFacilityFilter,
    fetchNearbyClinics,
    requestUserLocation,
    bookings,
    addBooking,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState('clinics'); // 'clinics', 'bookings'
  const [searchInput, setSearchInput] = useState(clinicSearchQuery || '');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');

  // Initial fetch on mount if list is empty
  useEffect(() => {
    if (!clinicsList || clinicsList.length === 0) {
      fetchNearbyClinics({ radius: 15 });
    }
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setClinicSearchQuery(searchInput);
    fetchNearbyClinics({
      query: searchInput.trim(),
      radius: clinicRadiusKm,
      type: clinicFacilityFilter
    });
  };

  const handleFacilityFilterChange = (filterType) => {
    setClinicFacilityFilter(filterType);
    fetchNearbyClinics({
      query: searchInput.trim(),
      radius: clinicRadiusKm,
      type: filterType
    });
  };

  const handleRadiusChange = (newRadius) => {
    setClinicRadiusKm(newRadius);
    fetchNearbyClinics({
      query: searchInput.trim(),
      radius: newRadius,
      type: clinicFacilityFilter
    });
  };

  const handleConfirmBooking = () => {
    if (selectedClinic && selectedSlot) {
      const docName = selectedClinic.doctors && selectedClinic.doctors.length > 0
        ? selectedClinic.doctors[0].name
        : "Duty Gynecologist";

      addBooking(
        selectedClinic.name,
        docName,
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

  // Mock standard consultation slots for booking simulation
  const standardSlots = [
    { id: 's1', date: 'Tomorrow', time: '10:30 AM', type: 'In-Person Consultation' },
    { id: 's2', date: 'Tomorrow', time: '02:00 PM', type: 'In-Person Consultation' },
    { id: 's3', date: 'In 2 Days', time: '11:00 AM', type: 'Online Tele-Consultation 💻' }
  ];

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <span>Nearby Women's Healthcare</span>
            <span className="text-xl">🏥</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Verified gynecologists, maternity hospitals & diagnostic clinics
          </p>
        </div>
      </div>

      {/* 1. LOCATION PERMISSION & GPS CONTROL BAR */}
      <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {userCoords
              ? `GPS: ${userCoords.latitude.toFixed(3)}, ${userCoords.longitude.toFixed(3)}`
              : `Current: ${user.city || 'Bengaluru, India'}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {clinicsLocationPermission === 'granted' ? (
            <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> GPS Approved
            </span>
          ) : (
            <button
              onClick={requestUserLocation}
              className="text-[10px] bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>Use My Exact Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission Denied Notice */}
      {clinicsLocationPermission === 'denied' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold">Location Permission Denied</div>
            <div className="text-[11px] mt-0.5">
              Enter your city, area, or PIN code in the search bar below to find verified gynecologists and clinics near you.
            </div>
          </div>
        </div>
      )}

      {/* 2. MANUAL SEARCH & FILTER CONTROLS */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-3">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city, area, PIN code, or doctor name..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] placeholder:text-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Filters: Facility Type & Radius */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)] text-xs">
          
          {/* Facility Type Filter */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All Providers' },
              { id: 'clinic', label: 'Clinics' },
              { id: 'hospital', label: 'Hospitals' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleFacilityFilterChange(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  clinicFacilityFilter === f.id
                    ? 'bg-pink-600 text-white shadow-2xs'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Radius Dropdown */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)]">
            <span>Radius:</span>
            <select
              value={clinicRadiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              aria-label="Search Radius"
              className="py-1 px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-[11px] font-extrabold focus:outline-none"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>

        </div>
      </div>

      {/* Navigation Subtabs: Nearby Clinics vs My Consultations */}
      <div className="flex bg-[var(--bg-surface-elevated)] p-1 rounded-2xl border border-[var(--border-subtle)]">
        {[
          { id: 'clinics', label: `Nearby Healthcare (${clinicsList.length})` },
          { id: 'bookings', label: `My Consultations (${bookings.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[var(--bg-surface)] text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: NEARBY CLINICS & DOCTORS LIST */}
      {activeTab === 'clinics' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Loading State */}
          {clinicsLoading && (
            <div className="p-8 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] space-y-2">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
              <div className="font-extrabold text-sm text-[var(--text-primary)]">
                Locating Verified Healthcare Facilities...
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Retrieving verified women's healthcare directories and clinics near your location
              </p>
            </div>
          )}

          {/* Error State */}
          {!clinicsLoading && clinicsError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Error Loading Nearby Providers</span>
              </div>
              <p className="text-[11px]">{clinicsError}</p>
              <button
                onClick={() => fetchNearbyClinics()}
                className="py-1 px-3 bg-rose-600 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!clinicsLoading && !clinicsError && clinicsList.length === 0 && (
            <div className="p-8 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] space-y-3">
              <Hospital className="w-10 h-10 text-pink-500 mx-auto opacity-70" />
              <div className="font-extrabold text-sm text-[var(--text-primary)]">
                No Facilities Found In This Radius
              </div>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                No clinics or hospitals matched your current filters. Try searching for a major city (e.g. "Bengaluru", "Mumbai", "Delhi", "Pune") or increase the radius to 25 km.
              </p>
              <button
                onClick={() => {
                  setSearchInput('Bengaluru');
                  fetchNearbyClinics({ query: 'Bengaluru', radius: 25, type: 'all' });
                }}
                className="py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs cursor-pointer"
              >
                View Bengaluru Women's Hospitals
              </button>
            </div>
          )}

          {/* Clinics Cards */}
          {!clinicsLoading && clinicsList.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-[var(--bg-surface)] p-5 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-3.5 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[var(--text-primary)] text-sm">
                      {clinic.name}
                    </h3>
                    {clinic.isVerified ? (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                        ✓ Verified Provider
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Community Directory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {clinic.address}
                  </p>
                </div>
                {clinic.distanceKm && (
                  <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-900 shrink-0">
                    {clinic.distanceKm}
                  </span>
                )}
              </div>

              {/* Rating & Operating Hours */}
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium">
                {clinic.rating && (
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{clinic.rating}</span>
                    <span className="text-slate-400 font-normal">({clinic.reviewsCount || 120})</span>
                  </div>
                )}
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  {clinic.operatingHours || 'Contact facility for hours'}
                </span>
              </div>

              {/* Doctors & Specialties (Reliable Data Only) */}
              <div className="p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                <div className="font-extrabold text-[var(--text-primary)] text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Specialists & Gynecologists:</span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {clinic.verificationSource}
                  </span>
                </div>

                {clinic.doctorDataAvailable && clinic.doctors && clinic.doctors.length > 0 ? (
                  <div className="space-y-1.5">
                    {clinic.doctors.map((doc, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span>• {doc.name}</span>
                          {doc.qualification && (
                            <span className="text-[10px] text-slate-400 font-normal">({doc.qualification})</span>
                          )}
                        </div>
                        <div className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold pl-2.5">
                          {doc.specialty}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic p-1">
                    ℹ️ {clinic.doctorUnavailableNotice || 'Doctor roster not listed in public directory - contact facility directly for specialist schedules.'}
                  </div>
                )}
              </div>

              {/* Action Buttons: Directions, Call, Book */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2">
                {clinic.directionsUrl && (
                  <a
                    href={clinic.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-[var(--bg-surface-elevated)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Get Directions</span>
                  </a>
                )}

                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="flex-1 py-2.5 bg-[var(--bg-surface-elevated)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Call Clinic</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedClinic(clinic)}
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
            <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
              No consultations booked yet. Select a nearby clinic to schedule an appointment.
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{b.clinicName}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{b.doctorName} • {b.type}</p>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-pink-600 dark:text-pink-400 pt-1">
                  <span>📅 {b.date}</span>
                  <span>⏰ {b.time}</span>
                </div>
                {b.notes && (
                  <p className="text-[11px] text-[var(--text-secondary)] italic">
                    Reason: "{b.notes}"
                  </p>
                )}
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
          <div className="space-y-4 text-xs text-[var(--text-primary)]">
            <div>
              <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1">
                Select Available Consultation Slot
              </label>
              <div className="space-y-2">
                {standardSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedSlot?.id === slot.id
                        ? 'border-pink-500 bg-pink-50 text-pink-900 dark:bg-pink-950/80 dark:text-pink-100 font-extrabold ring-2 ring-pink-400/40'
                        : 'border-[var(--border-subtle)] text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-[var(--text-primary)]">{slot.date} at {slot.time}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-medium">{slot.type}</div>
                    </div>
                    {slot.type.includes('Online') ? (
                      <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <Hospital className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1">
                Reason for Visit / Optional Clinical Inquiries
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="e.g. Routine checkup, cycle regularity inquiry, pelvic discomfort..."
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <button
              disabled={!selectedSlot}
              onClick={handleConfirmBooking}
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
            >
              Confirm Appointment Booking
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};
