import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from '../Button/Button.component';

import './CardCategories.styles.css';

export const CardCategories = ({ title, url, topics, slug }) => {
  return (
    <div className="card-category-new">
      {url && (
        <Link to={`/deals/category/${url}`}>
          <h2>{title}</h2>
        </Link>
      )}
      {!url && <h2>{title}</h2>}
      <div className="topics-div">
        {topics.map((topic) => (
          <Link to={`/deals/${slug}/${topic.id}`}>
            <Button secondary label={topic.title} />
          </Link>
        ))}
      </div>
    </div>
  );
};

CardCategories.propTypes = {
  title: PropTypes.string,
  slug: PropTypes.string,
  url: PropTypes.shape,
  topics: PropTypes.shape,
};

CardCategories.defaultProps = {
  title: null,
  slug: null,
  url: null,
  topics: null,
};
