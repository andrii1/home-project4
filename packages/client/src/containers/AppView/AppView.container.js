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
import './AppView.styles.css';
import { useUserContext } from '../../userContext';

const searches = [
  { id: 1, title: 'ai tool' },
  { id: 2, title: 'avatar creator' },
  {
    id: 3,
    title: 'ai music',
  },
];

const alternativeApps = [
  {
    id: 1,
    title: '10web',
    description:
      'Create a website using AI Website Builder,\nhost it on 10Web Hosting, and optimize it with\nPageSpeed Booster.',
    rating: null,
    topic_id: 6,
    url: 'https://10web.io',
    pricing_type: 'Paid with free trial',
    url_x: 'https://twitter.com/10Web_io',
    url_discord: null,
    url_app_store: null,
    url_google_play_store: null,
    url_chrome_extension: null,
    url_small_screenshot: 'Free',
    url_large_screenshot: null,
    user_id: null,
    created_at: '2023-10-13T08:43:58.072Z',
    topicTitle: 'Website builders',
    category_id: 4,
    categoryTitle: 'Engineering & Development',
  },
  {
    id: 2,
    title: 'TLDV',
    description:
      'Short for "too long; didn\'t view."\n\nThis AI platform saves you time by taking meeting notes for you.\n\nSit back and relax as tl;dv transcribes and summarizes your calls automatically.',
    rating: null,
    topic_id: 17,
    url: 'https://tldv.io',
    pricing_type: 'Paid with free plan',
    url_x: 'https://twitter.com/tldview?lang=en',
    url_discord: null,
    url_app_store: null,
    url_google_play_store: null,
    url_chrome_extension:
      'https://chrome.google.com/webstore/detail/record-transcribe-chatgpt/lknmjhcajhfbbglglccadlfdjbaiifig',
    url_small_screenshot: 'Paid with a free plan',
    url_large_screenshot: null,
    user_id: null,
    created_at: '2023-10-13T08:43:58.083Z',
    topicTitle: 'Meetings',
    category_id: 1,
    categoryTitle: 'Work & Productivity',
  },
  {
    id: 3,
    title: 'Klap',
    description:
      'Turn videos into viral shorts\nGet ready-to-publish TikToks, Reels, Shorts from YouTube videos in a click',
    rating: null,
    topic_id: 7,
    url: 'https://klap.app',
    pricing_type: 'Paid',
    url_x: 'https://twitter.com/tldview?lang=en',
    url_discord: null,
    url_app_store: null,
    url_google_play_store: null,
    url_chrome_extension: null,
    url_small_screenshot: 'Paid with a free trial',
    url_large_screenshot: null,
    user_id: null,
    created_at: '2023-10-13T08:43:58.088Z',
    topicTitle: 'Video',
    category_id: 2,
    categoryTitle: 'Marketing & Sales',
  },
];
export const AppView = () => {
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [animation, setAnimation] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const [app, setApp] = useState({});
  const [dealCodes, setDealCodes] = useState([]);
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
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  useEffect(() => {
    async function fetchSingleApp(appId) {
      const response = await fetch(`${apiURL()}/deals/${appId}`);
      const appResponse = await response.json();
      setApp(appResponse[0]);
    }

    async function fetchCodesForASingleDeal(dealId) {
      const response = await fetch(`${apiURL()}/codes/?deal=${dealId}`);
      const appResponse = await response.json();
      setDealCodes(appResponse);
    }

    fetchSingleApp(id);
    fetchCodesForASingleDeal(id);
  }, [id]);

  console.log('codesForADeal', dealCodes);

  useEffect(() => {
    async function fetchAppAppStore(appleId) {
      const response = await fetch(`${apiURL()}/appsAppStore/${appleId}`);
      const example = await response.json();
      setAppAppStore(example.results[0]);
    }
    app.appAppleId && fetchAppAppStore(app.appAppleId);
  }, [app.appAppleId]);

  useEffect(() => {
    async function fetchSimilarApps() {
      const response = await fetch(`${apiURL()}/deals`);
      const appsResponse = await response.json();
      const similarAppsArray = appsResponse
        .filter((item) => item.appTopicId === app.topic_id)
        .filter((item) => item.app_id !== app.app_id)
        .filter((item) => item.id !== app.id);
      setSimilarApps(similarAppsArray);

      const similarDealsFromAppArray = appsResponse
        .filter((item) => item.app_id === app.app_id)
        .filter((item) => item.id !== app.id);
      setSimilarDealsFromApp(similarDealsFromAppArray);
    }

    fetchSimilarApps();
  }, [app.topic_id, app.id, app.app_id]);

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

  const cardItems = similarApps.map((item) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <Card
        id={item.id}
        cardUrl={`/deals/${item.id}`}
        title={item.title}
        description={item.description}
        url={item.url}
        urlImage={item.url_image === null ? 'deal' : item.url_image}
        topic={item.topicTitle}
        appTitle={item.appTitle}
        smallCard
      />
    );
  });

  const cardItemsSimilarDealsFromApp = similarDealsFromApp.map((item) => {
    return (
      <Card
        id={item.id}
        cardUrl={`/deals/${item.id}`}
        title={item.title}
        description={item.description}
        url={item.url}
        urlImage={item.url_image === null ? 'deal' : item.url_image}
        topic={item.topicTitle}
        appTitle={item.appTitle}
        smallCard
      />
    );
  });

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

  const showDealCodesInTitle = (codes) => {
    let list;
    if (codes.length === 1) {
      list = codes.map((i) => {
        return `(${i.title})`;
      });
    } else if (codes.length === 2) {
      list = codes.map((i, index) => {
        return index === codes.length - 1 ? `(${i.title})` : `(${i.title}), `;
      });
    } else {
      list = codes.slice(0, 3).map((i, index) => {
        return index === 2 ? `(${i.title})` : `(${i.title}), `;
      });
    }

    return `${list}`;
  };

  const showNumberOfCodesInTitle = (codes) => {
    let title;
    if (codes.length === 1) {
      title = 'code';
    } else {
      title = 'codes';
    }

    return `${codes.length} ${title}`;
  };

  return (
    <>
      <Helmet>
        <title>{`${String(app.title).substring(0, 50)} ${
          dealCodes.length > 0
            ? `${showDealCodesInTitle(dealCodes)} - ${showNumberOfCodesInTitle(
                dealCodes,
              )}`
            : ''
        } - Top App Deals`}</title>
        <meta
          name="description"
          content={`${app.appTitle} referral code free, ${app.appTitle} refer a friend, ${app.appTitle} app discount, ${app.appTitle} rewards, ${app.appTitle} coupon code.`}
        />
      </Helmet>
      <main>
        <section className="container-appview">
          <div className="header">
            <h1 className="hero-header">
              {app.title}{' '}
              {dealCodes.length > 0
                ? `${showDealCodesInTitle(
                    dealCodes,
                  )} - ${showNumberOfCodesInTitle(dealCodes)}`
                : ''}
            </h1>
            <h3>{app.appTitle} deal</h3>
          </div>

          <img
            className="appview-image"
            alt={`${app.title}`}
            src={`http://res.cloudinary.com/dgarvanzw/image/upload/q_auto,f_auto/deals/${
              app.url_image === null ? 'deal' : app.url_image
            }.${app.url_image === null ? 'svg' : 'png'}`}
          />

          <div className="container-deal-actions">
            <div>
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
            </div>
            <div className="container-appview-buttons">
              {app.appUrl && (
                <Link to={app.appUrl} target="_blank">
                  <Button
                    size="large"
                    secondary
                    icon={
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        size="sm"
                      />
                    }
                    label={`Visit ${app.appTitle} website`}
                  />
                </Link>
              )}
            </div>
            <div className="container-rating">
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
            </div>
          </div>

          {dealCodes.length > 0 && (
            <div className="container-codes">
              <div className="container-title">
                <h2>
                  {app.title} -{' '}
                  {dealCodes.length > 0
                    ? `${showNumberOfCodesInTitle(dealCodes)}`
                    : ''}
                </h2>
              </div>

              <div className="container-appview-buttons">
                {dealCodes.map((code) => {
                  return (
                    <>
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
                          label="Use this code!"
                        />
                      </Link>
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
                        label={app.referral_code}
                        onClick={() => copyToClipboard(app.referral_code)}
                      />
                      <Toast
                        open={openToast}
                        overlayClass={`toast ${animation}`}
                      >
                        <span>Copied to clipboard!</span>
                      </Toast>
                    </>
                  );
                })}
              </div>
            </div>
          )}

          <div className="container-description">
            <div className="container-title">
              <h2>
                {app.title} in {app.appTitle} app
              </h2>
            </div>
            <p className="app-description main-description">
              {app.description}
            </p>

            {app.description_long && (
              <>
                <h3>Deal details</h3>
                <p className="app-description">{app.description_long}</p>
              </>
            )}
          </div>

          {app.appUrlAppStore || app.appUrlGooglePlayStore ? (
            <div className="container-appview-box">
              <h2>Download {app.appTitle} app</h2>
              <div className="container-store-logos">
                {app.appUrlAppStore && (
                  <Link
                    target="_blank"
                    to={app.appUrlAppStore}
                    className="simple-link"
                  >
                    <img
                      src={appStoreLogo}
                      alt="App Store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
                {app.appUrlGooglePlayStore && (
                  <Link
                    target="_blank"
                    to={app.appUrlGooglePlayStore}
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

          {app.appAppleId && appAppStore && (
            <div className="container-appview-box">
              <h2>{app?.appTitle} app</h2>
              <p className="app-description">{appAppStore?.description}</p>
            </div>
          )}
          {app.contact && (
            <div className="container-appview-box">
              <h2>{app.title} support</h2>
              <div>
                <Link to={`mailto:${app.contact}`} target="_blank">
                  <Button
                    secondary
                    icon={<FontAwesomeIcon icon={faEnvelope} size="sm" />}
                    label={`Contact ${app.appTitle} support`}
                  />
                </Link>
              </div>
            </div>
          )}
          <div className="container-details container-badges">
            <div className="container-tags">
              <div className="badges">
                <p>App: </p>
                <div>
                  <Badge label={app.appTitle} size="small" />
                </div>
              </div>
            </div>
            <div className="container-tags">
              <div className="badges">
                <p>Tagged: </p>
                <div>
                  <Badge secondary label={app.topicTitle} size="small" />
                </div>
              </div>
              <div className="badges">
                <p>Category: </p>
                <div>
                  <Badge secondary label={app.categoryTitle} size="small" />
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
                copyToClipboard(`https://www.topappdeals.com/deals/${app.id}`)
              }
            />
            <FacebookShareButton url={`/Apps/${app.id}`}>
              <FontAwesomeIcon className="share-icon" icon={faFacebookF} />
            </FacebookShareButton>
            <TwitterShareButton
              url={`https://www.topappdeals.com/deals/${app.id}`}
              title={`Check out this GPT App: '${app.title}'`}
              hashtags={['Apps']}
            >
              <FontAwesomeIcon className="share-icon" icon={faTwitter} />
            </TwitterShareButton>
            <LinkedinShareButton
              url={`https://www.topappdeals.com/deals/${app.id}`}
            >
              <FontAwesomeIcon className="share-icon" icon={faLinkedinIn} />
            </LinkedinShareButton>
            <EmailShareButton
              subject="Check out this deal!"
              body={`This app deal is great: '${app.title}'`}
              url={`https://www.topappdeals.com/deals/${app.id}`}
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </EmailShareButton>
          </div>
          <div className="container-comments">
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
          </div>
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
          {similarDealsFromApp.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Other deals from {app.appTitle} app</h2>
              <div className="container-cards small-cards">
                {cardItemsSimilarDealsFromApp}
              </div>
            </div>
          )}
          {similarApps.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Similar deals in {app.topicTitle}</h2>
              <div className="container-cards small-cards">{cardItems}</div>
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
