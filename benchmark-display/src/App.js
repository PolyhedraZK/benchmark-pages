import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BenchmarkDisplay = () => {
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [commitList, setCommitList] = useState([]);
  const [benchmarkData, setBenchmarkData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommitList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/repos/${repoOwner}/${repoName}/commits?sha=${commitHash}&per_page=100`);
      if (!response.ok) throw new Error('Failed to fetch commits');
      const data = await response.json();
      setCommitList(data.map(commit => commit.sha));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBenchmarkData = async (commits) => {
    setLoading(true);
    setError(null);
    const data = {};
    try {
      for (const commit of commits) {
        const response = await fetch(`/storage/github_micro_bench/${repoName}/benchmark_${commit}.json`);
        if (response.ok) {
          data[commit] = await response.json();
        }
      }
      setBenchmarkData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (commitList.length > 0) {
      fetchBenchmarkData(commitList);
    }
  }, [commitList]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoOwner && repoName && commitHash) {
      fetchCommitList();
    } else {
      setError('Please fill in all fields');
    }
  };

  const prepareChartData = () => {
    return commitList.map(commit => ({
      commit: commit.substring(0, 7),
      ...benchmarkData[commit]
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Benchmark Results</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={repoOwner}
          onChange={(e) => setRepoOwner(e.target.value)}
          placeholder="Repository Owner"
          className="border p-2 mr-2 mb-2"
        />
        <input
          type="text"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="Repository Name"
          className="border p-2 mr-2 mb-2"
        />
        <input
          type="text"
          value={commitHash}
          onChange={(e) => setCommitHash(e.target.value)}
          placeholder="Commit Hash"
          className="border p-2 mr-2 mb-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Fetch Data</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {Object.keys(benchmarkData).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(benchmarkData[commitList[0]]).map(benchmark => (
            <div key={benchmark} className="border p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">{benchmark}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="commit" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={benchmark} stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BenchmarkDisplay;