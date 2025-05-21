/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '../../components/Button/Button.component';
import { Badge } from '../../components/Badge/Badge.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../../components/Modal/Modal.Component';
import iconCopy from '../../assets/images/icons8-copy-24.png';
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
import './ThreadView.styles.css';
import { useUserContext } from '../../userContext';
import { useFetch } from '../../utils/hooks/useFetch';
import { useRatings } from '../../utils/hooks/useRatings';

export const ThreadView = () => {
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [animation, setAnimation] = useState('');
  const [reply, setReply] = useState('');
  const [thread, setThread] = useState({});
  const [error, setError] = useState(null);
  const [replies, setReplies] = useState([]);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  // const {
  //   isFetching: loadingThread,
  //   fetchedData,
  //   error: errorThread,
  // } = useFetch(fetchSingleThread, id);
  // const thread = fetchedData?.[0];
  // console.log(id, thread);
  const { ratings, allRatings, addRating, deleteRating } = useRatings(
    user,
    'thread_id',
    'ratingsForThreads',
  );
  useEffect(() => {
    async function fetchSingleThread(threadId) {
      const response = await fetch(`${apiURL()}/threads/${threadId}`);
      const data = await response.json();
      setThread(data[0]);
    }

    async function addViewCount(threadId) {
      const response = await fetch(`${apiURL()}/threads/${threadId}/views`, {
        method: 'PATCH',
      });
    }

    fetchSingleThread(id);
    addViewCount(id);
  }, [id]);

  const fetchRepliesByThreadId = useCallback(async (threadId) => {
    const response = await fetch(`${apiURL()}/replies?threadId=${threadId}`);
    const data = await response.json();
    setReplies(data);
  }, []);

  useEffect(() => {
    fetchRepliesByThreadId(id);
  }, [fetchRepliesByThreadId, id]);

  const addReply = async (replyContent) => {
    const response = await fetch(`${apiURL()}/replies`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: replyContent,
        thread_id: id,
      }),
    });

    if (response.ok) {
      fetchRepliesByThreadId(id);
    }
  };

  const replyHandler = (event) => {
    setReply(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!reply) {
      setError('Reply is required!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }
    if (reply.trim().length < 5) {
      setError('Reply must be more than five characters!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }

    setInvalidForm(false);
    setValidForm(true);
    addReply(reply);
    setOpenConfirmationModal(true);
    setReply('');
  };
  const getOnlyYearMonthDay = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
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

  const threadRatingsCount = allRatings.filter(
    (rating) => rating.thread_id === thread.id,
  ).length;

  return (
    <>
      <Helmet>
        <title>{`${thread.title} - Top App Deals`}</title>
        <meta name="description" content={`${thread.title} - discussion`} />
      </Helmet>
      <main>
        <section className="container-appview">
          <div className="header header-thread">
            <h1 className="hero-header">{thread.title}</h1>
            <i>{thread.full_name}</i>
            {thread.content && <p className="no-margin">{thread.content}</p>}
            <div className="container-rating">
              {user && ratings.some((rating) => rating.id === thread.id) ? (
                <button
                  type="button"
                  className="button-rating"
                  onClick={(event) => deleteRating(thread.id)}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {threadRatingsCount}
                </button>
              ) : user ? (
                <button
                  type="button"
                  className="button-rating"
                  onClick={(event) => addRating(thread.id)}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {threadRatingsCount}
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
                  {threadRatingsCount}
                </button>
              )}
            </div>
          </div>
          <div className="container-comments replies-container">
            {replies.length === 0 && (
              <div>
                <i>No replies yet. </i>
                {user && <i>Add a first one below.</i>}
              </div>
            )}
            {replies.length > 0 &&
              replies.map((item) => (
                <div className="form-container">
                  <div className="comment-box submit-box-new-comment reply-box">
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
                  to add replies
                </i>
              </div>
            )}
            {user && (
              <div className="form-container">
                <div className="comment-box submit-box reply-box">
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="form-input textarea-new-comment"
                      value={reply}
                      placeholder="Your reply..."
                      onChange={replyHandler}
                    />

                    <Button
                      primary
                      className="btn-add-prompt"
                      type="submit"
                      label="Add reply"
                    />
                    {validForm && (
                      <Modal
                        title="Your reply has been submitted!"
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

          <div className="icons-apps-page">
            <span>Share it: </span>
            <FontAwesomeIcon
              icon={faLink}
              className="button-copy"
              onClick={() =>
                copyToClipboard(
                  `https://www.topappdeals.com/threads/${thread.id}`,
                )
              }
            />
            <Toast open={openToast} overlayClass={`toast ${animation}`}>
              <span>Copied to clipboard!</span>
            </Toast>
            <FacebookShareButton url={`/threads/${thread.id}`}>
              <FontAwesomeIcon className="share-icon" icon={faFacebookF} />
            </FacebookShareButton>
            <TwitterShareButton
              url={`https://www.topappdeals.com/threads/${thread.id}`}
              title={`Check out this discussion: '${thread.title}'`}
              hashtags={['AppDeals']}
            >
              <FontAwesomeIcon className="share-icon" icon={faTwitter} />
            </TwitterShareButton>
            <LinkedinShareButton
              url={`https://www.topappdeals.com/threads/${thread.id}`}
            >
              <FontAwesomeIcon className="share-icon" icon={faLinkedinIn} />
            </LinkedinShareButton>
            <EmailShareButton
              subject={`${thread.title} - discussion`}
              body={`Take a look: ${thread.title} https://www.topappdeals.com/threads/${thread.id}`}
              url={`https://www.topappdeals.com/threads/${thread.id}`}
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </EmailShareButton>
          </div>
          <Link to="../community">
            <Button label="Go back" secondary />
          </Link>
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
