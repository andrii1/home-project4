import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Apps.Style.css';
import { apiURL } from '../../apiURL';
import { Card } from '../../components/Card/Card.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../components/Button/Button.component';
import { Loading } from '../../components/Loading/Loading.Component';
import DropDownView from '../../components/CategoriesListDropDown/CategoriesListDropDown.component';
// eslint-disable-next-line import/no-extraneous-dependencies
import InfiniteScroll from 'react-infinite-scroll-component';
import Modal from '../../components/Modal/Modal.Component';
import Toast from '../../components/Toast/Toast.Component';
import { useUserContext } from '../../userContext';

import {
  faSearch,
  faFilter,
  faList,
  faGrip,
  faBookmark as faBookmarkSolid,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons';

export const Apps = () => {
  const { user } = useUserContext();
  const location = useLocation();
  const { topicIdParam, categoryIdParam, appIdParam, searchTermIdParam } =
    useParams();
  const [searchTerms, setSearchTerms] = useState();
  const [searchTermsDb, setSearchTermsDb] = useState([]);
  const [sortOrder, setSortOrder] = useState();
  const [resultsHome, setResultsHome] = useState([]);

  const [topics, setTopics] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [animation, setAnimation] = useState('');
  const [categories, setCategories] = useState([]);
  const [appTitles, setAppTitles] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredPricingPreview, setFilteredPricingPreview] = useState([]);
  const [filteredDetailsPreview, setFilteredDetailsPreview] = useState([]);
  const [filteredPricing, setFilteredPricing] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [filtersSubmitted, setFiltersSubmitted] = useState(false);
  const [showFiltersContainer, setShowFiltersContainer] = useState(false);
  const [showTopicsContainer, setShowTopicsContainer] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [page, setPage] = useState(0);
  const [counter, setCounter] = useState(0);
  const [apps, setApps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [orderBy, setOrderBy] = useState({
    column: 'id',
    direction: 'desc',
  });
  const [pricingOptionsChecked, setPricingOptionsChecked] = useState([
    { title: 'Free', checked: false },
    { title: 'Paid with a free plan', checked: false },
    { title: 'Paid with a free trial', checked: false },
    { title: 'Paid', checked: false },
  ]);
  const [detailsOptionsChecked, setDetailsOptionsChecked] = useState([
    { title: 'Browser extension', checked: false },
    { title: 'iOS app available', checked: false },
    { title: 'Android app available', checked: false },
    { title: 'Social media contacts', checked: false },
  ]);

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  // first fetch
  useEffect(() => {
    setIsLoading(true);
    const url = `${apiURL()}/deals?page=0&column=${orderBy.column}&direction=${
      orderBy.direction
    }${topicIdParam !== undefined ? `&filteredTopics=${topicIdParam}` : ''}${
      categoryIdParam !== undefined
        ? `&filteredCategories=${categoryIdParam}`
        : ''
    }${
      searchTermIdParam !== undefined ? `&searchTerm=${searchTermIdParam}` : ''
    }${appIdParam !== undefined ? `&filteredApps=${appIdParam}` : ''}${
      filtersSubmitted && filteredPricing.length > 0
        ? `&filteredPricing=${encodeURIComponent(filteredPricing)}`
        : ''
    }${
      filtersSubmitted && filteredDetails.length > 0
        ? `&filteredDetails=${encodeURIComponent(filteredDetails)}`
        : ''
    }`;

    // if (topicIdParam) {
    //   url = `${apiURL()}/apps?page=0&filteredTopics=${topicIdParam}&column=${
    //     orderBy.column
    //   }&direction=${orderBy.direction}`;
    // } else if (categoryIdParam) {
    //   url = `${apiURL()}/apps?page=0&filteredCategories=${categoryIdParam}&column=${
    //     orderBy.column
    //   }&direction=${orderBy.direction}`;
    // } else {
    //   url = `${apiURL()}/apps?page=0&column=${orderBy.column}&direction=${
    //     orderBy.direction
    //   }`;
    // }
    async function fetchData() {
      const response = await fetch(url);
      const json = await response.json();

      let hasMore = true;
      if (
        json.data.some((item) => item.id === json.lastItem.id) ||
        json.lastItem === undefined
      ) {
        hasMore = false;
      }

      setApps({
        data: json.data,
        lastItem: json.lastItem,
        hasMore,
      });
      setPage((prevPage) => prevPage + 1);
      setIsLoading(false);
    }

    fetchData();
  }, [
    categoryIdParam,
    topicIdParam,
    appIdParam,
    searchTermIdParam,
    orderBy.column,
    orderBy.direction,
    filteredDetails,
    filteredPricing,
    filtersSubmitted,
  ]);

  const fetchApps = async () => {
    setIsLoading(true);
    setError(null);

    const url = `${apiURL()}/deals?page=${page}&column=${
      orderBy.column
    }&direction=${orderBy.direction}${
      topicIdParam !== undefined ? `&filteredTopics=${topicIdParam}` : ''
    }${
      categoryIdParam !== undefined
        ? `&filteredCategories=${categoryIdParam}`
        : ''
    }${appIdParam !== undefined ? `&filteredApps=${appIdParam}` : ''}${
      searchTermIdParam !== undefined ? `&searchTerm=${searchTermIdParam}` : ''
    }${
      filtersSubmitted && filteredPricing.length > 0
        ? `&filteredPricing=${encodeURIComponent(filteredPricing)}`
        : ''
    }${
      filtersSubmitted && filteredDetails.length > 0
        ? `&filteredDetails=${encodeURIComponent(filteredDetails)}`
        : ''
    }`;

    // comment
    // let url;
    // if (topicIdParam) {
    //   url = `${apiURL()}/apps?filteredTopics=${topicIdParam}&page=${page}&column=${
    //     orderBy.column
    //   }&direction=${orderBy.direction}`;
    // } else if (categoryIdParam) {
    //   url = `${apiURL()}/apps?filteredCategories=${categoryIdParam}&page=${page}&column=${
    //     orderBy.column
    //   }&direction=${orderBy.direction}`;
    // } else {
    //   url = `${apiURL()}/apps?page=${page}&column=${orderBy.column}&direction=${
    //     orderBy.direction
    //   }`;
    // }

    const response = await fetch(url);
    const json = await response.json();

    // setApps({ data: json.data, totalCount: json.totalCount, hasMore });

    let hasMore = true;

    if (
      json.data.some((item) => item.id === json.lastItem.id) ||
      json.lastItem === undefined
    ) {
      hasMore = false;
    }

    setApps((prevItems) => {
      return {
        data: [...prevItems.data, ...json.data],
        lastItem: json.lastItem,
        hasMore,
      };
    });

    setPage((prev) => prev + 1);
  };

  // const fetchApps = useCallback(async () => {
  //   try {
  //     await setLoading(true);
  //     await setError(false);
  //     console.log('pagetest', page);
  //     let url;
  //     if (topicIdParam) {
  //       url = `${apiURL()}/apps?filteredTopics=${topicIdParam}&page=${page}`;
  //     } else if (categoryIdParam) {
  //       url = `${apiURL()}/apps?filteredCategories=${categoryIdParam}&page=${page}`;
  //     } else {
  //       url = `${apiURL()}/apps?page=${page}`;
  //     }
  //     const response = await fetch(url);
  //     const appsResponse = await response.json();

  //     console.log('appsResponse', appsResponse);
  //     setApps(appsResponse);

  //     console.log('apps', apps);

  //     //  else {
  //     //   setApps((prevItems) => [...prevItems, ...appsResponse]);
  //     // }

  //     // setApps((prevItems) => [...prevItems, ...appsResponse]);
  //     setLoading(false);
  //   } catch (err) {
  //     setError(err);
  //   }
  // }, [page, categoryIdParam, topicIdParam]);

  // useEffect(() => {
  //   fetchApps();
  // }, [fetchApps]);

  // useEffect(() => {
  //   setApps([]);
  // }, [location]);

  const setupUrlFilters = useCallback(async () => {
    let urlFilters = '';
    if (filteredTopics.length > 0) {
      urlFilters = `?filteredTopics=${filteredTopics}`;
    }
    return urlFilters;
  }, [filteredTopics]);
  useEffect(() => {
    async function fetchAppsSearch() {
      const responseApps = await fetch(`${apiURL()}/deals/`);

      const responseAppsJson = await responseApps.json();

      if (searchTerms) {
        const filteredSearch = responseAppsJson.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerms.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(searchTerms.toLowerCase()) ||
            item.topicTitle.toLowerCase().includes(searchTerms.toLowerCase()) ||
            item.categoryTitle
              .toLowerCase()
              .includes(searchTerms.toLowerCase()),
        );
        setResultsHome(filteredSearch);
      }
    }
    fetchAppsSearch();
  }, [searchTerms]);

  // const fetchApps = useCallback(async () => {
  //   // const urlFilters = await setupUrlFilters();
  //   let url;
  //   if (topicIdParam) {
  //     url = `${apiURL()}/apps/?filteredTopics=${topicIdParam}&page=${page}`;
  //   } else if (categoryIdParam) {
  //     url = `${apiURL()}/apps/?filteredCategories=${categoryIdParam}&page=${page}`;
  //   } else {
  //     url = `${apiURL()}/apps/?page=${page}`;
  //   }

  //   const response = await fetch(url);
  //   const appsResponse = await response.json();
  //   setApps((prevItems) => [...prevItems, ...appsResponse]);

  //   // setApps(appsResponse);

  //   // const promptsExportReady = promptsResponse.dataExport.map((prompt) => {
  //   //   return {
  //   //     id: prompt.id,
  //   //     prompt: prompt.title,
  //   //     category: prompt.categoryTitle,
  //   //     topic: prompt.topicTitle,
  //   //   };
  //   // });
  //   // setPromptsExport(promptsExportReady);
  //   setIsLoading(false);
  // }, [topicIdParam, categoryIdParam, page]);

  // useEffect(() => {
  //   setIsLoading(true);
  //   fetchApps();
  // }, [fetchApps]);

  useEffect(() => {
    setPage(0);
  }, [location]);

  useEffect(() => {
    setPage(0);
  }, [sortOrder]);

  useEffect(() => {
    setPage(0);
  }, [filteredPricing]);

  useEffect(() => {
    setPage(0);
  }, [filteredDetails]);

  // useEffect(() => {
  //   setCounter((prev) => prev + 1);
  // }, []);
  // console.log('counter', counter);

  // const handleObserver = useCallback((entries) => {
  //   const target = entries[0];

  //   console.log('test12');
  //   if (entries.length > 1) return;
  //   if (target.isIntersecting) {
  //     setPage((prev) => prev + 1);
  //   }
  // }, []);

  // useEffect(() => {
  //   const option = {
  //     root: null,
  //     rootMargin: '20px',
  //     threshold: 0,
  //   };
  //   const observer = new IntersectionObserver(handleObserver, option);
  //   if (loader.current) {
  //     observer.observe(loader.current);
  //   }
  // }, [handleObserver]);

  useEffect(() => {
    async function fetchTopics() {
      const response = await fetch(`${apiURL()}/topics/`);
      const topicsResponse = await response.json();
      setTopics(topicsResponse);
    }

    async function fetchCategories() {
      const response = await fetch(`${apiURL()}/categories/`);
      const categoriesResponse = await response.json();
      setCategories(categoriesResponse);
    }

    async function fetchAppTitles() {
      const response = await fetch(`${apiURL()}/apps/`);
      const appTitlesResponse = await response.json();
      setAppTitles(appTitlesResponse);
    }

    // fetchApps();
    fetchTopics();
    fetchCategories();
    fetchAppTitles();
  }, []);

  useEffect(() => {
    async function fetchSearchTermsDb() {
      const response = await fetch(`${apiURL()}/searchTerms/`);
      const searchTermsResponseDb = await response.json();
      setSearchTermsDb(searchTermsResponseDb);
    }

    if (searchTermIdParam !== undefined) {
      fetchSearchTermsDb();
    }
  }, [searchTermIdParam]);

  const handleSearch = (event) => {
    setSearchTerms(event.target.value);
  };

  const filterHandlerPricing = (event) => {
    if (event.target.checked) {
      setFilteredPricingPreview([
        ...filteredPricingPreview,
        event.target.value,
      ]);

      const newItems = pricingOptionsChecked.map((item) => {
        if (item.title === event.target.value) {
          return { ...item, checked: true };
        }
        return item;
      });
      setPricingOptionsChecked(newItems);
    } else {
      setFilteredPricingPreview(
        filteredPricingPreview.filter(
          (filterTopic) => filterTopic !== event.target.value,
        ),
      );
      const newItems = pricingOptionsChecked.map((item) => {
        if (item.title === event.target.value) {
          return { ...item, checked: false };
        }
        return item;
      });
      setPricingOptionsChecked(newItems);
    }
  };

  const filterHandlerDetails = (event) => {
    if (event.target.checked) {
      setFilteredDetailsPreview([
        ...filteredDetailsPreview,
        event.target.value,
      ]);
      const newItems = detailsOptionsChecked.map((item) => {
        if (item.title === event.target.value) {
          return { ...item, checked: true };
        }
        return item;
      });
      setDetailsOptionsChecked(newItems);
    } else {
      setFilteredDetailsPreview(
        filteredDetailsPreview.filter(
          (filterTopic) => filterTopic !== event.target.value,
        ),
      );
      const newItems = detailsOptionsChecked.map((item) => {
        if (item.title === event.target.value) {
          return { ...item, checked: false };
        }
        return item;
      });
      setDetailsOptionsChecked(newItems);
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setFiltersSubmitted(true);
    setFilteredPricing(filteredPricingPreview);
    setFilteredDetails(filteredDetailsPreview);
  };

  const clearFiltersHandler = (event) => {
    const newItemsDetails = detailsOptionsChecked.map((item) => {
      return { ...item, checked: false };
    });
    setDetailsOptionsChecked(newItemsDetails);

    const newItemsPricing = pricingOptionsChecked.map((item) => {
      return { ...item, checked: false };
    });
    setPricingOptionsChecked(newItemsPricing);
    setFilteredDetails([]);
    setFilteredPricing([]);
  };

  const dropdownList = resultsHome.map((app) => (
    <Link key={app.id} to={`/deals/${app.id}`}>
      <li>{app.title}</li>
    </Link>
  ));

  const topicsList = appTitles.map((topic) => {
    if (appIdParam) {
      return (
        <Link to={`/deals/app/${topic.id}`}>
          <Button
            primary={topic.id.toString() === appIdParam.toString() && true}
            secondary={topic.id !== appIdParam && true}
            label={topic.title}
          />
        </Link>
      );
    }
    return (
      <Link to={`/deals/app/${topic.id}`}>
        <Button secondary label={topic.title} />
      </Link>
    );
  });

  useEffect(() => {
    let column;
    let direction;
    if (sortOrder === 'A-Z') {
      column = 'title';
      direction = 'asc';
    } else if (sortOrder === 'Z-A') {
      column = 'title';
      direction = 'desc';
    } else {
      column = 'id';
      direction = 'desc';
    }

    setOrderBy({ column, direction });
  }, [sortOrder]);
  let pageTitle;
  if (topicIdParam) {
    pageTitle = `${topics
      .filter((topic) => topic.id === parseInt(topicIdParam, 10))
      .map((item) => item.title)} - app deals`;
  } else if (categoryIdParam) {
    pageTitle = `${categories
      .filter((category) => category.id === parseInt(categoryIdParam, 10))
      .map((item) => item.title)} - app deals`;
  } else if (appIdParam) {
    pageTitle = `${appTitles
      .filter((category) => category.id === parseInt(appIdParam, 10))
      .map((item) => item.title)} app deals`;
  } else if (searchTermIdParam) {
    pageTitle = `${searchTermsDb
      .filter((searchTerm) => searchTerm.id === parseInt(searchTermIdParam, 10))
      .map((item) => item.title)} - Top App Deals`;
  } else {
    pageTitle = 'Top App Deals - best app deals';
  }

  const sortOptions = ['Recent', 'A-Z', 'Z-A'];

  const pricingList = pricingOptionsChecked.map((item) => (
    <li key={item}>
      <input
        checked={item.checked}
        type="checkbox"
        value={item.title}
        onChange={filterHandlerPricing}
      />{' '}
      {item.title}
    </li>
  ));

  const detailsList = detailsOptionsChecked.map((item) => (
    <li key={item}>
      <input
        checked={item.checked}
        type="checkbox"
        value={item.title}
        onChange={filterHandlerDetails}
      />{' '}
      {item.title}
    </li>
  ));
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

  const findAppTitleByAppIdParam = (param) => {
    const appTitle = appTitles
      .filter((category) => category.id === parseInt(param, 10))
      .map((item) => item.title);
    return appTitle;
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

  return (
    <main>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Find best app deals" />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero">
        <h1 className="hero-header">
          {appIdParam && `${findAppTitleByAppIdParam(appIdParam)} app deals`}
          {!appIdParam && !searchTermIdParam && 'Browse best app deals'}
          {searchTermIdParam &&
            `${searchTermsDb
              .filter(
                (searchTerm) =>
                  searchTerm.id === parseInt(searchTermIdParam, 10),
              )
              .map((item) => item.title)}`}
        </h1>
        <form className="home">
          <label>
            <FontAwesomeIcon className="search-icon" icon={faSearch} />
            <input
              type="text"
              className="input-search-home"
              onChange={handleSearch}
              /* onFocus={handleClick} */
              placeholder="Search best deals..."
            />
          </label>
        </form>
        {searchTerms ? (
          <div className="dropdown-search">
            <ul>
              {resultsHome.length > 0 ? (
                dropdownList
              ) : (
                <span className="search-no-apps">No deals found :(</span>
              )}
            </ul>
          </div>
        ) : (
          ''
        )}
      </div>
      <section className={`container-topics ${showTopicsContainer && 'show'}`}>
        <Link to="/">
          <Button
            primary={!appIdParam}
            secondary={appIdParam}
            label="All apps"
          />
        </Link>
        {topicsList}
      </section>
      <section className="container-filters">
        <Button
          secondary
          className="button-topics"
          onClick={(event) => setShowTopicsContainer(!showTopicsContainer)}
          backgroundColor="#ffe5d9"
          label="Apps"
          icon={<FontAwesomeIcon className="filter-icon" icon={faBookOpen} />}
        />
        <DropDownView
          label="Sort"
          options={sortOptions}
          onSelect={(option) => setSortOrder(option)}
          showFilterIcon={false}
        />

        {/* <Button
          secondary
          onClick={(event) => setShowFiltersContainer(!showFiltersContainer)}
          backgroundColor="#ffe5d9"
          label="Filters"
          icon={<FontAwesomeIcon className="filter-icon" icon={faFilter} />}
        /> */}
        <Button
          secondary
          onClick={() => setListView(!listView)}
          backgroundColor="#ffe5d9"
        >
          <div className="filter-grid">
            <FontAwesomeIcon size="lg" icon={faGrip} />
            <FontAwesomeIcon icon={faList} />
          </div>
        </Button>
      </section>
      <section
        className={`container-details-section ${
          showFiltersContainer && 'show'
        }`}
      >
        <div className="container-details filters">
          <form onSubmit={submitHandler}>
            <div className="container-form">
              <div>
                <h3>Pricing</h3>
                <ul>{pricingList}</ul>
              </div>
              <div>
                <h3>Details</h3>
                <ul>{detailsList}</ul>
              </div>
            </div>
            <div className="container-buttons">
              <Button type="submit" primary label="Apply filters" />
              <Button
                type="button"
                onClick={clearFiltersHandler}
                secondary
                label="Clear"
              />
            </div>
          </form>
        </div>
      </section>
      {apps.data ? (
        <section className="container-scroll">
          <InfiniteScroll
            dataLength={apps.data.length}
            next={fetchApps}
            hasMore={apps.hasMore} // Replace with a condition based on your data source
            loader={<p>Loading...</p>}
            endMessage={<p>No more data to load.</p>}
            className={`container-cards ${listView ? 'list' : 'grid'}`}
          >
            {apps.data.map((app) => {
              return (
                <Card
                  listCard={listView}
                  id={app.id}
                  title={app.title}
                  description={app.description}
                  referralCode={app.referral_code}
                  referralCodeOnClick={() => copyToClipboard(app.referral_code)}
                  url={app.url}
                  urlImage={app.url_image === null ? 'deal' : app.url_image}
                  topic={app.topicTitle}
                  topicId={app.topic_id}
                  appTitle={app.appTitle}
                  isFavorite={favorites.some((x) => x.id === app.id)}
                  addFavorite={(event) => addFavorite(app.id)}
                  deleteBookmark={() => handleDeleteBookmarks(app.id)}
                  bookmarkOnClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to add bookmarks');
                  }}
                />
              );
            })}
          </InfiniteScroll>
        </section>
      ) : (
        <Loading />
      )}
      <Toast open={openToast} overlayClass={`toast ${animation}`}>
        <span>Copied to clipboard!</span>
      </Toast>
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
  );
};
