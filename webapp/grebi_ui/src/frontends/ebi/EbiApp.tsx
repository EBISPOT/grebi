
import React, { Fragment } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import {Helmet} from "react-helmet";

import MuiThemeProvider from '@mui/styles/ThemeProvider'
import createTheme from '@mui/material/styles/createTheme'
import EbiDownloadsPage from "./pages/EbiDownloadsPage";
import EbiErrorPage from "./pages/EbiErrorPage";
import EbiHomePage from "./pages/EbiHomePage";
import EbiNodePage from "./pages/EbiNodePage";
import EbiSearchPage from "./pages/EbiSearchPage";

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff0000',
    },
    secondary: {
      main: '#ff0000',
    }
  }
});


class EbiApp extends React.Component {
  render() {
    return (
       <MuiThemeProvider theme={theme}>
      <Fragment>
        <Helmet>
          <meta charSet="utf-8" />
          <title>EMBL-EBI Knowledge Graph</title>
        </Helmet>
      <BrowserRouter basename={process.env.PUBLIC_URL!}>
        <Routes>
          <Route path={`*`} element={<EbiErrorPage />} />
          <Route path={`/error`} element={<EbiErrorPage />} />

          <Route path={`/`} element={<EbiHomePage />} />
          <Route path={`/subgraphs/:subgraph/search`} element={<EbiSearchPage />} />
          <Route path={`/subgraphs/:subgraph/nodes/:nodeId`} element={<EbiNodePage />} />

          <Route path={`/downloads`} element={<EbiDownloadsPage />} />
        </Routes>
        {/* <EbiFooter /> */}
      </BrowserRouter>
      </Fragment>
      </MuiThemeProvider>
    );
  }
}

export default EbiApp;

