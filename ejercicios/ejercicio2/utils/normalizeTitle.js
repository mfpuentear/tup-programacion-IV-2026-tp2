/**
 * @param {string} title 
 * @returns {string} Título canónico
 */
const normalizeTitle = (title) => {
  if (typeof title !== 'string') return '';
  return title.trim().replace(/\s+/g, ' ').toLowerCase();
};

module.exports = normalizeTitle;