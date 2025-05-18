import { apiURL } from '../apiURL';

export const exampleFunction = async () => {
  const response = await fetch(
    `https://forkify-api.herokuapp.com/api/search?q=1`,
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data;
};

export const fetchDeals = async () => {
  const response = await fetch(`${apiURL()}/deals/`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data;
};

export const fetchTopics = async () => {
  const response = await fetch(`${apiURL()}/topics/`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data;
};

export const fetchCategories = async () => {
  const response = await fetch(`${apiURL()}/categories/`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data;
};

export const fetchBlogs = async () => {
  const response = await fetch(`${apiURL()}/blogs/`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data;
};

export const fetchSingleBlog = async (blogSlug) => {
  const response = await fetch(`${apiURL()}/blogs/${blogSlug}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data[0];
};

export const fetchSingleAuthor = async (id) => {
  const response = await fetch(`${apiURL()}/authors/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data[0];
};

export const fetchSingleTag = async (id) => {
  const response = await fetch(`${apiURL()}/tags/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data[0];
};

export const fetchThreads = async () => {
  const response = await fetch(`${apiURL()}/threads/`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data;
};

export const fetchSingleThread = async (id) => {
  const response = await fetch(`${apiURL()}/threads/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data[0];
};

export const fetchRepliesForThread = async (id) => {
  const response = await fetch(`${apiURL()}/replies?thread=${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch');
  }
  return data;
};
