import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { apiURL } from '../../apiURL';
import Modal from '../Modal/Modal.Component';
import useInputValidation from '../../utils/hooks/useInputValidation';
import TextFormTextarea from '../Input/TextFormTextarea.component';
import { Dropdown } from '../Dropdown/Dropdown.Component';
import { Button } from '../Button/Button.component';
import { useUserContext } from '../../userContext';
import './FormNewCode.styles.css';

/**
 * Primary UI component for user interaction
 */
export const FormNewCode = ({
  className,
  selectedOptionValue1,
  selectedOptionValue2,
  ...props
}) => {
  const { user } = useUserContext();
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(selectedOptionValue1);
  const [errorMessage, setErrorMessage] = useState('');
  const [apps, setApps] = useState([]);
  const [deals, setDeals] = useState([]);
  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [codeTitle, codeTitleError, validateCodeTitle] =
    useInputValidation('code');
  const [codeDescription, codeDescriptionError, validateCodeDescription] =
    useInputValidation('description');
  const [codeUrl, codeUrlError, validateCodeUrl] = useInputValidation('url');
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  useEffect(() => {
    async function fetchApps() {
      const response = await fetch(`${apiURL()}/apps`);
      const examples = await response.json();
      setApps(examples);
    }
    fetchApps();
  }, []);

  useEffect(() => {
    async function fetchDeals(app) {
      const response = await fetch(`${apiURL()}/deals?app=${app}`);
      const examples = await response.json();
      setDeals(examples);
    }
    if (selectedApp) {
      fetchDeals(selectedApp);
    }
  }, [selectedApp]);

  const appOptions = apps
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((app) => app.title);

  const dealOptions = deals
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((deal) => deal.title);

  const addCode = async (code, description, url, dealId) => {
    const response = await fetch(`${apiURL()}/codes`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: code,
        description,
        url,
        deal_id: dealId,
      }),
    });
    const responseJson = await response.json();

    if (JSON.stringify(responseJson).includes('Error')) {
      setErrorMessage(responseJson);
    } else if (response.ok && !JSON.stringify(responseJson).includes('Error')) {
      setOpenConfirmationModal(true);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (
      codeTitleError ||
      codeTitle.length === 0 ||
      !selectedApp ||
      !selectedDeal
    ) {
      setInvalidForm(true);
      setValidForm(false);
    } else {
      setInvalidForm(false);
      setValidForm(true);
      addCode(codeTitle, codeDescription, codeUrl, selectedDeal);
    }
  };

  const setDropdownApp = (appName) => {
    const value = apps
      .filter((app) => app.title === appName.toString())
      .map((item) => item.id);
    setSelectedApp(value[0]);
  };

  const setDropdownDeal = (dealName) => {
    const value = deals
      .filter((deal) => deal.title === dealName.toString())
      .map((item) => item.id);
    setSelectedDeal(value[0]);
  };

  useEffect(() => {
    if (selectedOptionValue1) {
      const value = apps
        .filter((app) => app.title === selectedOptionValue1.toString())
        .map((item) => item.id);
      setSelectedApp(value[0]);
    }
  }, [apps, selectedOptionValue1]);

  useEffect(() => {
    if (selectedOptionValue2) {
      const value = deals
        .filter((deal) => deal.title === selectedOptionValue2.toString())
        .map((item) => item.id);
      setSelectedDeal(value[0]);
    }
  }, [deals, selectedOptionValue2]);

  return (
    <div className={`form-container add-app-container `}>
      <div className={`form-box submit-box ${className}`}>
        <form>
          <Dropdown
            label="an app"
            selectedOptionValue={selectedOptionValue1}
            options={appOptions}
            onSelect={(appName) => setDropdownApp(appName)}
            showFilterIcon={false}
            showLabel={false}
            required
          />
          {selectedApp && !selectedOptionValue1 && (
            <Dropdown
              label="a deal"
              selectedOptionValue={selectedOptionValue2}
              options={dealOptions}
              onSelect={(dealName) => setDropdownDeal(dealName)}
              showFilterIcon={false}
              showLabel={false}
              required
            />
          )}
          {selectedOptionValue1 && (
            <Dropdown
              label="a deal"
              selectedOptionValue={selectedOptionValue2}
              options={dealOptions}
              onSelect={(dealName) => setDropdownDeal(dealName)}
              showFilterIcon={false}
              showLabel={false}
              required
            />
          )}

          <TextFormTextarea
            value={codeTitle}
            placeholder="Your referral code"
            onChange={validateCodeTitle}
            error={codeTitleError}
            required
          />
          <TextFormTextarea
            value={codeUrl}
            placeholder="Referral code link (optional)"
            onChange={validateCodeUrl}
            error={codeUrlError}
          />
          <TextFormTextarea
            value={codeDescription}
            placeholder="Description (optional)"
            onChange={validateCodeDescription}
            error={codeDescriptionError}
          />
          <Button
            primary
            className="btn-add-prompt"
            onClick={handleSubmit}
            label="Add code"
          />
          {validForm && (
            <Modal
              title="Your code has been submitted!"
              open={openConfirmationModal}
              toggle={
                (() => setOpenConfirmationModal(false),
                () => window.location.reload(true))
              }
            />
          )}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {invalidForm && <p className="error-message">Form is not valid</p>}
        </form>
      </div>
    </div>
  );
};

FormNewCode.propTypes = { className: PropTypes.string };

FormNewCode.defaultProps = {
  className: null,
};
