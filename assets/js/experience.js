(function (root) {
  'use strict';

  // Use completed calendar years, advancing in the stated career-start month.
  function completedYears(start, today, timeZone) {
    if (!/^\d{4}-\d{2}$/.test(start)) return null;
    var parts = start.split('-'), startYear = Number(parts[0]), startMonth = Number(parts[1]);
    if (startMonth < 1 || startMonth > 12) return null;
    var calendar = new Intl.DateTimeFormat('en', {
      timeZone: timeZone || 'Asia/Kolkata', year: 'numeric', month: 'numeric'
    }).formatToParts(today || new Date());
    var year = Number(calendar.find(function (part) { return part.type === 'year'; }).value);
    var month = Number(calendar.find(function (part) { return part.type === 'month'; }).value);
    return Math.max(0, year - startYear - (month < startMonth ? 1 : 0));
  }

  if (typeof module === 'object' && module.exports) module.exports = { completedYears: completedYears };
  if (root.document) {
    root.document.querySelectorAll('[data-experience-start]').forEach(function (element) {
      var years = completedYears(element.dataset.experienceStart, new Date(), element.dataset.experienceTimezone);
      if (years !== null) element.textContent = years + '+';
    });
  }
}(typeof window === 'undefined' ? globalThis : window));
