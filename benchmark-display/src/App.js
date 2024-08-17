import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const BenchmarkDisplay = () => {
  const [repoOwner, setRepoOwner] = useState('PolyhedraZK');
  const [repoName, setRepoName] = useState('Expander-rs');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [commitList, setCommitList] = useState([]);
  const [benchmarkData, setBenchmarkData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/branches`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data);
      // Set default branch to 'main' or 'master' if they exist
      const mainBranch = data.find(branch => branch.name === 'main');
      const masterBranch = data.find(branch => branch.name === 'master');

      if (mainBranch) {
        setSelectedBranch('main');
      } else if (masterBranch) {
        setSelectedBranch('master');
      } else if (data.length > 0) {
        setSelectedBranch(data[0].name); // Fallback to the first branch if neither exists
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLatestCommit = async () => {
      if (!selectedBranch) return;

      setLoading(true);
      setError(null);
      try {
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=${selectedBranch}&per_page=1`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch latest commit');
        const data = await response.json();
        setCommitHash(data[0].sha);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCommit();
  }, [selectedBranch]);

  const fetchCommitList = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=${commitHash}&per_page=30`;

      const response = await fetch(apiUrl);
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
    try {
      const fetchPromises = commits.map(commit =>
        fetch(`https://storage.googleapis.com/github_micro_bench/${repoName}/benchmark_${commit}.json`)
          .then(response => response.ok ? response.json() : null)
          .then(data => ({ commit, data }))
      );

      const results = await Promise.all(fetchPromises);
      const data = results.reduce((acc, { commit, data }) => {
        if (data) acc[commit] = data;
        return acc;
      }, {});

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

  const handleSetRepo = async () => {
    if (repoOwner && repoName) {
      await fetchBranches();
    } else {
      setError('Please fill in the repository owner and name');
    }
  };

  const handleSubmitCommitHash = async (e) => {
    e.preventDefault();
    if (commitHash) {
      await fetchCommitList();
    } else {
      setError('Please fill in the commit hash');
    }
  };

  const prepareChartData = useCallback((benchmarkName) => {
    return commitList.map(commit => ({
      commit: commit.substring(0, 7),
      fullCommit: commit,
      value: benchmarkData[commit]?.[benchmarkName]?.median_time || null
    })).filter(data => data.value !== null);
  }, [commitList, benchmarkData]);

  const formatValue = (value) => {
    if (value === 0) return '0';
    const absValue = Math.abs(value);
    if (absValue < 1e-9) return `${(value * 1e12).toFixed(2)} ps`;
    if (absValue < 1e-6) return `${(value * 1e9).toFixed(2)} ns`;
    if (absValue < 1e-3) return `${(value * 1e6).toFixed(2)} µs`;
    if (absValue < 1) return `${(value * 1e3).toFixed(2)} ms`;
    return `${value.toFixed(2)} s`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow">
          <p className="label">{`Commit: ${payload[0].payload.fullCommit}`}</p>
          <p>{`Value: ${formatValue(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCharts = () => {
    if (commitList.length === 0 || Object.keys(benchmarkData).length === 0) return null;

    const benchmarkNames = Object.keys(benchmarkData[commitList[0]] || {});

    return (
      <Container fluid>
        <Row>
          {benchmarkNames.map((benchmarkName) => (
            <Col key={benchmarkName} xs={12} md={6} lg={4} xl={3} className="mb-4">
              <h2 className="text-sm font-semibold mb-2" title={benchmarkName}>{benchmarkName}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={prepareChartData(benchmarkName)}
                  margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="commit"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={formatValue}
                    width={80}
                    tick={{ fontSize: 12 }}
                    tickCount={5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    dot={false}
                    strokeWidth={1.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Col>
          ))}
        </Row>
      </Container>
    );
  };

  return (
    <Container fluid className="p-4">
      <h1 className="h2 mb-4">Benchmark Results</h1>
      <p> Fill form below, click on Set Repo first, then select your branch. Default branch is either main or master. </p>
      <Form>
        <Row>
          <Col xs={12} md={4} className="mb-2">
            <Form.Label>Repository Owner</Form.Label>
            <Form.Control
              type="text"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              placeholder="Enter Repository Owner"
            />
          </Col>
          <Col xs={12} md={4} className="mb-2">
            <Form.Label>Repository Name</Form.Label>
            <Form.Control
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="Enter Repository Name"
            />
          </Col>
          <Col xs={12} md={4} className="mb-2 d-flex align-items-end">
            <Button variant="primary" onClick={handleSetRepo}>
              Set Repo
            </Button>
          </Col>
        </Row>
        {(
          <>
            <Row>
              <Col xs={12} md={4} className="mb-2">
                <Form.Label>Branch</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  {branches.map(branch => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col xs={12} md={4} className="mb-2">
                <Form.Label>Commit Hash</Form.Label>
                <Form.Control
                  type="text"
                  value={commitHash}
                  onChange={(e) => setCommitHash(e.target.value)}
                  placeholder="Enter Commit Hash"
                />
              </Col>
              <Col xs={12} md={4} className="mb-2 d-flex align-items-end">
                <Button variant="primary" onClick={handleSubmitCommitHash}>
                  Submit Commit Hash and Fetch Data
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">Error: {error}</p>}
      {renderCharts()}
    </Container>
  );
};

export default BenchmarkDisplay;
