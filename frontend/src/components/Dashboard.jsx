import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import AddTransaction from './AddTransaction';
import TransactionList from './TransactionList';
import { motion } from 'framer-motion';
import { ArrowRightCircle, RefreshCcw, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#FBBF24', '#F87171', '#A78BFA', '#60A5FA'];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });

  const fetchTxns = async () => {
    try {
      const res = await axios.get('/api/transactions');
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.transactions)
          ? res.data.transactions
          : [];
      setTransactions(data);

      // compute totals from all transactions
      let income = 0, expense = 0;
      data.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        else if (t.type === 'expense') expense += Number(t.amount);
      });
      setTotals({ income, expense });
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get('/api/transactions/summary');
      const summaryArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.summary)
          ? res.data.summary
          : [];

      const map = {};
      summaryArray.forEach(r => {
        const cat = r.category || 'Other';
        map[cat] = (map[cat] || 0) + Number(r.total);
      });

      const pieData = Object.entries(map).map(([name, value]) => ({
        name,
        value: Math.abs(value),
      }));
      setSummary(pieData);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  useEffect(() => {
    fetchTxns();
    fetchSummary();
  }, []);

  const lineData = transactions.slice().reverse().map(t => ({
    date: t.txn_date,
    balance: t.amount,
  }));

  const balance = totals.income - totals.expense;

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen rounded-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          📊 Smart Finance Dashboard
        </h1>
        <motion.button
          onClick={() => {
            fetchTxns();
            fetchSummary();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <RefreshCcw size={18} />
          Refresh Data
        </motion.button>
      </div>

      {/* Financial Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
        >
          <TrendingUp className="text-green-500 mb-2" size={30} />
          <h3 className="text-gray-600 font-semibold">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₹{totals.income.toLocaleString()}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
        >
          <TrendingDown className="text-red-500 mb-2" size={30} />
          <h3 className="text-gray-600 font-semibold">Total Expense</h3>
          <p className="text-2xl font-bold text-red-600">₹{totals.expense.toLocaleString()}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
        >
          <Wallet className="text-indigo-500 mb-2" size={30} />
          <h3 className="text-gray-600 font-semibold">Current Balance</h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            ₹{balance.toLocaleString()}
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Spending by Category
          </h2>
          {summary.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <PieChart width={350} height={250}>
              <Pie
                data={summary}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name }) => name}
              >
                {summary.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center gap-2">
            Recent Activity <ArrowRightCircle size={18} />
          </h2>
          <TransactionList
            transactions={transactions}
            loading={loading}
            onDeleted={() => {
              fetchTxns();
              fetchSummary();
            }}
          />

          <div className="mt-5">
            <AddTransaction
              onAdded={() => {
                fetchTxns();
                fetchSummary();
              }}
            />
          </div>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-2 bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Balance Over Time
          </h2>
          <LineChart width={850} height={300} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#6366F1"
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
          </LineChart>
        </motion.div>
      </div>
    </div>
  );
}
