import React from 'react';
import PropTypes from 'prop-types';
import './FormInput.style.css';

const TextFormTextarea = ({
  value,
  placeholder,
  error,
  onChange,
  className,
  required,
}) => {
  return (
    <div className="input-wrapper">
      {/* {label && <label>{label}</label>} */}

      <textarea
        className={['form-input', className].join(' ')}
        placeholder={required ? `${placeholder} *` : placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

TextFormTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  className: PropTypes.string,
  required: PropTypes.bool,
};

TextFormTextarea.defaultProps = {
  className: null,
  required: false,
};

export default TextFormTextarea;
