import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import RepositoryOwnerInput from './RepositoryOwnerInput';
import RepositorySelector from './RepositorySelector';
import BranchSelector from './BranchSelector';
import CommitSelector from './CommitSelector';
import BenchmarkCharts from './BenchmarkCharts';
import { fetchBenchmarkData } from '../../utils/api';
import './BenchmarkDisplay.css';

const BenchmarkDisplay = () => {
  const [defaultRepoOwner] = useState('PolyhedraZK');
  const [defaultRepoName] = useState('Expander-rs');
  const [repoOwner, setRepoOwner] = useState(defaultRepoOwner);
  const [confirmedRepoOwner, setConfirmedRepoOwner] = useState(defaultRepoOwner);
  const [repoName, setRepoName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [benchmarkData, setBenchmarkData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmRepoOwner = () => {
    if (repoOwner) {
      setConfirmedRepoOwner(repoOwner);
    } else {
      setError('Please enter a repository owner');
    }
  };

  const handleSubmitCommitHash = async (e) => {
    e.preventDefault();
    if (confirmedRepoOwner && repoName && selectedBranch && commitHash) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBenchmarkData(confirmedRepoOwner, repoName, commitHash);
        setBenchmarkData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please fill in all fields');
    }
  };

  return (
    <Container fluid className="px-4">
      <Form onSubmit={handleSubmitCommitHash} className="benchmark-form mb-4">
        <Row className="g-3">
          <Col xs={12} sm={6} md={3} lg={3}>
            <Form.Label>Repository Owner</Form.Label>
            <RepositoryOwnerInput
              repoOwner={repoOwner}
              setRepoOwner={setRepoOwner}
              onConfirm={handleConfirmRepoOwner}
              isConfirmed={!!confirmedRepoOwner}
            />
          </Col>
          <Col xs={12} sm={6} md={3} lg={3}>
            <Form.Label>Repository Name</Form.Label>
            <RepositorySelector
              repoOwner={confirmedRepoOwner}
              defaultRepo={defaultRepoName}
              repoName={repoName}
              setRepoName={setRepoName}
            />
          </Col>
          <Col xs={12} sm={6} md={3} lg={3}>
            <Form.Label>Branch</Form.Label>
            <BranchSelector
              repoOwner={confirmedRepoOwner}
              repoName={repoName}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
            />
          </Col>
          <Col xs={12} sm={6} md={3} lg={3}>
            <Form.Label>Commit Hash</Form.Label>
            <CommitSelector
              repoOwner={confirmedRepoOwner}
              repoName={repoName}
              selectedBranch={selectedBranch}
              commitHash={commitHash}
              setCommitHash={setCommitHash}
            />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs={12} className="text-center">
            <Button type="submit" variant="primary" className="px-5" disabled={!confirmedRepoOwner || !repoName || !selectedBranch || !commitHash}>
              Fetch Benchmark Data
            </Button>
          </Col>
        </Row>
      </Form>
      {loading && <p className="alert alert-info">Loading...</p>}
      {error && <p className="alert alert-danger">Error: {error}</p>}
      <div className="benchmark-charts">
        <BenchmarkCharts benchmarkData={benchmarkData} />
      </div>
    </Container>
  );
};

export default BenchmarkDisplay;