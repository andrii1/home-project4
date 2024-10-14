import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { apiURL } from '../../apiURL';
import Modal from '../../components/Modal/Modal.Component';
import useInputValidation from '../../utils/hooks/useInputValidation';
import TextFormTextarea from '../../components/Input/TextFormTextarea.component';
import { Dropdown } from '../../components/Dropdown/Dropdown.Component';
import { Button } from '../../components/Button/Button.component';
import './Submit.Style.css';
import { useUserContext } from '../../userContext';
import { FormNewCode } from '../../components/FormNewCode/FormNewCode.component';

export const Submit = () => {
  // const { user } = useUserContext();
  // const [selectedApp, setSelectedApp] = useState('');
  // const [selectedDeal, setSelectedDeal] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');
  // const [apps, setApps] = useState([]);
  // const [deals, setDeals] = useState([]);
  // const [validForm, setValidForm] = useState(false);
  // const [invalidForm, setInvalidForm] = useState(false);
  // const [codeTitle, codeTitleError, validateCodeTitle] =
  //   useInputValidation('code');
  // const [codeDescription, codeDescriptionError, validateCodeDescription] =
  //   useInputValidation('description');
  // const [codeUrl, codeUrlError, validateCodeUrl] = useInputValidation('url');
  // const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  // useEffect(() => {
  //   async function fetchApps() {
  //     const response = await fetch(`${apiURL()}/apps`);
  //     const examples = await response.json();
  //     setApps(examples);
  //   }
  //   fetchApps();
  // }, []);

  // useEffect(() => {
  //   async function fetchDeals(app) {
  //     const response = await fetch(`${apiURL()}/deals?app=${app}`);
  //     const examples = await response.json();
  //     setDeals(examples);
  //   }
  //   if (selectedApp) {
  //     fetchDeals(selectedApp);
  //   }
  // }, [selectedApp]);

  // const appOptions = apps
  //   .sort((a, b) => a.title.localeCompare(b.title))
  //   .map((app) => app.title);

  // const dealOptions = deals
  //   .sort((a, b) => a.title.localeCompare(b.title))
  //   .map((deal) => deal.title);

  // const addCode = async (code, description, url, dealId) => {
  //   const response = await fetch(`${apiURL()}/codes`, {
  //     method: 'POST',
  //     headers: {
  //       token: `token ${user?.uid}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       title: code,
  //       description,
  //       url,
  //       deal_id: dealId,
  //     }),
  //   });
  //   const responseJson = await response.json();

  //   if (JSON.stringify(responseJson).includes('Error')) {
  //     setErrorMessage(responseJson);
  //   } else if (response.ok && !JSON.stringify(responseJson).includes('Error')) {
  //     setOpenConfirmationModal(true);
  //   }
  // };
  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   if (
  //     codeTitleError ||
  //     codeTitle.length === 0 ||
  //     !selectedApp ||
  //     !selectedDeal
  //   ) {
  //     setInvalidForm(true);
  //     setValidForm(false);
  //   } else {
  //     setInvalidForm(false);
  //     setValidForm(true);
  //     addCode(codeTitle, codeDescription, codeUrl, selectedDeal);
  //   }
  // };

  // const setDropdownApp = (appName) => {
  //   const value = apps
  //     .filter((app) => app.title === appName.toString())
  //     .map((item) => item.id);
  //   setSelectedApp(value[0]);
  // };

  // const setDropdownDeal = (dealName) => {
  //   const value = deals
  //     .filter((deal) => deal.title === dealName.toString())
  //     .map((item) => item.id);
  //   setSelectedDeal(value[0]);
  // };

  return (
    <>
      <Helmet>
        <title>Add referral code - Top App Deals</title>
      </Helmet>
      <main>
        <div className="hero">
          <h1 className="hero-header">Add your referral code</h1>
        </div>
        <FormNewCode />
      </main>
    </>
  );
};
