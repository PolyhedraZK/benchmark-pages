import React from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap';

const RepositoryOwnerInput = ({ repoOwner, setRepoOwner, onConfirm, isConfirmed }) => {
  return (
    <InputGroup>
      <Form.Control
        type="text"
        value={repoOwner}
        onChange={(e) => setRepoOwner(e.target.value)}
        placeholder="Enter Repository Owner"
      />
      <Button 
        variant="outline-secondary" 
        onClick={onConfirm}
      >
        {isConfirmed ? 'Confirmed' : 'Confirm'}
      </Button>
    </InputGroup>
  );
};

export default RepositoryOwnerInput;