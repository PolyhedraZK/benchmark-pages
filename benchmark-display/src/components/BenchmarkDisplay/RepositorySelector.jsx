import React, { useState, useEffect } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { fetchRepos } from '../../utils/api';
import './RepositorySelector.css';

const RepositorySelector = ({ repoOwner, defaultRepo, repoName, setRepoName }) => {
  const [repoOptions, setRepoOptions] = useState([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [filteredRepoOptions, setFilteredRepoOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (repoOwner) {
      fetchReposData();
    }
  }, [repoOwner]);

  const fetchReposData = async () => {
    setLoading(true);
    setError(null);
    try {
      const repos = await fetchRepos(repoOwner);
      setRepoOptions(repos);
      setFilteredRepoOptions(repos);
      if (repos.length > 0) {
        setRepoName(defaultRepo || repos[0].value);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSearch = (searchTerm) => {
    setRepoSearch(searchTerm);
    const filtered = repoOptions.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRepoOptions(filtered);
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic" className="w-100 text-left">
          {repoName || "Select Repository"}
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100">
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => handleRepoSearch(e.target.value)}
            value={repoSearch}
          />
          {filteredRepoOptions.map(option => (
            <Dropdown.Item 
              key={option.value} 
              onClick={() => setRepoName(option.value)}
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

export default RepositorySelector;