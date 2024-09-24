import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './AllApps.Style.css';
import { apiURL } from '../../apiURL';
import { CardCategories } from '../../components/CardCategories/CardCategories.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button.component';

export const AllApps = () => {
  const [searchTerms, setSearchTerms] = useState();
  const [resultsHome, setResultsHome] = useState([]);
  const [apps, setApps] = useState([]);
  const [showAppsBy, setShowAppsBy] = useState('alphabet');

  useEffect(() => {
    if (searchTerms) {
      const filteredSearch = apps.filter((item) =>
        item.title.toLowerCase().includes(searchTerms.toLowerCase()),
      );
      setResultsHome(filteredSearch);
    } else {
      setResultsHome(apps);
    }
  }, [searchTerms, apps]);

  useEffect(() => {
    async function fetchApps() {
      const response = await fetch(`${apiURL()}/apps/`);
      const appsResponse = await response.json();
      setApps(appsResponse);
    }
    fetchApps();
  }, []);

  const filteredApps = useMemo(() => {
    if (showAppsBy === 'topics') {
      const topicsAndApps = apps.reduce((acc, d) => {
        const found = acc.find((a) => a.topicId === d.topic_id);
        /* const value = { name: d.name, val: d.value }; */
        const value = {
          id: d.id,
          title: d.title,
        }; // the element in data property
        if (!found) {
          /* acc.push(...value); */
          acc.push({
            topicId: d.topic_id,
            topicTitle: d.topicTitle,
            apps: [value],
          }); // not found, so need to add data property
        } else {
          /* acc.push({ name: d.name, data: [{ value: d.value }, { count: d.count }] }); */
          found.apps.push(value); // if found, that means data property exists, so just push new element to found.data.
        }
        return acc;
      }, []);
      return topicsAndApps
        .map((item) => {
          return {
            ...item,
            apps: item.apps.sort((a, b) => a.title.localeCompare(b.title)),
          };
        })
        .sort((a, b) => a.topicTitle.localeCompare(b.topicTitle));
    }
    const obj = apps
      .sort((a, b) => a.title.localeCompare(b.title))
      .reduce((acc, c) => {
        const letter = c.title[0];
        acc[letter] = (acc[letter] || []).concat({
          id: c.id,
          title: c.title,
        });
        return acc;
      }, {});

    return Object.entries(obj).map(([letter, appTitles]) => {
      return { letter, appTitles };
    });
  }, [showAppsBy, apps]);

  const handleSearch = (event) => {
    setSearchTerms(event.target.value);
  };

  const dropdownList = resultsHome.map((result) => (
    <Link to={`/deals/app/${result.id}`}>
      <li key={result.id}>{result.title}</li>
    </Link>
  ));

  const cardItems = filteredApps.map((item) => {
    if (Object.keys(item).includes('letter'))
      return (
        <CardCategories
          title={item.letter}
          topics={item.appTitles}
          slug="app"
        />
      );
    return (
      <CardCategories
        title={item.topicTitle}
        url={item.topicId}
        topics={item.apps}
        slug="topic"
      />
    );
  });

  return (
    <main>
      <Helmet>
        <title>Deals - discover best deals</title>
        <meta
          name="description"
          content="Find best Chat GPT prompts for free"
        />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero">
        <h1 className="hero-header">Apps</h1>
        <p className="subheading">Search deals by apps</p>
        <form>
          <label>
            <FontAwesomeIcon
              className="search-icon-categories"
              icon={faSearch}
            />
            <input
              type="text"
              className="input-search-home"
              onChange={handleSearch}
              /* onFocus={handleClick} */
              placeholder="Search apps"
            />
          </label>
        </form>
        {searchTerms ? (
          <div className="dropdown-search search-categories">
            <ul>{dropdownList}</ul>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="container-apps-sort">
        <Link
          className={showAppsBy === 'alphabet' ? '' : 'apps-sort-underline'}
          onClick={() => setShowAppsBy('alphabet')}
        >
          By alphabet
        </Link>
        <Link
          className={showAppsBy === 'topics' ? '' : 'apps-sort-underline'}
          onClick={() => setShowAppsBy('topics')}
        >
          By topics
        </Link>
      </div>
      <section className="container-cards">{cardItems}</section>
    </main>
  );
};
