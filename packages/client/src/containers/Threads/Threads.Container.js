/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Threads.Style.css';
import { apiURL } from '../../apiURL';
import { useUserContext } from '../../userContext';
import { useFetch } from '../../utils/hooks/useFetch';
import { fetchThreads } from '../../utils/http';
import { LoadingContainer } from '../LoadingContainer/LoadingContainer.Container';
import { ErrorContainer } from '../ErrorContainer/ErrorContainer.Container';
import { getDateFromTimestamp } from '../../utils/getDateFromTimestamp';
import { Button } from '../../components/Button/Button.component';
import { useRatings } from '../../utils/hooks/useRatings';

export const Threads = () => {
  const { user } = useUserContext();

  const {
    isFetching: loading,
    fetchedData: threads,
    error,
  } = useFetch(fetchThreads, []);

  const { allRatings } = useRatings(user, 'thread_id', 'ratingsForThreads');

  if (loading) {
    return <LoadingContainer />;
  }

  if (error) {
    return <ErrorContainer error={error} />;
  }

  return (
    <main>
      <Helmet>
        <title>Community</title>
        <meta name="description" content="TopAddDeals community" />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero apps">
        <h1 className="hero-header">Community</h1>
      </div>

      <section className="threads-container">
        <div className="new-thread-container">
          <Link to="threads/new">
            <Button primary label="New thread" />
          </Link>
        </div>
        <div className="threads-table">
          <div className="header-row">
            <div className="col-1">
              <strong>Threads</strong>
            </div>
            <div className="col-2">
              <strong>Views</strong>
            </div>
            <div className="col-3">
              <strong>Date</strong>
            </div>
            <div className="col-4">
              <strong>Votes</strong>
            </div>
          </div>
          {threads.map((thread) => {
            const threadRatingsCount = allRatings.filter(
              (rating) => rating.thread_id === thread.id,
            ).length;
            return (
              <div className="table-row">
                <div className="col-1">
                  <Link className="underline" to={`threads/${thread.id}`}>
                    {thread.title}
                  </Link>
                </div>
                <div className="col-2">{thread.views}</div>
                <div className="col-3">
                  {getDateFromTimestamp(thread.created_at)}
                </div>
                <div className="col-4">{threadRatingsCount}</div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
