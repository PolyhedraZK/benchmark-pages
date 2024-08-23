import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatValue } from '../../utils/formatters';

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

const BenchmarkCharts = ({ benchmarkData }) => {
  if (Object.keys(benchmarkData).length === 0) {
    return <p className="alert alert-info">No benchmark data available. The CI might still be running.</p>;
  }

  const commitList = Object.keys(benchmarkData);
  const benchmarkNames = Object.keys(benchmarkData[commitList[0]] || {});

  if (benchmarkNames.length === 0) {
    return <p className="alert alert-info">No benchmark data for this commit, maybe CI is still running.</p>;
  }

  const prepareChartData = (benchmarkName) => {
    return commitList
      .slice() // Create a shallow copy to avoid modifying the original array
      .reverse() // Reverse the order of commits
      .map(commit => ({
        commit: commit.substring(0, 7),
        fullCommit: commit,
        value: benchmarkData[commit]?.[benchmarkName]?.median_time || null
      }))
      .filter(data => data.value !== null);
  };

  return (
    <Row className="g-4">
      {benchmarkNames.map((benchmarkName) => (
        <Col key={benchmarkName} xs={12} md={6} lg={6} xl={4}>
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
  );
};

export default BenchmarkCharts;