import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, ShieldAlert, CheckCircle2, MessageSquare, Stethoscope, User, Clock, AlertCircle } from 'lucide-react';

export const FeedbackSection = () => {
  const { feedbacks, submitFeedback, t } = useApp();

  const [activeCategory, setActiveCategory] = useState('user'); // 'user' or 'doctor'
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // User fields
  const [usabilityFeedback, setUsabilityFeedback] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [comments, setComments] = useState('');

  // Doctor fields
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [doctorClinicAffiliation, setDoctorClinicAffiliation] = useState('');
  const [clinicalPresentationFeedback, setClinicalPresentationFeedback] = useState('');
  const [wellnessGuidanceFeedback, setWellnessGuidanceFeedback] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!rating || rating < 1 || rating > 5) {
      setFormError('Please select a star rating from 1 to 5.');
      return;
    }

    if (activeCategory === 'user' && !usabilityFeedback.trim() && !suggestions.trim() && !comments.trim()) {
      setFormError('Please provide at least a brief comment, usability experience, or suggestion.');
      return;
    }

    if (activeCategory === 'doctor' && !doctorSpecialty.trim()) {
      setFormError('Please specify your medical specialty or clinical role.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        category: activeCategory,
        rating,
        usabilityFeedback,
        problemsEncountered,
        suggestions,
        comments: activeCategory === 'doctor' 
          ? (comments ? `${comments}\n\n[Wellness Guidance Feedback]: ${wellnessGuidanceFeedback}` : wellnessGuidanceFeedback)
          : comments,
        doctorSpecialty,
        doctorClinicAffiliation,
        clinicalPresentationFeedback
      });

      setFormSuccess(true);
      // Reset form
      setUsabilityFeedback('');
      setProblemsEncountered('');
      setSuggestions('');
      setComments('');
      setDoctorSpecialty('');
      setDoctorClinicAffiliation('');
      setClinicalPresentationFeedback('');
      setWellnessGuidanceFeedback('');
      setRating(5);
    } catch (err) {
      setFormError(err.message || 'Submission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[var(--text-primary)]">
      
      {/* Category Switcher Tabs */}
      <div className="flex bg-[var(--bg-surface-elevated)] p-1 rounded-2xl border border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => {
            setActiveCategory('user');
            setFormError('');
            setFormSuccess(false);
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'user'
              ? 'bg-[var(--bg-surface)] text-pink-600 dark:text-pink-400 shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t('feedback.userFeedbackTab', 'User Feedback')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveCategory('doctor');
            setFormError('');
            setFormSuccess(false);
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'doctor'
              ? 'bg-[var(--bg-surface)] text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>{t('feedback.doctorFeedbackTab', 'Doctor / Healthcare Professional')}</span>
        </button>
      </div>

      {/* Safety Notice for Healthcare Professional */}
      {activeCategory === 'doctor' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t('feedback.doctorNoticeTitle', 'Verification & Safety Policy')}</span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
            {t('feedback.doctorNoticeText', "Professional submissions are marked as 'Unverified Clinical Submission' until credentials are confirmed by review moderators. Submissions do not constitute clinical endorsement.")}
          </p>
        </div>
      )}

      {/* Feedback Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-3xl border border-[var(--border-card)] shadow-sm space-y-4"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Star Rating */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
            {t('feedback.overallRating', 'Overall Satisfaction Rating (1 to 5 Stars)')}
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                aria-label={`${star} Stars`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 ml-2">
              {rating} / 5
            </span>
          </div>
        </div>

        {/* Dynamic Category Specific Fields */}
        {activeCategory === 'user' ? (
          <>
            {/* Usability & Navigation */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                {t('feedback.usabilityLabel', 'Usability & Navigation Experience')}
              </label>
              <textarea
                rows={2}
                value={usabilityFeedback}
                onChange={(e) => setUsabilityFeedback(e.target.value)}
                placeholder={t('feedback.usabilityPlaceholder', 'How intuitive was the navigation, layout, and daily logging?')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Problems Encountered */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                {t('feedback.problemsLabel', 'Problems or Bugs Encountered')}
              </label>
              <textarea
                rows={2}
                value={problemsEncountered}
                onChange={(e) => setProblemsEncountered(e.target.value)}
                placeholder={t('feedback.problemsPlaceholder', 'Did you encounter any issues, slow loading, or confusion?')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Suggestions for Improvement */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                {t('feedback.suggestionsLabel', 'Suggestions for Improvement')}
              </label>
              <textarea
                rows={2}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder={t('feedback.suggestionsPlaceholder', 'What new features or enhancements would you love to see?')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Optional Written Comments */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                {t('feedback.commentsLabel', 'Additional Written Comments (Optional)')}
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t('feedback.commentsPlaceholder', 'Any other thoughts or compliments...')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </>
        ) : (
          <>
            {/* Doctor Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  {t('feedback.doctorSpecialtyLabel', 'Medical Specialty / Role')} *
                </label>
                <input
                  type="text"
                  required
                  value={doctorSpecialty}
                  onChange={(e) => setDoctorSpecialty(e.target.value)}
                  placeholder={t('feedback.doctorSpecialtyPlaceholder', 'e.g., Gynecologist, General Physician')}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  {t('feedback.doctorAffiliationLabel', 'Clinic / Hospital Affiliation')}
                </label>
                <input
                  type="text"
                  value={doctorClinicAffiliation}
                  onChange={(e) => setDoctorClinicAffiliation(e.target.value)}
                  placeholder={t('feedback.doctorAffiliationPlaceholder', "e.g., City Women's Care Hospital")}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Clinical Presentation Feedback */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                {t('feedback.clinicalPresLabel', 'Presentation of Health Summaries & Symptoms')}
              </label>
              <textarea
                rows={2}
                value={clinicalPresentationFeedback}
                onChange={(e) => setClinicalPresentationFeedback(e.target.value)}
                placeholder={t('feedback.clinicalPresPlaceholder', 'Is the clinical symptom information presented clearly and safely?')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Wellness & Cycle Guidance Feedback */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                {t('feedback.wellnessGuidanceLabel', 'Usefulness of Wellness & Cycle Guidance')}
              </label>
              <textarea
                rows={2}
                value={wellnessGuidanceFeedback}
                onChange={(e) => setWellnessGuidanceFeedback(e.target.value)}
                placeholder={t('feedback.wellnessGuidancePlaceholder', 'Are the cycle guidelines safe, evidence-aligned, and clear?')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Optional Recommendations */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                {t('feedback.commentsLabel', 'Additional Professional Recommendations (Optional)')}
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t('feedback.commentsPlaceholder', 'Any clinical notes or suggestions for app improvements...')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        )}

        {/* Validation Errors */}
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Success Alert */}
        {formSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t('feedback.successToast', 'Thank you! Your feedback has been recorded securely 💌')}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-2xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'user'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
              : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700'
          } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
        >
          {isSubmitting ? (
            <span>{t('feedback.submittingBtn', 'Submitting...')}</span>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              <span>{t('feedback.submitBtn', 'Submit Feedback')}</span>
            </>
          )}
        </button>
      </form>

      {/* Previously Submitted Feedback History */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-pink-500" />
          <span>{t('feedback.myHistoryTitle', 'Your Submitted Feedback Records')}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bg-subcard)] text-[var(--accent-primary)]">
            {feedbacks.length}
          </span>
        </h3>

        {feedbacks.length === 0 ? (
          <div 
            className="p-6 rounded-3xl border border-dashed border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)] space-y-1"
          >
            <p>{t('feedback.noSubmissionsYet', 'You have not submitted any feedback yet. Your thoughts help improve FemCare!')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl border border-[var(--border-card)] shadow-xs space-y-2.5 transition-colors"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {fb.category === 'doctor' ? '🩺 Clinical Provider' : '👤 User Experience'}
                    </span>
                    <span className="text-xs text-amber-500 font-bold flex items-center">
                      {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                    </span>
                  </div>

                  {/* Submission Status & Verification Badge */}
                  <div className="flex items-center gap-1.5">
                    {fb.category === 'doctor' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                        {fb.isVerified ? 'Verified Doctor' : t('feedback.unverifiedBadge', 'Unverified Submission (Under Review)')}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200">
                      {fb.status || t('feedback.statusSubmitted', 'Submitted')}
                    </span>
                  </div>
                </div>

                {fb.doctorSpecialty && (
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <strong>Role:</strong> {fb.doctorSpecialty} {fb.doctorClinicAffiliation ? `at ${fb.doctorClinicAffiliation}` : ''}
                  </div>
                )}

                {fb.usabilityFeedback && (
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Usability: </span>
                    {fb.usabilityFeedback}
                  </div>
                )}

                {fb.suggestions && (
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Suggestions: </span>
                    {fb.suggestions}
                  </div>
                )}

                {fb.clinicalPresentationFeedback && (
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Clinical Feedback: </span>
                    {fb.clinicalPresentationFeedback}
                  </div>
                )}

                {fb.comments && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "{fb.comments}"
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right pt-1 border-t border-[var(--border-subtle)]">
                  {fb.createdAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
