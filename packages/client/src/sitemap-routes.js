import React from 'react';
import { Route } from 'react-router-dom';

export default (
  <Route>
    <Route exact path="/deals/:id" />
    <Route exact path="/deals/topic/:topicIdParam" />
    <Route exact path="/deals/category/:categoryIdParam" />
    <Route exact path="/deals/search/:searchIdParam" />
    <Route exact path="/faq" />
    <Route exact path="/login" />
    <Route exact path="/signup" />
  </Route>
);
