import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { apiURL } from '../../apiURL';
import Modal from '../../components/Modal/Modal.Component';
import useInputValidation from '../../utils/hooks/useInputValidation';
import TextFormTextarea from '../../components/Input/TextFormTextarea.component';
import { Dropdown } from '../../components/Dropdown/Dropdown.Component';
import { Button } from '../../components/Button/Button.component';
import './SubmitQuestion.Style.css';
import { useUserContext } from '../../userContext';
import { FormNewCode } from '../../components/FormNewCode/FormNewCode.component';

export const SubmitQuestion = () => {
  const { user } = useUserContext();
  const [errorMessage, setErrorMessage] = useState('');

  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [questionTitle, questionTitleError, validateQuestionTitle] =
    useInputValidation('code');
  const [
    questionDescription,
    questionDescriptionError,
    validateQuestionDescription,
  ] = useInputValidation('description');

  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

  const addQuestion = async (title, description) => {
    const response = await fetch(`${apiURL()}/questions`, {
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
    if (questionTitleError || questionTitle.length === 0) {
      setInvalidForm(true);
      setValidForm(false);
    } else {
      setInvalidForm(false);
      setValidForm(true);
      addQuestion(questionTitle, questionDescription);
    }
  };
  return (
    <>
      <Helmet>
        <title>Add referral code - Top App Deals</title>
      </Helmet>
      <main>
        <div className="hero">
          <h1 className="hero-header">Ask your question</h1>
        </div>
        <div className={`form-container add-app-container `}>
          <div className={`form-box submit-box`}>
            <form>
              <TextFormTextarea
                value={questionTitle}
                placeholder="Your question"
                onChange={validateQuestionTitle}
                error={questionTitleError}
                required
              />

              <TextFormTextarea
                value={questionDescription}
                placeholder="Description (optional)"
                onChange={validateQuestionDescription}
                error={questionDescriptionError}
              />
              <Button
                primary
                className="btn-add-prompt"
                onClick={handleSubmit}
                label="Submit"
              />
              {validForm && (
                <Modal
                  title="Your question has been submitted!"
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
        </div>
      </main>
    </>
  );
};
