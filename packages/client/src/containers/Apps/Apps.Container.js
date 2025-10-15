/* eslint-disable no-nested-ternary */
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
import { capitalize } from '../../utils/capitalize';
import { removeMarkdown } from '../../utils/removeMarkdown';

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
  const { pathname } = location;
  const {
    topicIdParam,
    categoryIdParam,
    appIdParam,
    searchTermIdParam,
    searchParam,
  } = useParams();
  const [searchTerms, setSearchTerms] = useState();
  const [searchTermsDb, setSearchTermsDb] = useState([]);

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
  const [loading, setLoading] = useState(false);
  const [loadingFirstFetch, setLoadingFirstFetch] = useState(false);
  const [listView, setListView] = useState(window.innerWidth <= 768);
  const [page, setPage] = useState(0);
  const [counter, setCounter] = useState(0);
  const [apps, setApps] = useState({});
  const [dealsTrending, setDealsTrending] = useState({});
  const [error, setError] = useState(false);
  const [orderBy, setOrderBy] = useState({ column: 'id', direction: 'desc' });
  const [sortOrder, setSortOrder] = useState('Trending');
  const [orderByTrending, setOrderByTrending] = useState(false);
  const [codesPage, setCodesPage] = useState(false);

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

  // changing list view depending on window size???

  const handleWindowSizeChange = useCallback(async () => {
    if (window.innerWidth <= 768) {
      return setListView(true);
    }

    return setListView(false);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, [handleWindowSizeChange]);

  // end of change list view

  useEffect(() => {
    if (pathname.includes('/codes')) {
      setCodesPage(true);
    }
  }, [pathname]);

  // useEffect(() => {
  //   if (
  //     !pathname.includes('/deals') &&
  //     orderBy.column !== 'title' &&
  //     orderBy.column !== 'id'
  //   ) {
  //     setOrderBy({ column: undefined, direction: undefined, trending: true });
  //   }
  // }, [pathname, orderBy.column]);

  // useEffect(() => {
  //   if (pathname.includes('/deals')) {
  //     setOrderBy({ ...orderBy, trending: false });
  //   }
  // }, [pathname, orderBy]);

  // useEffect(() => {
  //   if (pathname !== '/') {
  //     setOrderByTrending(false);
  //   }
  // }, [pathname]);

  // useEffect(() => {
  //   if (
  //     topicIdParam !== undefined ||
  //     categoryIdParam !== undefined ||
  //     searchTermIdParam !== undefined ||
  //     appIdParam !== undefined ||
  //     orderBy.column !== undefined ||
  //     orderBy.direction !== undefined
  //   ) {
  //     if (orderBy.column !== undefined) {
  //       setOrderBy({ ...orderBy, trending: false });
  //     } else {
  //       setOrderBy({ column: 'id', direction: 'desc', trending: false });
  //     }
  //   }
  // }, [
  //   appIdParam,
  //   categoryIdParam,
  //   filteredDetails,
  //   filteredPricing,
  //   orderBy,
  //   searchTermIdParam,
  //   topicIdParam,
  // ]);

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  // first fetch
  useEffect(() => {
    setLoading(true);
    setLoadingFirstFetch(true);

    async function fetchData() {
      const url = `${apiURL()}/${
        pathname.includes('/codes') ? `codes` : `deals`
      }?page=0&column=${orderBy.column}&direction=${orderBy.direction}${
        topicIdParam !== undefined ? `&filteredTopics=${topicIdParam}` : ''
      }${searchParam !== undefined ? `&search=${searchParam}` : ''}${
        categoryIdParam !== undefined
          ? `&filteredCategories=${categoryIdParam}`
          : ''
      }${
        searchTermIdParam !== undefined
          ? `&searchTerm=${searchTermIdParam}`
          : ''
      }${appIdParam !== undefined ? `&filteredApps=${appIdParam}` : ''}${
        filtersSubmitted && filteredPricing.length > 0
          ? `&filteredPricing=${encodeURIComponent(filteredPricing)}`
          : ''
      }${
        filtersSubmitted && filteredDetails.length > 0
          ? `&filteredDetails=${encodeURIComponent(filteredDetails)}`
          : ''
      }`;
      const response = await fetch(url);
      const json = await response.json();

      let hasMore = true;
      if (
        json.data.some((item) => item.id === json.lastItem.id) ||
        json.lastItem === undefined
      ) {
        hasMore = false;
      }

      const arrayWithAppleIds = json.data
        .map((deal) => deal.appAppleId)
        .filter((deal) => deal !== null)
        .join(',');
      let appIcons;
      if (arrayWithAppleIds) {
        const responseAppIcons = await fetch(
          `${apiURL()}/appsAppStore/${arrayWithAppleIds}`,
        );
        const jsonAppIcons = await responseAppIcons.json();
        appIcons = jsonAppIcons.results;
      } else {
        appIcons = [];
      }

      const arrayWithIcons = json.data.map((deal) => ({
        ...deal,
        iconUrl: appIcons?.some((e) => e.trackId.toString() === deal.appAppleId)
          ? appIcons
              .filter(
                (appleId) => appleId.trackId.toString() === deal.appAppleId,
              )
              .map((item) => item.artworkUrl512)[0]
              .toString()
          : null,
      }));

      setApps({
        data: arrayWithIcons,
        lastItem: json.lastItem,
        hasMore,
      });
      setPage((prevPage) => prevPage + 1);
      setLoading(false);
      setLoadingFirstFetch(false);
    }

    async function fetchDataTrending() {
      const response = await fetch(`${apiURL()}/deals`);
      const allDeals = await response.json();
      const responseAnalytics = await fetch(`${apiURL()}/analytics`);
      const dealsAnalytics = await responseAnalytics.json();

      const dealsWithAnalytics = allDeals
        .map((deal) => ({
          ...deal,
          activeUsers: dealsAnalytics?.some(
            (e) => e.dealId.toString() === deal.id.toString(),
          )
            ? dealsAnalytics
                .filter((item) => item.dealId.toString() === deal.id.toString())
                .map((item) => item.activeUsers)
                .toString()
            : null,
        }))
        .filter((item) => item.activeUsers)
        .sort((a, b) => {
          return b.activeUsers - a.activeUsers;
        });
      const lastItem = dealsWithAnalytics.slice(-1)[0];

      setDealsTrending({ deals: dealsWithAnalytics, lastItem });

      const dealsWithPage = dealsWithAnalytics.slice(0, 10);

      let hasMore = true;
      if (dealsWithPage.some((item) => item.id === lastItem.id)) {
        hasMore = false;
      }

      const arrayWithAppleIds = dealsWithPage
        .map((deal) => deal.appAppleId)
        .filter((deal) => deal !== null)
        .join(',');
      let appIcons;
      if (arrayWithAppleIds) {
        const responseAppIcons = await fetch(
          `${apiURL()}/appsAppStore/${arrayWithAppleIds}`,
        );
        const jsonAppIcons = await responseAppIcons.json();
        appIcons = jsonAppIcons.results;
      } else {
        appIcons = [];
      }

      const arrayWithIcons = dealsWithPage.map((deal) => ({
        ...deal,
        iconUrl: appIcons?.some((e) => e.trackId.toString() === deal.appAppleId)
          ? appIcons
              .filter(
                (appleId) => appleId.trackId.toString() === deal.appAppleId,
              )
              .map((item) => item.artworkUrl512)[0]
              .toString()
          : null,
      }));

      setApps({
        data: arrayWithIcons,
        lastItem,
        hasMore,
      });
      setPage((prevPage) => prevPage + 1);
      setLoading(false);
      setLoadingFirstFetch(false);
    }

    if (pathname === '/' && orderByTrending) {
      fetchDataTrending();
    } else {
      fetchData();
    }
    // if (
    //   topicIdParam !== undefined ||
    //   categoryIdParam !== undefined ||
    //   searchTermIdParam !== undefined ||
    //   appIdParam !== undefined ||
    //   orderBy.column !== undefined ||
    //   orderBy.direction !== undefined
    // ) {
    //   fetchData();
    // } else {
    //   fetchDataTrending();
    // }
    // if (orderBy.trending) {
    //   fetchDataTrending();
    // } else {
    //   // setOrderByTrending(false);
    //
    // }
  }, [
    categoryIdParam,
    topicIdParam,
    appIdParam,
    searchTermIdParam,
    orderBy.column,
    orderBy.direction,
    orderBy.trending,
    filteredDetails,
    filteredPricing,
    filtersSubmitted,
    pathname,
    orderByTrending,
    searchParam,
  ]);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);

    const url = `${apiURL()}/${
      pathname.includes('/codes') ? `codes` : `deals`
    }?page=${page}&column=${orderBy.column}&direction=${orderBy.direction}${
      topicIdParam !== undefined ? `&filteredTopics=${topicIdParam}` : ''
    }${searchParam !== undefined ? `&search=${searchParam}` : ''}${
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

    const arrayWithAppleIds = json.data
      .map((deal) => deal.appAppleId)
      .filter((deal) => deal !== null)
      .join(',');

    const responseAppIcons = await fetch(
      `${apiURL()}/appsAppStore/${arrayWithAppleIds}`,
    );
    const jsonAppIcons = await responseAppIcons.json();
    const appIcons = jsonAppIcons.results;

    const arrayWithIcons = json.data.map((deal) => ({
      ...deal,
      iconUrl: appIcons?.some((e) => e.trackId.toString() === deal.appAppleId)
        ? appIcons
            .filter((appleId) => appleId.trackId.toString() === deal.appAppleId)
            .map((item) => item.artworkUrl512)[0]
            .toString()
        : null,
    }));

    setApps((prevItems) => {
      return {
        data: [...prevItems.data, ...arrayWithIcons],
        lastItem: json.lastItem,
        hasMore,
      };
    });

    setPage((prev) => prev + 1);
  };

  const fetchAppsTrending = async () => {
    setLoading(true);
    setError(null);

    // const response = await fetch(`${apiURL()}/deals`);
    // const allDeals = await response.json();
    // const responseAnalytics = await fetch(`${apiURL()}/analytics`);
    // const dealsAnalytics = await responseAnalytics.json();

    // const dealsWithAnalytics = allDeals
    //   .map((deal) => ({
    //     ...deal,
    //     activeUsers: dealsAnalytics?.some(
    //       (e) => e.dealId.toString() === deal.id.toString(),
    //     )
    //       ? dealsAnalytics
    //           .filter((item) => item.dealId.toString() === deal.id.toString())
    //           .map((item) => item.activeUsers)
    //           .toString()
    //       : null,
    //   }))
    //   .filter((item) => item.activeUsers)
    //   .sort((a, b) => {
    //     return b.activeUsers - a.activeUsers;
    //   });
    // console.log('dealsAnalytics1', dealsAnalytics);
    // console.log('dealsWithAnalytics1', dealsWithAnalytics);
    const dealsWithPage = dealsTrending.deals.slice(page * 10, page * 10 + 10);
    const { lastItem } = dealsTrending;

    let hasMore = true;
    if (dealsWithPage.some((item) => item.id === lastItem.id)) {
      hasMore = false;
    }

    const arrayWithAppleIds = dealsWithPage
      .map((deal) => deal.appAppleId)
      .filter((deal) => deal !== null)
      .join(',');
    let appIcons;
    if (arrayWithAppleIds) {
      const responseAppIcons = await fetch(
        `${apiURL()}/appsAppStore/${arrayWithAppleIds}`,
      );
      const jsonAppIcons = await responseAppIcons.json();
      appIcons = jsonAppIcons.results;
    } else {
      appIcons = [];
    }

    const arrayWithIcons = dealsWithPage.map((deal) => ({
      ...deal,
      iconUrl: appIcons?.some((e) => e.trackId.toString() === deal.appAppleId)
        ? appIcons
            .filter((appleId) => appleId.trackId.toString() === deal.appAppleId)
            .map((item) => item.artworkUrl512)[0]
            .toString()
        : null,
    }));

    setApps((prevItems) => {
      return {
        data: [...prevItems.data, ...arrayWithIcons],
        lastItem,
        hasMore,
      };
    });
    setPage((prevPage) => prevPage + 1);
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
  //   setPage(0);
  // }, [orderByTrending]);

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
      const response = await fetch(`${apiURL()}/categories`);
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
      const response = await fetch(`${apiURL()}/searches/`);
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

  const categoriesList = categories.map((category) => {
    if (categoryIdParam) {
      return (
        <Link to={`/deals/category/${category.id}`}>
          <Button
            primary={
              category.id.toString() === categoryIdParam.toString() && true
            }
            secondary={category.id !== categoryIdParam && true}
            label={category.title}
          />
        </Link>
      );
    }
    return (
      <Link to={`/deals/category/${category.id}`}>
        <Button secondary label={category.title} />
      </Link>
    );
  });

  const appsList = appTitles.map((topic) => {
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

  let sortOptions;
  if (
    !appIdParam &&
    !categoryIdParam &&
    !searchTermIdParam &&
    !topicIdParam &&
    !searchParam
  ) {
    sortOptions = ['Recent', 'Trending', 'A-Z', 'Z-A'];
  } else {
    sortOptions = ['Recent', 'A-Z', 'Z-A'];
  }

  // replace with function

  useEffect(() => {
    let column;
    let direction;
    if (sortOrder === 'Trending') {
      setOrderByTrending(true);
      setOrderBy({ column: 'id', direction: 'desc' });
    } else if (sortOrder === 'A-Z') {
      column = 'title';
      direction = 'asc';
      setOrderByTrending(false);
      setOrderBy({ column, direction });
    } else if (sortOrder === 'Z-A') {
      column = 'title';
      direction = 'desc';
      setOrderByTrending(false);
      setOrderBy({ column, direction });
    } else if (sortOrder === 'Recent') {
      column = 'id';
      direction = 'desc';
      setOrderByTrending(false);
      setOrderBy({ column, direction });
    }
  }, [sortOrder]);

  let pageTitle;
  let metaContent;
  let metaDescription;
  if (topicIdParam) {
    metaContent = topics
      .filter((topic) => topic.id === parseInt(topicIdParam, 10))
      .map((item) => item.title);
    pageTitle = `${metaContent} - app deals`;
    metaDescription = `${metaContent} best app deals, referral codes, coupons, discounts`;
  } else if (categoryIdParam) {
    metaContent = categories
      .filter((category) => category.id === parseInt(categoryIdParam, 10))
      .map((item) => item.title);
    pageTitle = `${metaContent} - app deals`;
    metaDescription = `${metaContent} best app deals, referral codes, coupons, discounts`;
  } else if (appIdParam) {
    metaContent = appTitles
      .filter((category) => category.id === parseInt(appIdParam, 10))
      .map((item) => item.title);
    metaDescription = appTitles
      .filter((category) => category.id === parseInt(appIdParam, 10))
      .map((item) =>
        item.meta_description
          ? item.meta_description
          : `${item.title} app deals, referral codes, coupons, discounts`,
      );
    pageTitle = `${metaContent} app deals`;
  } else if (searchTermIdParam) {
    pageTitle = `${searchTermsDb
      .filter((searchTerm) => searchTerm.id === parseInt(searchTermIdParam, 10))
      .map((item) => item.title)} - Top App Deals`;
    metaDescription = 'Find best app deals and referral codes';
  } else if (searchParam) {
    pageTitle = `${capitalize(searchParam)} App Deals`;
    metaDescription = `Find best ${searchParam} app deals and referral codes`;
  } else {
    pageTitle = 'Top App Deals - best app deals';
    metaDescription = 'Find best app deals and referral codes';
  }

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
        <meta name="description" content={metaDescription} />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero apps">
        <h1 className="hero-header">
          {categoryIdParam || topicIdParam || appIdParam || searchParam
            ? `${pageTitle}`
            : searchTermIdParam
            ? `${searchTermsDb
                .filter(
                  (searchTerm) =>
                    searchTerm.id === parseInt(searchTermIdParam, 10),
                )
                .map((item) => item.title)}`
            : 'Browse best app deals'}
        </h1>
        {/* <form className="home">
          <label>
            <FontAwesomeIcon className="search-icon" icon={faSearch} />
            <input
              type="text"
              className="input-search-home"
              onChange={handleSearch}
              placeholder="Search best deals..."
            />
          </label>
        </form> */}
        {/* {searchTerms ? (
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
        )} */}
      </div>
      <section className="container-topics-desktop">
        <Link to="/">
          <Button
            primary={!categoryIdParam}
            secondary={categoryIdParam}
            label="All categories"
          />
        </Link>
        {categoriesList}
      </section>
      <section className="container-filters">
        <Button
          secondary
          className="button-topics special-padding"
          onClick={(event) => setShowTopicsContainer(!showTopicsContainer)}
          backgroundColor="#ffe5d9"
          label="Categories"
        />
        <DropDownView
          // label="Sort"
          selectedOptionValue={sortOrder}
          className="no-line-height"
          options={sortOptions}
          // selectedOptionValue - can be removed
          // selectedOptionValue={
          //   pathname === '/' && orderByTrending
          //     ? 'Trending'
          //     : pathname !== '/'
          //     ? 'Recent'
          //     : undefined
          // }
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
          className="special-padding"
          secondary
          onClick={() => setListView(!listView)}
          backgroundColor="#ffe5d9"
        >
          <div className="filter-grid">
            <FontAwesomeIcon icon={faGrip} />
            <FontAwesomeIcon icon={faList} />
          </div>
        </Button>
      </section>
      <section
        className={`container-topics-mobile ${showTopicsContainer && 'show'}`}
      >
        <Link to="/">
          <Button
            primary={!categoryIdParam}
            secondary={categoryIdParam}
            label="All categories"
          />
        </Link>
        {categoriesList}
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
      {loadingFirstFetch ? (
        <Loading />
      ) : apps.data ? (
        <section className="container-scroll">
          <InfiniteScroll
            dataLength={apps.data.length}
            next={orderByTrending ? fetchAppsTrending : fetchApps}
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
                  title={
                    pathname.includes('/codes') ? app.dealTitle : app.title
                  }
                  description={removeMarkdown(app?.description)}
                  referralCode={pathname.includes('/codes') ? app.title : null}
                  referralCodeOnClick={
                    pathname.includes('/codes')
                      ? () => copyToClipboard(app.title)
                      : null
                  }
                  url={app.url}
                  cardUrl={
                    pathname.includes('/codes')
                      ? `/codes/${app.id}`
                      : `/deals/${app.id}`
                  }
                  urlImage={
                    app.iconUrl === null
                      ? `http://res.cloudinary.com/dgarvanzw/image/upload/w_${
                          listView ? '500' : '700'
                        },q_auto,f_auto/deals/deal.svg`
                      : app.iconUrl
                  }
                  urlImageIcon={app.iconUrl !== null}
                  topic={app.topicTitle}
                  topicId={app.topic_id}
                  appTitle={app.appTitle}
                  appId={app.app_id}
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
