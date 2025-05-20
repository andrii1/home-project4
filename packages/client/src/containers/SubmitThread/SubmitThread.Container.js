import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { apiURL } from '../../apiURL';
import Modal from '../../components/Modal/Modal.Component';
import useInputValidation from '../../utils/hooks/useInputValidation';
import TextFormTextarea from '../../components/Input/TextFormTextarea.component';
import { Dropdown } from '../../components/Dropdown/Dropdown.Component';
import { Button } from '../../components/Button/Button.component';
import './SubmitThread.Style.css';
import { useUserContext } from '../../userContext';
import { FormNewCode } from '../../components/FormNewCode/FormNewCode.component';

export const SubmitThread = () => {
  const { user } = useUserContext();
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [threadTitle, threadTitleError, validateThreadTitle] =
    useInputValidation('code');
  const [threadDescription, threadDescriptionError, validateThreadDescription] =
    useInputValidation('description');

  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

  const addThread = async (title, description) => {
    const response = await fetch(`${apiURL()}/threads`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content: description,
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
    if (threadTitleError || threadTitle.length === 0) {
      setInvalidForm(true);
      setValidForm(false);
    } else {
      setInvalidForm(false);
      setValidForm(true);
      addThread(threadTitle, threadDescription);
    }
  };

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>Add referral code - Top App Deals</title>
      </Helmet>
      <main>
        <div className="hero">
          <h1 className="hero-header">New thread</h1>
        </div>
        <div className="form-container add-app-container add-thread">
          <div className="form-box submit-box">
            <form>
              <TextFormTextarea
                value={threadTitle}
                placeholder="Your thread"
                onChange={validateThreadTitle}
                error={threadTitleError}
                required
              />

              <TextFormTextarea
                value={threadDescription}
                placeholder="Description (optional)"
                onChange={validateThreadDescription}
                error={threadDescriptionError}
              />
              <Button
                primary
                className="btn-add-prompt"
                onClick={handleSubmit}
                label="Submit"
              />
              {validForm && (
                <Modal
                  title="Your thread has been submitted!"
                  open={openConfirmationModal}
                  toggle={
                    (() => setOpenConfirmationModal(false),
                    () => window.location.reload(true))
                  }
                >
                  <Link to="../community" />
                </Modal>
              )}
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              {invalidForm && (
                <p className="error-message">Form is not valid</p>
              )}
            </form>
          </div>
          <Button onClick={navigateBack} label="Back to threads" secondary />
        </div>
      </main>
    </>
  );
};
