/**
 * Formats a number to Indian Rupees (INR)
 * Usage: formatCurrency(4200000) -> "₹42,00,000"
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Safely formats a database timestamp into a readable date
 * Usage: formatDate("2026-04-09T00:00:00Z") -> "09 Apr 2026"
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Capitalizes the first letter of a word/status
 * Usage: capitalize("PENDING") -> "Pending"
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};