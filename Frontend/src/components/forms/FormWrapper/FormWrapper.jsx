import React from 'react';
import './FormWrapper.css';

const FormWrapper = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="form-wrapper">
      {children}
    </form>
  );
};

export default FormWrapper;