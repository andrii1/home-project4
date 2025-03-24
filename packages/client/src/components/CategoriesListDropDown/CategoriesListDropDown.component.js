import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CategoriesListDropDown.style.css';

const DropDownView = ({
  options,
  label,
  onSelect,
  selectedOptionValue,
  className,
  showFilterIcon = false,
  ...props
}) => {
  const [value, setValue] = useState('');
  const handleChange = (event) => {
    setValue(event.target.value);
    onSelect(event.target.value);
  };

  let optionList;
  if (!selectedOptionValue) {
    optionList =
      options.length > 0 &&
      options.map((item) => {
        return (
          <option key={item.toString()} value={item}>
            {item}
          </option>
        );
      });
  }

  optionList =
    options.length > 0 &&
    options.map((item) => {
      if (item === selectedOptionValue) {
        return null;
      }
      return (
        <option key={item.toString()} value={item}>
          {item}
        </option>
      );
    });

  return (
    <select
      onChange={handleChange}
      value={value}
      className={`view-dropdown-select ${className} ${
        showFilterIcon ? 'all-filters' : ''
      }`}
    >
      {selectedOptionValue && (
        <>
          <option selected value={selectedOptionValue}>
            {selectedOptionValue}
          </option>
          {optionList}
        </>
      )}
      {!selectedOptionValue && (
        <>
          <option value="">{label}</option>
          {optionList}
        </>
      )}
    </select>
  );
};

DropDownView.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  showFilterIcon: PropTypes.bool,
  className: PropTypes.string,
  selectedOptionValue: PropTypes.string,
};
DropDownView.defaultProps = {
  onSelect: undefined,
  showFilterIcon: false,
  className: null,
  selectedOptionValue: null,
};

export default DropDownView;
