import React from 'react';

const Wallet = ({ setCurrentPage }) => {
  const [balance, setBalance] = React.useState(() => {
    try {
      const raw = localStorage.getItem('wallet_balance');
      return raw ? parseFloat(raw) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [addAmount, setAddAmount] = React.useState('');
  const [transactions, setTransactions] = React.useState(() => {
    try {
      const raw = localStorage.getItem('wallet_transactions');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      alert('Enter valid amount');
      return;
    }

    const newBalance = balance + amount;
    setBalance(newBalance);
    localStorage.setItem('wallet_balance', newBalance.toString());

    const newTransaction = {
      id: Date.now(),
      type: 'credit',
      amount,
      date: new Date().toLocaleString(),
      description: 'Money added'
    };

    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    localStorage.setItem('wallet_transactions', JSON.stringify(updated));
    setAddAmount('');
    alert(`₹${amount.toFixed(2)} added successfully!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#051108] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-300">💳 Your Wallet</h1>
          <button 
            onClick={() => setCurrentPage?.('home')} 
            className="px-4 py-2 bg-green-700 rounded hover:bg-green-600 text-white"
          >
            ← Back
          </button>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-8 rounded-lg border-2 border-green-700 mb-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Available Balance</p>
            <h2 className="text-5xl font-bold text-green-300 mb-2">₹{balance.toFixed(2)}</h2>
            <p className="text-gray-400 text-sm">Wallet ID: {localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')).id?.slice(-8) : 'N/A'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Add Money Section */}
          <div className="bg-[#07110a] p-6 rounded-lg border border-green-700">
            <h3 className="text-xl font-bold text-green-300 mb-4">Add Money</h3>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400"
              />
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAddAmount(amt.toString())}
                    className="py-2 bg-green-700/30 border border-green-700 rounded hover:bg-green-700/50 text-white text-sm font-semibold transition"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMoney}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition"
              >
                Add to Wallet
              </button>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="bg-[#07110a] p-6 rounded-lg border border-green-700">
            <h3 className="text-xl font-bold text-green-300 mb-4">Wallet Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-900/10 rounded border border-green-800">
                <span className="text-gray-400">Total Added</span>
                <span className="font-bold text-green-300">
                  ₹{transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-900/10 rounded border border-green-800">
                <span className="text-gray-400">Total Spent</span>
                <span className="font-bold text-red-400">
                  ₹{transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-900/20 rounded border border-green-700">
                <span className="text-gray-300 font-semibold">Current Balance</span>
                <span className="font-bold text-2xl text-green-300">₹{balance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#07110a] p-6 rounded-lg border border-green-700">
          <h3 className="text-xl font-bold text-green-300 mb-4">Transaction History</h3>
          
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex justify-between items-center p-3 bg-green-900/10 rounded border border-green-800/50">
                  <div>
                    <div className="font-semibold">{txn.description}</div>
                    <div className="text-xs text-gray-400">{txn.date}</div>
                  </div>
                  <div className={`font-bold text-lg ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
