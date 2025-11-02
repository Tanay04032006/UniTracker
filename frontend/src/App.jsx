import React from 'react';
import Dashboard from './components/Dashboard';

export default function App(){
  return (
    <div className="min-h-screen bg-skinny-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Uni Finance</h1>
        <Dashboard />
      </div>
    </div>
  );
}
