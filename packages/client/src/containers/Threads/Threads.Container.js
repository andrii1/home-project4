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

export const Threads = () => {
  const { user } = useUserContext();

  const {
    isFetching: loading,
    fetchedData: threads,
    error,
  } = useFetch(fetchThreads, []);

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

      <section className="container-scroll">
        <div>
          <div>Thread</div>
          <div>Views</div>
        </div>
        {threads.map((thread) => {
          return (
            <div>
              <div>{thread.title}</div>
            </div>
          );
        })}
      </section>
    </main>
  );
};
