// Utility functions for exporting data

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from the data
  const headers = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => headers.add(key));
  });

  const headersArray = Array.from(headers);

  // Create CSV content
  const csvContent = [
    headersArray.join(','), // Header row
    ...data.map(row =>
      headersArray.map(header => {
        const value = row[header];
        // Handle different data types and escape commas/quotes
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        // If the value contains commas, quotes, or newlines, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatDateForExport = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

export const formatTimeForExport = (time) => {
  if (!time) return '';
  return time;
};