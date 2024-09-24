import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './AllApps.Style.css';
import { apiURL } from '../../apiURL';
import { CardCategories } from '../../components/CardCategories/CardCategories.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export const AllApps = () => {
  const [searchTerms, setSearchTerms] = useState();
  const [resultsHome, setResultsHome] = useState([]);
  const [categoriesAndTopics, setCategoriesAndTopics] = useState([]);
  const [apps, setApps] = useState([]);

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

      const topicsAndApps = appsResponse.reduce((acc, d) => {
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
      const sortedTopicsAndApps = topicsAndApps
        .map((item) => {
          return {
            ...item,
            apps: item.apps.sort((a, b) => a.title.localeCompare(b.title)),
          };
        })
        .sort((a, b) => a.topicTitle.localeCompare(b.topicTitle));
      setCategoriesAndTopics(sortedTopicsAndApps);
    }

    fetchApps();
  }, []);

  const handleSearch = (event) => {
    setSearchTerms(event.target.value);
  };

  const dropdownList = resultsHome.map((result) => (
    <Link to={`/deals/app/${result.id}`}>
      <li key={result.id}>{result.title}</li>
    </Link>
  ));
  const cardItems = categoriesAndTopics.map((category) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <CardCategories
        title={category.topicTitle}
        url={category.topicId}
        topics={category.apps}
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
      <section className="container-cards">{cardItems}</section>
    </main>
  );
};
