import React, { useState, useEffect } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { fetchCommits } from '../../utils/api';
import './CommitSelector.css';

const CommitSelector = ({ repoOwner, repoName, selectedBranch, commitHash, setCommitHash }) => {
  const [commitOptions, setCommitOptions] = useState([]);
  const [commitSearch, setCommitSearch] = useState('');
  const [filteredCommitOptions, setFilteredCommitOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (repoOwner && repoName && selectedBranch) {
      fetchCommitsData();
    }
  }, [repoOwner, repoName, selectedBranch]);

  const fetchCommitsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const commits = await fetchCommits(repoOwner, repoName, selectedBranch);
      setCommitOptions(commits);
      setFilteredCommitOptions(commits.slice(0, 100));
      if (commits.length > 0) {
        setCommitHash(commits[0].value);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitSearch = (searchTerm) => {
    setCommitSearch(searchTerm);
    const filtered = commitOptions.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommitOptions(filtered.slice(0, 100));
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-commit" className="w-100 text-left">
          {commitHash ? commitHash.substring(0, 7) : "Select Commit"}
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100">
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => handleCommitSearch(e.target.value)}
            value={commitSearch}
          />
          {filteredCommitOptions.map(option => (
            <Dropdown.Item 
              key={option.value} 
              onClick={() => setCommitHash(option.value)}
            >
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {loading && <p className="text-info mt-1">Loading...</p>}
      {error && <p className="text-danger mt-1">Error: {error}</p>}
    </>
  );
};

export default CommitSelector;