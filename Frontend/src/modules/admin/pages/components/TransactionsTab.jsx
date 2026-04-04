import { useState } from 'react';
import { createPortal } from 'react-dom';
import useTransactions from "../../hooks/useTransactions";
export default function TransactionsTab({ projectId }) {
  const [subTab, setSubTab] = useState('funds');
  const [showRequestModal, setShowRequestModal] = useState(false);

  // 🔥 Backend integration
  const {
    transactions,
    summary,
    loading,
    error,
    create
  } = useTransactions(projectId);

  // 🔹 Map backend → UI safe format
  const fundsData = transactions
    ?.filter(t => t.type === "CREDIT")
    ?.map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      by: t.createdBy || "Admin",
      amount: `₹${t.amount?.toLocaleString()}`,
      amountRaw: t.amount
    })) || [];

  const expenseData = transactions
    ?.filter(t => t.type === "DEBIT")
    ?.map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      category: t.category || "General",
      amount: `₹${t.amount?.toLocaleString()}`
    })) || [];

  const requestsData = transactions
    ?.filter(t => t.status)
    ?.map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      desc: t.description,
      by: t.requestedBy || "User",
      amount: `₹${t.amount?.toLocaleString()}`,
      status: t.status
    })) || [];

if (loading) return <p>Loading...</p>;
if (error) return <p>{error}</p>;
if (!transactions.length) return <p>No transactions found</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {/* 🔹 Summary from backend */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-3.5">
          <p className="text-xs">Total Expenses</p>
          <p className="text-xl font-bold text-red-500">
            ₹{summary?.totalExpenses?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5">
          <p className="text-xs">Available Balance</p>
          <p className="text-xl font-bold">
            ₹{summary?.balance?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5">
          <p className="text-xs">Funds Released</p>
          <p className="text-xl font-bold text-blue-600">
            ₹{summary?.totalCredits?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* 🔹 Tables remain SAME UI */}
      {/* Funds */}
      {subTab === 'funds' && (
        <table className="w-full">
          <tbody>
            {fundsData.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.by}</td>
                <td className="text-right">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Expense */}
      {subTab === 'expense' && (
        <table className="w-full">
          <tbody>
            {expenseData.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.category}</td>
                <td className="text-right">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Requests */}
      {subTab === 'requests' && (
        <table className="w-full">
          <tbody>
            {requestsData.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.desc}</td>
                <td>{r.by}</td>
                <td>{r.amount}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}