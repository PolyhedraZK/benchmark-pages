import React, { useState, useEffect } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { fetchBranches } from '../../utils/api';
import './BranchSelector.css';

const BranchSelector = ({ repoOwner, repoName, selectedBranch, setSelectedBranch }) => {
  const [branches, setBranches] = useState([]);
  const [branchSearch, setBranchSearch] = useState('');
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (repoOwner && repoName) {
      fetchBranchesData();
    }
  }, [repoOwner, repoName]);

  const fetchBranchesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const branchesData = await fetchBranches(repoOwner, repoName);
      setBranches(branchesData);
      setFilteredBranches(branchesData);
      const mainBranch = branchesData.find(branch => branch.name === 'main');
      const masterBranch = branchesData.find(branch => branch.name === 'master');
      if (mainBranch) {
        setSelectedBranch('main');
      } else if (masterBranch) {
        setSelectedBranch('master');
      } else if (branchesData.length > 0) {
        setSelectedBranch(branchesData[0].name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSearch = (searchTerm) => {
    setBranchSearch(searchTerm);
    const filtered = branches.filter(branch => 
      branch.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBranches(filtered);
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-branch" className="w-100 text-left">
          {selectedBranch || "Select Branch"}
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100">
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => handleBranchSearch(e.target.value)}
            value={branchSearch}
          />
          {filteredBranches.map(branch => (
            <Dropdown.Item 
              key={branch.name} 
              onClick={() => setSelectedBranch(branch.name)}
            >
              {branch.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {loading && <p className="text-info mt-1">Loading...</p>}
      {error && <p className="text-danger mt-1">Error: {error}</p>}
    </>
  );
};

export default BranchSelector;