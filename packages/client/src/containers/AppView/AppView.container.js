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
import { Dropdown } from '../../components/Dropdown/Dropdown.Component';
import TextFormTextarea from '../../components/Input/TextFormTextarea.component';
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
import { faHeart, faCopy } from '@fortawesome/free-regular-svg-icons';

import { apiURL } from '../../apiURL';
import './AppView.styles.css';
import { useUserContext } from '../../userContext';
import { FormNewCode } from '../../components/FormNewCode/FormNewCode.component';

export const AppView = () => {
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [animation, setAnimation] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const [app, setApp] = useState({});
  const [appDeals, setAppDeals] = useState([]);
  const [appAppStore, setAppAppStore] = useState({});
  const [similarApps, setSimilarApps] = useState([]);
  const [similarDealsFromApp, setSimilarDealsFromApp] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const { user } = useUserContext();
  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [comment, setComment] = useState('');
  const [allRatings, setAllRatings] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [searches, setSearches] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [openAddCodeForm, setOpenAddCodeForm] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  useEffect(() => {
    async function fetchSingleApp(appId) {
      const response = await fetch(`${apiURL()}/apps/${appId}`);
      const appResponse = await response.json();
      setApp(appResponse[0]);
    }

    async function fetchCodesForADeal(appId) {
      const response = await fetch(`${apiURL()}/deals/?app=${appId}`);
      const appResponse = await response.json();
      setAppDeals(appResponse);
    }

    // async function fetchSearchesForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/searches/?deal=${dealId}`);
    //   const appResponse = await response.json();
    //   setSearches(appResponse);
    // }

    // async function fetchKeywordsForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/keywords/?deal=${dealId}`);
    //   const appResponse = await response.json();
    //   setKeywords(appResponse);
    // }

    fetchSingleApp(id);
    fetchCodesForADeal(id);
    // fetchSearchesForADeal(id);
    // fetchKeywordsForADeal(id);
  }, [id]);

  useEffect(() => {
    async function fetchAppAppStore(appleId) {
      const response = await fetch(`${apiURL()}/appsAppStore/${appleId}`);
      const example = await response.json();
      setAppAppStore(example.results[0]);
    }
    app.apple_id && fetchAppAppStore(app.apple_id);
  }, [app.apple_id]);

  useEffect(() => {
    async function fetchSimilarApps() {
      const response = await fetch(`${apiURL()}/apps`);
      const appsResponse = await response.json();
      const similarAppsArray = appsResponse
        .filter((item) => item.topic_id === app.topic_id)
        .filter((item) => item.id !== app.id);
      setSimilarApps(similarAppsArray);
    }

    fetchSimilarApps();
  }, [app.topic_id, app.id, app.app_id]);

  // const fetchCommentsByAppId = useCallback(async (appId) => {
  //   const response = await fetch(`${apiURL()}/comments?appId=${appId}`);
  //   const commentResponse = await response.json();
  //   setComments(commentResponse);
  // }, []);

  // useEffect(() => {
  //   fetchCommentsByAppId(id);
  // }, [fetchCommentsByAppId, id]);

  const navigateBack = () => {
    navigate(-1);
  };

  // const addComment = async (commentContent) => {
  //   const response = await fetch(`${apiURL()}/comments`, {
  //     method: 'POST',
  //     headers: {
  //       token: `token ${user?.uid}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       content: commentContent,
  //       deal_id: id,
  //     }),
  //   });
  //   if (response.ok) {
  //     fetchCommentsByAppId(id);
  //   }
  // };

  // const commentHandler = (event) => {
  //   setComment(event.target.value);
  // };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   if (!comment) {
  //     setError('Comment is required!');
  //     setInvalidForm(true);
  //     setValidForm(false);
  //     return;
  //   }
  //   if (comment.trim().length < 5) {
  //     setError('Comment must be more than five characters!');
  //     setInvalidForm(true);
  //     setValidForm(false);
  //     return;
  //   }

  //   setInvalidForm(false);
  //   setValidForm(true);
  //   addComment(comment);
  //   setOpenConfirmationModal(true);
  //   setComment('');
  // };
  const getOnlyYearMonthDay = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const cardItems = similarApps.map((item) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <Card
        id={item.id}
        cardUrl={`/apps/${item.id}`}
        title={item.title}
        description={item.description}
        url={item.url}
        urlImage={item.url_image === null ? 'deal' : item.url_image}
        topic={item.topicTitle}
        smallCard
      />
    );
  });

  // const cardItemsSimilarDealsFromApp = similarDealsFromApp.map((item) => {
  //   return (
  //     <Card
  //       id={item.id}
  //       cardUrl={`/deals/${item.id}`}
  //       title={item.title}
  //       description={item.description}
  //       url={item.url}
  //       urlImage={item.url_image === null ? 'deal' : item.url_image}
  //       topic={item.topicTitle}
  //       appTitle={item.appTitle}
  //       smallCard
  //     />
  //   );
  // });

  // const searchItems = searches.map((search) => {
  //   return (
  //     <Link to={`../../deals/search/${search.id}`} target="_blank">
  //       <Button
  //         size="medium"
  //         secondary
  //         icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />}
  //         label={search.title}
  //       />
  //     </Link>
  //   );
  // });

  const fetchFavorites = useCallback(async () => {
    const url = `${apiURL()}/favorites`;
    const response = await fetch(url, {
      headers: {
        token: `token ${user?.uid}`,
      },
    });
    const favoritesData = await response.json();

    if (Array.isArray(favoritesData)) {
      setFavorites(favoritesData);
    } else {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (appId) => {
    const response = await fetch(`${apiURL()}/favorites`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deal_id: appId,
      }),
    });
    if (response.ok) {
      fetchFavorites();
    }
  };

  const handleDeleteBookmarks = (favoritesId) => {
    const deleteFavorites = async () => {
      const response = await fetch(`${apiURL()}/favorites/${favoritesId} `, {
        method: 'DELETE',
        headers: {
          token: `token ${user?.uid}`,
        },
      });

      if (response.ok) {
        fetchFavorites();
      }
    };

    deleteFavorites();
  };

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  const fetchAllRatings = useCallback(async () => {
    const url = `${apiURL()}/ratings`;
    const response = await fetch(url);
    const ratingsData = await response.json();
    setAllRatings(ratingsData);
  }, []);

  useEffect(() => {
    fetchAllRatings();
  }, [fetchAllRatings]);

  const fetchRatings = useCallback(async () => {
    const url = `${apiURL()}/ratings`;
    const response = await fetch(url, {
      headers: {
        token: `token ${user?.uid}`,
      },
    });
    const ratingsData = await response.json();

    if (Array.isArray(ratingsData)) {
      setRatings(ratingsData);
    } else {
      setRatings([]);
    }
  }, [user]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const addRating = async (appId) => {
    const response = await fetch(`${apiURL()}/ratings`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deal_id: appId,
      }),
    });
    if (response.ok) {
      fetchRatings();
      fetchAllRatings();
    }
  };

  const deleteRating = async (appId) => {
    const response = await fetch(`${apiURL()}/ratings/${appId}`, {
      method: 'DELETE',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      fetchRatings();
      fetchAllRatings();
    }
  };

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

  const appDealsInTitle = appDeals.map((i) => {
    return `(${i.title})`;
  });

  const showNumberOfDealsInTitle = (deals) => {
    let title;
    if (deals.length === 1) {
      title = 'deal';
    } else {
      title = 'deals';
    }

    return `${deals.length} ${title}`;
  };

  return (
    <>
      <Helmet>
        <title>{`${String(app.title).substring(0, 30)}${
          appDeals.length > 0 ? ` - ${showNumberOfDealsInTitle(appDeals)}` : ''
        } - Top App Deals`}</title>
        <meta
          name="description"
          content={`${app.title} - all deals, coupons, codes in one place`}
        />
      </Helmet>
      <main>
        <section className="container-appview">
          <div className="header">
            <h1 className="hero-header">
              {`${app.title} app
              ${
                appDeals.length > 0
                  ? ` - ${showNumberOfDealsInTitle(appDeals)}`
                  : ''
              }`}
            </h1>
            <h3>All deals, promo and referral codes</h3>
          </div>

          <img
            className={
              appAppStore.artworkUrl512 ? 'appview-icon' : 'appview-image'
            }
            alt={`${app.title}`}
            src={
              appAppStore.artworkUrl512
                ? `${appAppStore.artworkUrl512}`
                : `http://res.cloudinary.com/dgarvanzw/image/upload/q_auto,f_auto/deals/${
                    app.url_image === null ? 'deal' : app.url_image
                  }.${app.url_image === null ? 'svg' : 'png'}`
            }
          />

          {app.url && (
            <div className="container-deal-actions">
              {/* <div>
              {user && favorites.some((x) => x.id === app.id) ? (
                <button
                  type="button"
                  onClick={() => handleDeleteBookmarks(app.id)}
                  onKeyDown={() => handleDeleteBookmarks(app.id)}
                  className="button-bookmark"
                >
                  Remove deal from saved &nbsp;
                  <FontAwesomeIcon icon={faHeartSolid} size="lg" />
                </button>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => addFavorite(app.id)}
                  onKeyDown={() => addFavorite(app.id)}
                  className="button-bookmark"
                >
                  Save this deal &nbsp;
                  <FontAwesomeIcon icon={faHeart} size="lg" />
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
              <div className="container-appview-buttons">
                <Link to={app.url} target="_blank">
                  <Button
                    size="large"
                    secondary
                    icon={
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        size="sm"
                      />
                    }
                    label={`Visit ${app.title} website`}
                  />
                </Link>
              </div>
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
          )}

          <div className="container-codes">
            {appDeals.length > 0 ? (
              <>
                <div className="container-title">
                  <h2>
                    {app.title} -{' '}
                    {appDeals.length > 0
                      ? `${showNumberOfDealsInTitle(appDeals)}`
                      : ''}
                  </h2>
                </div>

                <div className="container-appview-codes-users">
                  {appDeals.map((deal) => {
                    return (
                      <div className="container-codes-users">
                        <div className="container-appview-codes">
                          {/* <Button
                            size="medium"
                            primary
                            icon={<FontAwesomeIcon icon={faCopy} />}
                            label={deal.title}
                            onClick={() => copyToClipboard(deal.title)}
                          />
                          <Toast
                            open={openToast}
                            overlayClass={`toast ${animation}`}
                          >
                            <span>Copied to clipboard!</span>
                          </Toast> */}
                          {/* {deal.url && (
                            <Link to={deal.url} target="_blank">
                              <Button
                                size="medium"
                                secondary
                                icon={
                                  <FontAwesomeIcon
                                    icon={faArrowUpRightFromSquare}
                                    size="sm"
                                  />
                                }
                                label="Use code!"
                              />
                            </Link>
                          )} */}
                          <Link to={`../../deals/${deal.id}`} target="_blank">
                            <Button
                              size="medium"
                              secondary
                              icon={
                                <FontAwesomeIcon
                                  icon={faArrowUpRightFromSquare}
                                  size="sm"
                                />
                              }
                              label={deal.title}
                            />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="container-title">
                <span>
                  <i>No deals yet for {app.title}</i> 😢
                </span>
              </div>
            )}
          </div>

          {!user && (
            <div className="container-details cta">
              <div>
                <h2>🔥 Add your own referral codes</h2>
                <p>Create an account to get started for free</p>
              </div>
              <div>
                <Link target="_blank" to="/signup">
                  <Button primary label="Create my account 👌" />
                </Link>
              </div>
            </div>
          )}
          {user && (
            <div
              className={`container-details cta cta-gap ${
                openAddCodeForm ? 'cta-code-form' : ''
              }`}
            >
              {openAddCodeForm && (
                <Button
                  secondary
                  type="button"
                  onClick={() => setOpenAddCodeForm(false)}
                  className="button-container-add-code"
                >
                  X
                </Button>
              )}
              <div className="container-header-referral-code">
                <h2 className="h-no-margin h-no-margin-bottom">
                  🔥 Add your referral code
                </h2>
              </div>

              {!openAddCodeForm && (
                <div>
                  <Button
                    primary
                    onClick={() => setOpenAddCodeForm(true)}
                    label="Add a code 👌"
                  />
                </div>
              )}

              {openAddCodeForm && (
                <>
                  <FormNewCode
                    selectedOptionValue1={[app.appTitle]}
                    selectedOptionValue2={[app.title]}
                    className="form-code-appview"
                  />
                  <Link target="_blank" className="link" to="/codes/new">
                    Add a code to other app
                  </Link>
                </>
              )}
            </div>
          )}

          {/* <div className="container-description">
            <div className="container-title">
              <h2>{app.title} app</h2>
            </div>
            <p className="app-description main-description">
              {app.description}
            </p>
          </div> */}
          {app.apple_id && appAppStore && (
            <div className="container-appview-box">
              <h2>{app?.title} app</h2>
              <p className="app-description">{appAppStore?.description}</p>
            </div>
          )}

          {app.url_app_store || app.url_google_play_store ? (
            <div className="container-appview-box">
              <h2>Download {app.appTitle} app</h2>
              <div className="container-store-logos">
                {app.url_app_store && (
                  <Link
                    target="_blank"
                    to={app.url_app_store}
                    className="simple-link"
                  >
                    <img
                      src={appStoreLogo}
                      alt="App Store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
                {app.url_google_play_store && (
                  <Link
                    target="_blank"
                    to={app.url_google_play_store}
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

          <div className="container-details container-badges">
            <div className="container-tags">
              <div className="badges">
                <p>Topic: </p>
                <div>
                  <Button label={app.topicTitle} size="small" />
                </div>
              </div>
              <div className="badges">
                <p>Category: </p>
                <div>
                  <Button label={app.categoryTitle} size="small" />
                </div>
              </div>
            </div>
            {/* {keywords.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Tags: </p>
                  <div className="badges-keywords">
                    {keywords.map((keyword) => (
                      <Badge label={keyword.title} size="small" />
                    ))}
                  </div>
                </div>
              </div>
            )} */}
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
                copyToClipboard(`https://www.topappdeals.com/apps/${app.id}`)
              }
            />
            <FacebookShareButton url={`/apps/${app.id}`}>
              <FontAwesomeIcon className="share-icon" icon={faFacebookF} />
            </FacebookShareButton>
            <TwitterShareButton
              url={`https://www.topappdeals.com/apps/${app.id}`}
              title={`Check out this GPT App: '${app.title}'`}
              hashtags={['Apps']}
            >
              <FontAwesomeIcon className="share-icon" icon={faTwitter} />
            </TwitterShareButton>
            <LinkedinShareButton
              url={`https://www.topappdeals.com/apps/${app.id}`}
            >
              <FontAwesomeIcon className="share-icon" icon={faLinkedinIn} />
            </LinkedinShareButton>
            <EmailShareButton
              subject="Check out this deal!"
              body={`This app deal is great: '${app.title}'`}
              url={`https://www.topappdeals.com/apps/${app.id}`}
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </EmailShareButton>
          </div>
          {/* <div className="container-comments">
            <h2 className="h-no-margin h-no-margin-bottom">Reviews</h2>
            {comments.length === 0 && (
              <div>
                <i>No reviews for {app.title}. </i>
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
              <p>Add your referral codes, bookmark you favorite deals</p>
            </div>
            <div>
              <Link target="_blank" to="/signup">
                <Button primary label="Create my account 👌" />
              </Link>
            </div>
          </div>
          {/* {similarDealsFromApp.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Other deals from {app.appTitle} app</h2>
              <div className="container-cards small-cards">
                {cardItemsSimilarDealsFromApp}
              </div>
            </div>
          )} */}
          {similarApps.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Alternative apps to {app.title}</h2>
              <div className="container-cards small-cards">{cardItems}</div>
            </div>
          )}
          {/* {searches.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Related searches</h2>
              <div className="container-related-searches">{searchItems}</div>
            </div>
          )} */}
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
