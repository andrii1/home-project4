/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '../../components/Button/Button.component';
import { Badge } from '../../components/Badge/Badge.component';
import { Card } from '../../components/Card/Card.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../../components/Modal/Modal.Component';
import iconCopy from '../../assets/images/icons8-copy-24.png';
import appStoreLogo from '../../assets/images/download-on-the-app-store-apple-logo.svg';
import googlePlayStoreLogo from '../../assets/images/google-play-badge-logo.svg';
import Toast from '../../components/Toast/Toast.Component';
import {
  faEnvelope,
  faLink,
  faCaretUp,
  faArrowUpRightFromSquare,
  faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from 'react-share';
import appImage from '../../assets/images/app-placeholder.svg';
import { faHeart } from '@fortawesome/free-regular-svg-icons';

import { apiURL } from '../../apiURL';
import './CodeView.styles.css';
import { useUserContext } from '../../userContext';

export const CodeView = () => {
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [animation, setAnimation] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const [code, setCode] = useState({});
  const [appAppStore, setAppAppStore] = useState({});
  const [similarCodes, setSimilarCodes] = useState([]);
  const [similarCodesFromDeal, setSimilarCodesFromDeal] = useState([]);
  const [similarCodesFromApp, setSimilarCodesFromApp] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const { user } = useUserContext();
  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [comment, setComment] = useState('');
  const [allRatings, setAllRatings] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  useEffect(() => {
    async function fetchSingleCode(codeId) {
      const response = await fetch(`${apiURL()}/codes/${codeId}`);
      const appResponse = await response.json();
      setCode(appResponse[0]);
    }

    fetchSingleCode(id);
  }, [id]);

  useEffect(() => {
    async function fetchSimilarApps() {
      const response = await fetch(`${apiURL()}/codes`);
      const appsResponse = await response.json();

      const similarCodesArray = appsResponse
        .filter((item) => item.topic_id === code.topic_id)
        .filter((item) => item.appId !== code.appId)
        .filter((item) => item.id !== code.id);
      setSimilarCodes(similarCodesArray);

      const similarCodesFromAppArray = appsResponse
        .filter((item) => item.appId === code.appId)
        .filter((item) => item.id !== code.id);
      setSimilarCodesFromApp(similarCodesFromAppArray);

      const similarCodesFromDealArray = appsResponse
        .filter((item) => item.deal_id === code.deal_id)
        .filter((item) => item.id !== code.id);
      setSimilarCodesFromDeal(similarCodesFromDealArray);
    }

    fetchSimilarApps();
  }, [code.topic_id, code.id, code.app_id, code.deal_id, code.appId]);

  const fetchCommentsByAppId = useCallback(async (appId) => {
    const response = await fetch(`${apiURL()}/comments?appId=${appId}`);
    const commentResponse = await response.json();
    setComments(commentResponse);
  }, []);

  useEffect(() => {
    fetchCommentsByAppId(id);
  }, [fetchCommentsByAppId, id]);

  const navigateBack = () => {
    navigate(-1);
  };

  const addComment = async (commentContent) => {
    const response = await fetch(`${apiURL()}/comments`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentContent,
        deal_id: id,
      }),
    });
    if (response.ok) {
      fetchCommentsByAppId(id);
    }
  };

  const commentHandler = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!comment) {
      setError('Comment is required!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }
    if (comment.trim().length < 5) {
      setError('Comment must be more than five characters!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }

    setInvalidForm(false);
    setValidForm(true);
    addComment(comment);
    setOpenConfirmationModal(true);
    setComment('');
  };
  const getOnlyYearMonthDay = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    // React Router v6+ keeps track of navigation index
    setHasPreviousPage(window.history.state && window.history.state.idx > 0);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  // const fetchFavorites = useCallback(async () => {
  //   const url = `${apiURL()}/favorites`;
  //   const response = await fetch(url, {
  //     headers: {
  //       token: `token ${user?.uid}`,
  //     },
  //   });
  //   const favoritesData = await response.json();

  //   if (Array.isArray(favoritesData)) {
  //     setFavorites(favoritesData);
  //   } else {
  //     setFavorites([]);
  //   }
  // }, [user]);

  // useEffect(() => {
  //   fetchFavorites();
  // }, [fetchFavorites]);

  // const addFavorite = async (appId) => {
  //   const response = await fetch(`${apiURL()}/favorites`, {
  //     method: 'POST',
  //     headers: {
  //       token: `token ${user?.uid}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       deal_id: appId,
  //     }),
  //   });
  //   if (response.ok) {
  //     fetchFavorites();
  //   }
  // };

  // const handleDeleteBookmarks = (favoritesId) => {
  //   const deleteFavorites = async () => {
  //     const response = await fetch(`${apiURL()}/favorites/${favoritesId} `, {
  //       method: 'DELETE',
  //       headers: {
  //         token: `token ${user?.uid}`,
  //       },
  //     });

  //     if (response.ok) {
  //       fetchFavorites();
  //     }
  //   };

  //   deleteFavorites();
  // };

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  // const fetchAllRatings = useCallback(async () => {
  //   const url = `${apiURL()}/ratings`;
  //   const response = await fetch(url);
  //   const ratingsData = await response.json();
  //   setAllRatings(ratingsData);
  // }, []);

  // useEffect(() => {
  //   fetchAllRatings();
  // }, [fetchAllRatings]);

  // const fetchRatings = useCallback(async () => {
  //   const url = `${apiURL()}/ratings`;
  //   const response = await fetch(url, {
  //     headers: {
  //       token: `token ${user?.uid}`,
  //     },
  //   });
  //   const ratingsData = await response.json();

  //   if (Array.isArray(ratingsData)) {
  //     setRatings(ratingsData);
  //   } else {
  //     setRatings([]);
  //   }
  // }, [user]);

  // useEffect(() => {
  //   fetchRatings();
  // }, [fetchRatings]);

  // const addRating = async (appId) => {
  //   const response = await fetch(`${apiURL()}/ratings`, {
  //     method: 'POST',
  //     headers: {
  //       token: `token ${user?.uid}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       deal_id: appId,
  //     }),
  //   });
  //   if (response.ok) {
  //     fetchRatings();
  //     fetchAllRatings();
  //   }
  // };

  // const deleteRating = async (appId) => {
  //   const response = await fetch(`${apiURL()}/ratings/${appId}`, {
  //     method: 'DELETE',
  //     headers: {
  //       token: `token ${user?.uid}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   if (response.ok) {
  //     fetchRatings();
  //     fetchAllRatings();
  //   }
  // };

  const copyToClipboard = (item) => {
    navigator.clipboard.writeText(item);
    setOpenToast(true);
    setAnimation('open-animation');

    setTimeout(() => {
      setAnimation('close-animation');
    }, 2000);
    setTimeout(() => {
      setOpenToast(false);
    }, 2500);
  };
  console.log('code1', code);

  return (
    <>
      <Helmet>
        <title>
          {`${code.dealTitleCode ? code.dealTitleCode : code.dealTitle} (${
            code.title
          }) - Top App Deals`}
        </title>
        <meta
          name="description"
          content={`${
            code.dealTitleCode ? code.dealTitleCode : code.dealTitle
          } - use it now!`}
        />
      </Helmet>
      <main>
        <section className="container-appview container-code">
          <div className="header">
            {hasPreviousPage && (
              <button
                type="button"
                onClick={handleGoBack}
                className="btn-no-style"
              >
                ← Go back
              </button>
            )}
            <h1 className="hero-header">{`${
              code.dealTitleCode ? code.dealTitleCode : code.dealTitle
            } (${code.title})`}</h1>
            {/* <h3>{app.appTitle} code</h3> */}
          </div>

          <img
            className="appview-image"
            alt={`${code.title}`}
            src={`http://res.cloudinary.com/dgarvanzw/image/upload/q_auto,f_auto/deals/${
              code.url_image === null ? 'deal' : code.url_image
            }.${code.url_image === null ? 'svg' : 'png'}`}
          />

          <div className="container-bookmark">
            <div className="container-appview-buttons">
              {code.url && (
                <Link to={code.url} target="_blank">
                  <Button
                    size="large"
                    primary
                    icon={
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        size="sm"
                      />
                    }
                    label="Link"
                  />
                </Link>
              )}

              <Button
                size="large"
                secondary
                icon={
                  <img
                    src={iconCopy}
                    alt="copy"
                    className="icon-copy copy-referral-code"
                  />
                }
                label={code.title}
                onClick={() => copyToClipboard(code.title)}
              />
              <Toast open={openToast} overlayClass={`toast ${animation}`}>
                <span>Copied to clipboard!</span>
              </Toast>
            </div>

            {/* <div>
              {user && favorites.some((x) => x.id === app.id) ? (
                <button
                  type="button"
                  onClick={() => handleDeleteBookmarks(app.id)}
                  onKeyDown={() => handleDeleteBookmarks(app.id)}
                  className="button-bookmark"
                >
                  Remove from saved{' '}
                  <FontAwesomeIcon icon={faHeartSolid} size="lg" />
                </button>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => addFavorite(app.id)}
                  onKeyDown={() => addFavorite(app.id)}
                  className="button-bookmark"
                >
                  Save <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to add bookmarks');
                  }}
                  onKeyDown={() => addFavorite(app.id)}
                  className="button-bookmark"
                >
                  Save <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
              )}
            </div> */}
          </div>
          <div className="container-description">
            <div className="container-title">
              <h2>
                {code.title} code in {code.appTitle} app
              </h2>
              {/* <div className="container-rating">
                Rating
                {user &&
                allRatings.some((rating) => rating.deal_id === app.id) &&
                ratings.some((rating) => rating.id === app.id) ? (
                  <button
                    type="button"
                    className="button-rating"
                    onClick={(event) => deleteRating(app.id)}
                  >
                    <FontAwesomeIcon icon={faCaretUp} />
                    {
                      allRatings.filter((rating) => rating.deal_id === app.id)
                        .length
                    }
                  </button>
                ) : user ? (
                  <button
                    type="button"
                    className="button-rating"
                    onClick={(event) => addRating(app.id)}
                  >
                    <FontAwesomeIcon icon={faCaretUp} />
                    {
                      allRatings.filter((rating) => rating.deal_id === app.id)
                        .length
                    }
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button-rating"
                    onClick={() => {
                      setOpenModal(true);
                      setModalTitle('Sign up to vote');
                    }}
                  >
                    <FontAwesomeIcon icon={faCaretUp} />
                    {
                      allRatings.filter((rating) => rating.deal_id === app.id)
                        .length
                    }
                  </button>
                )}

              </div> */}
            </div>
            {code.description && (
              <>
                <h3>Code details</h3>
                <p className="app-description">{code.description}</p>
              </>
            )}
            <p className="app-description main-description">
              {code.dealDescription}
            </p>
          </div>
          <div className="container-appview-box">
            <h2>All {code.appTitle} codes </h2>
            <div>
              <Link to={`/deals/${code.deal_id}`} target="_blank">
                <Button
                  size="large"
                  secondary
                  icon={
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      size="sm"
                    />
                  }
                  label={`All ${code.dealTitle}`}
                />
              </Link>
            </div>
          </div>
          {code.appUrlAppStore || code.appUrlGooglePlayStore ? (
            <div className="container-appview-box">
              <h2>Download {code.appTitle} app</h2>
              <div className="container-store-logos">
                {code.appUrlAppStore && (
                  <Link
                    target="_blank"
                    to={code.appUrlAppStore}
                    className="simple-link"
                  >
                    <img
                      src={appStoreLogo}
                      alt="App Store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
                {code.appUrlGooglePlayStore && (
                  <Link
                    target="_blank"
                    to={code.appUrlGooglePlayStore}
                    className="simple-link"
                  >
                    <img
                      src={googlePlayStoreLogo}
                      alt="Google Play store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            ''
          )}

          {code.appUrl && (
            <div className="container-appview-box">
              <Link to={code.appUrl} target="_blank">
                <Button
                  size="large"
                  secondary
                  icon={
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      size="sm"
                    />
                  }
                  label={`Visit ${code.appTitle} website`}
                />
              </Link>
            </div>
          )}

          {/* {code.contact && (
            <div className="container-appview-box">
              <h2>{code.title} support</h2>
              <div>
                <Link to={`mailto:${code.contact}`} target="_blank">
                  <Button
                    secondary
                    icon={<FontAwesomeIcon icon={faEnvelope} size="sm" />}
                    label={`Contact ${code.appTitle} support`}
                  />
                </Link>
              </div>
            </div>
          )} */}
          <div className="container-details container-badges">
            <div className="container-tags">
              <div className="badges">
                <p>Deal: </p>
                <div>
                  <Link to={`/deals/${code.deal_id}`} target="_blank">
                    <Button secondary label={code.dealTitle} size="small" />
                  </Link>
                </div>
              </div>
              <div className="badges">
                <p>App: </p>
                <div>
                  <Button secondary label={code.appTitle} size="small" />
                </div>
              </div>
            </div>
            <div className="container-tags">
              <div className="badges">
                <p>Tagged: </p>
                <div>
                  <Button secondary label={code.topicTitle} size="small" />
                </div>
              </div>
              <div className="badges">
                <p>Category: </p>
                <div>
                  <Button secondary label={code.categoryTitle} size="small" />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="container-related-searches">
            <h3>Related searches</h3>
            <div className="topics-div searches">
              {searches.map((search) => (
                <Link to={`/apps/search/${search.id}`} target="_blank">
                  <Button secondary label={search.title} />
                </Link>
              ))}
            </div>
          </div> */}
          <div className="icons-apps-page">
            <span>Share it: </span>
            <FontAwesomeIcon
              icon={faLink}
              className="button-copy"
              onClick={() =>
                copyToClipboard(`https://www.topappdeals.com/codes/${code.id}`)
              }
            />
            <FacebookShareButton url={`/codes/${code.id}`}>
              <FontAwesomeIcon className="share-icon" icon={faFacebookF} />
            </FacebookShareButton>
            <TwitterShareButton
              url={`https://www.topappdeals.com/codes/${code.id}`}
              title={`Check out this referral code for ${code.appTitle}: '${code.title}'`}
              hashtags={['Codes']}
            >
              <FontAwesomeIcon className="share-icon" icon={faTwitter} />
            </TwitterShareButton>
            <LinkedinShareButton
              url={`https://www.topappdeals.com/codes/${code.id}`}
            >
              <FontAwesomeIcon className="share-icon" icon={faLinkedinIn} />
            </LinkedinShareButton>
            <EmailShareButton
              subject={`${code.appTitle} referral code ${code.title}`}
              body={`Use this code in ${code.appTitle} app: ${code.title}`}
              url={`https://www.topappdeals.com/codes/${code.id}`}
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </EmailShareButton>
          </div>
          {/* <div className="container-comments">
            {comments.length === 0 && (
              <div>
                <i>No reviews for {code.title}. </i>
                {user && <i>Add a first one below.</i>}
              </div>
            )}
            {comments.length > 0 &&
              comments.map((item) => (
                <div className="form-container">
                  <div className="comment-box submit-box-new-comment">
                    <div>{item.content}</div>
                    <div className="comment-author-date">{`by ${
                      item.full_name
                    } on ${getOnlyYearMonthDay(item.created_at)}`}</div>
                  </div>
                </div>
              ))}
            {!user && (
              <div>
                <i>
                  <br />
                  <Link to="/signup" className="simple-link">
                    Sign up
                  </Link>{' '}
                  or{' '}
                  <Link to="/login" className="simple-link">
                    log in
                  </Link>{' '}
                  to add reviews
                </i>
              </div>
            )}
            {user && (
              <div className="form-container">
                <div className="comment-box submit-box">
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="form-input textarea-new-comment"
                      value={comment}
                      placeholder="Your review"
                      onChange={commentHandler}
                    />

                    <Button
                      primary
                      className="btn-add-prompt"
                      type="submit"
                      label="Add review"
                    />
                    {validForm && (
                      <Modal
                        title="Your review has been submitted!"
                        open={openConfirmationModal}
                        toggle={() => setOpenConfirmationModal(false)}
                      />
                    )}
                    {invalidForm && <p className="error-message">{error}</p>}
                  </form>
                </div>
              </div>
            )}
          </div> */}
          <div className="container-details cta">
            <div>
              <h2>🔥 Create a free account</h2>
              <p>And bookmark you favorite deals</p>
            </div>
            <div>
              <Link target="_blank" to="/signup">
                <Button primary label="Create my account 👌" />
              </Link>
            </div>
          </div>
          {similarCodesFromDeal.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Other {code.dealTitle}s</h2>
              <div className="container-cards small-cards">
                {similarCodesFromDeal.map((item) => {
                  return (
                    <Card
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      url={item.url}
                      urlImage={
                        item.url_image === null ? 'deal' : item.url_image
                      }
                      topic={item.topicTitle}
                      appTitle={item.appTitle}
                      smallCard
                    />
                  );
                })}
              </div>
            </div>
          )}
          {similarCodesFromApp.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Other codes from {code.appTitle}s</h2>
              <div className="container-cards small-cards">
                {similarCodesFromApp.map((item) => {
                  return (
                    <Card
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      url={item.url}
                      urlImage={
                        item.url_image === null ? 'deal' : item.url_image
                      }
                      topic={item.topicTitle}
                      appTitle={item.appTitle}
                      smallCard
                    />
                  );
                })}
              </div>
            </div>
          )}
          {similarCodes.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Other codes in {code.topicTitle}</h2>
              <div className="container-cards small-cards">
                {similarCodes.map((item) => {
                  return (
                    <Card
                      id={item.id}
                      title={`${item.dealTitle} (${item.title})`}
                      cardUrl={`/codes/${item.id}`}
                      description={item.description}
                      url={item.url}
                      urlImage={
                        item.url_image === null ? 'deal' : item.url_image
                      }
                      topic={item.topicTitle}
                      appTitle={item.appTitle}
                      smallCard
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>
        <Modal title={modalTitle} open={openModal} toggle={toggleModal}>
          <Link to="/signup">
            <Button primary label="Create an account" />
          </Link>
          or
          <Link to="/login">
            <Button secondary label="Log in" />
          </Link>
        </Modal>
      </main>
    </>
  );
};
