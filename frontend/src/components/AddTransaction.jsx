import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusCircle, DollarSign, Calendar, Tag, Type, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AddTransaction({ onAdded }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    txn_date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (form.type === 'expense') {
      setCategories(['Food', 'Travel', 'Rent', 'Shopping', 'Bills', 'Entertainment']);
    } else {
      setCategories(['Salary', 'Freelance', 'Allowance', 'Investment', 'Gift']);
    }
  }, [form.type]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/transactions', {
        ...form,
        amount: Number(form.amount),
      });

      toast.success('Transaction added successfully!');
      setForm({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        txn_date: new Date().toISOString().split('T')[0],
      });
      onAdded && onAdded();
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast.error('Failed to add transaction. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-indigo-50 backdrop-blur-lg shadow-lg rounded-2xl p-6 border border-gray-200 space-y-5 transition-all duration-300"
    >
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <PlusCircle className="w-6 h-6 text-indigo-600" />
        Add New Transaction
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Title */}
        <div className="relative">
          <Type className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="pl-10 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 p-2 text-sm shadow-sm"
          />
        </div>

        {/* Amount */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            required
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount"
            className="pl-10 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 p-2 text-sm shadow-sm"
          />
        </div>

        {/* Type */}
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 p-2 text-sm shadow-sm"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Category */}
        <div className="relative">
          <Tag className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            list="categories"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
            className="pl-10 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 p-2 text-sm shadow-sm"
          />
          <datalist id="categories">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Date */}
        <div className="relative">
          <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={form.txn_date}
            onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
            className="pl-10 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 p-2 text-sm shadow-sm"
          />
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-medium text-white transition-all duration-300 shadow-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Adding...
            </span>
          ) : (
            'Add Transaction'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
