import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Categories } from './containers/Categories/Categories.Container';
import { AllApps } from './containers/AllApps/AllApps.Container';
import { Apps } from './containers/Apps/Apps.Container';
import { LandingPage } from './containers/LandingPage/LandingPage.Container';
import TestPage from './containers/TestPage/TestPage.Container';
import { Prompts } from './containers/Prompts/Prompts.Container';
import { DealView } from './containers/DealView/DealView.container';
import { AppView } from './containers/AppView/AppView.container';
import { CodeView } from './containers/CodeView/CodeView.container';
import { Signup } from './containers/Signup/Signup.Container';
import Login from './containers/Login/Login.Container';
import Reset from './containers/Reset/Reset.Container';
import { Dashboard } from './containers/Dashboard/Dashboard.Container';
import { Bookmarks } from './containers/Bookmarks/Bookmarks.Container';
import { Faq } from './containers/Faq/Faq.Container';
import { Submit } from './containers/Submit/Submit.Container';
import { StripeSuccess } from './containers/StripeSuccess/StripeSuccess.Container';
import { StripeCancel } from './containers/StripeCancel/StripeCancel.Container';
import { PageNotFound } from './containers/PageNotFound/PageNotFound.Container';
import { Navigation } from './components/Navigation/Navigation.component';
import { Footer } from './components/Footer/Footer.component';
import { UserProvider } from './userContext';
import { Community } from './containers/Community/Community.Container';
import { SubmitThread } from './containers/SubmitThread/SubmitThread.Container';
import { ThreadView } from './containers/ThreadView/ThreadView.container';

function App() {
  return (
    <div className="app">
      <Router>
        <UserProvider>
          <Navigation />
          <Routes>
            <Route path="/" element={<Apps />} />
            <Route path="/codes" element={<Apps />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/test" element={<Prompts />} />
            <Route path="/all-apps" element={<AllApps />} />
            <Route path="/categories" element={<Categories />} />
            <Route exact path="/deals/:id" element={<DealView />} />
            <Route exact path="/apps/:id" element={<AppView />} />
            <Route exact path="/deals/topic/:topicIdParam" element={<Apps />} />
            <Route
              exact
              path="/deals/category/:categoryIdParam"
              element={<Apps />}
            />
            <Route
              exact
              path="/deals/searchterm/:searchTermIdParam"
              element={<Apps />}
            />
            <Route exact path="/deals/search/:searchParam" element={<Apps />} />
            <Route exact path="/deals/app/:appIdParam" element={<Apps />} />
            <Route exact path="/codes/:id" element={<CodeView />} />
            <Route exact path="/faq" element={<Faq />} />
            <Route exact path="/codes/new" element={<Submit />} />
            <Route exact path="/success" element={<StripeSuccess />} />
            <Route exact path="/cancel" element={<StripeCancel />} />
            <Route exact path="/bookmarks" element={<Bookmarks />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/threads/new" element={<SubmitThread />} />
            <Route
              exact
              path="community/threads/:id"
              element={<ThreadView />}
            />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/reset" element={<Reset />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Footer />
        </UserProvider>
      </Router>
    </div>
  );
}

export default App;
