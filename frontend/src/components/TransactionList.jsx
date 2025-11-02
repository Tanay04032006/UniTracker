import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Wallet2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TransactionList({ transactions = [], loading, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      setDeletingId(id);
      await axios.delete(`/api/transactions/${id}`);
      toast.success("Transaction deleted successfully!");
      onDeleted && onDeleted();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      toast.error("Failed to delete transaction.");
    } finally {
      setTimeout(() => setDeletingId(null), 400);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 max-h-56 overflow-auto">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse h-14 rounded-lg bg-gray-100 border border-gray-200"
          ></div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-40 text-gray-400"
      >
        <Wallet2 className="w-8 h-8 mb-2 text-indigo-400" />
        <p>No transactions yet — start adding some!</p>
      </motion.div>
    );
  }

  return (
    <ul className="space-y-2 max-h-56 overflow-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100">
      <AnimatePresence>
        {transactions.map((tx) => (
          <motion.li
            key={tx.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: deletingId === tx.id ? 0.97 : 1,
            }}
            exit={{
              opacity: 0,
              x: -60,
              transition: { duration: 0.25 },
            }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className={`relative flex justify-between items-center p-4 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-md ${
              tx.type === "income" ? "border-green-200" : "border-red-200"
            }`}
          >
            {/* Left Accent Strip */}
            <div
              className={`absolute left-0 top-0 h-full w-1.5 rounded-l-xl ${
                tx.type === "income" ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>

            {/* Transaction Details */}
            <div className="pl-3">
              <div className="font-semibold text-gray-800">{tx.title}</div>
              <div className="text-xs text-gray-500">
                {tx.category} • {tx.txn_date}
              </div>
            </div>

            {/* Amount and Delete */}
            <div className="flex items-center gap-3">
              <span
                className={`font-semibold text-sm ${
                  tx.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}₹
                {Math.abs(tx.amount).toFixed(2)}
              </span>

              <motion.button
                whileHover={{ scale: 1.2, color: "#ef4444" }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
                onClick={() => handleDelete(tx.id)}
                disabled={deletingId === tx.id}
                className={`p-1 rounded-full text-gray-500 hover:bg-gray-100 ${
                  deletingId === tx.id ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
