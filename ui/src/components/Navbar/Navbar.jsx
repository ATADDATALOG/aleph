import React from 'react';
import { Link } from 'react-router-dom';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import queryString from 'query-string';
import { Button, Icon } from '@blueprintjs/core';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import AuthButtons from 'src/components/AuthButtons/AuthButtons';
import LanguageMenu from 'src/components/LanguageMenu/LanguageMenu';
import { selectSession } from 'src/selectors';
import SearchBox from 'src/components/Navbar/SearchBox';
import './Navbar.scss';

const messages = defineMessages({
  search_placeholder: {
    id: 'navbar.search_placeholder',
    defaultMessage: 'Search companies, people and documents.',
  },
  mobile_search_placeholder: {
    id: 'navbar.mobile_search_placeholder',
    defaultMessage: 'Search companies, people and ...',
  },
});


export class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchValue: '', isMenuOpen: false, searchOpen: false };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onOpenMenu = this.onOpenMenu.bind(this);
    this.onToggleSearch = this.onToggleSearch.bind(this);
  }


  componentDidMount() {
    const { query } = this.props;
    if (query !== undefined) {
      this.setState({ searchValue: query.getString('q') });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot.query.shouldUpdate) {
      this.updateSearchValue(snapshot.query.nextValue);
    }
  }

  onChange({ target }) {
    this.setState({ searchValue: target.value });
  }

  onSubmit = event => event.preventDefault();

  onOpenMenu(event) {
    event.preventDefault();
    this.setState(({ isMenuOpen }) => ({ isMenuOpen: !isMenuOpen }));
  }

  onToggleSearch(event) {
    event.preventDefault();
    this.setState(({ searchOpen }) => ({ searchOpen: !searchOpen }));
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (this.props.query && (prevProps.query.state.q !== this.props.query.state.q)) {
      if (this.props.query.state.q !== this.state.searchValue) {
        return {
          query: {
            shouldUpdate: true,
            nextValue: this.props.query.state.q || '',
          },
        };
      }
    }
    return {
      query: {},
    };
  }

  updateSearchValue = searchValue => this.setState({ searchValue });

  doSearch = (searchValue = this.state.searchValue) => {
    const { query, updateQuery, history } = this.props;
    if (updateQuery !== undefined) {
      updateQuery(query.set('q', searchValue));
    } else {
      history.push({
        pathname: '/search',
        search: queryString.stringify({
          q: searchValue,
        }),
      });
    }
  };


  render() {
    const {
      metadata, session, intl, isHomepage,
    } = this.props;
    const { isMenuOpen, searchOpen } = this.state;

    return (
      <div id="Navbar" className="Navbar">
        <nav className="bp3-navbar">
          <div className="navbar-header-search">
            <div className="bp3-navbar-group">
              <div className="bp3-navbar-heading">
                <Link to="/">
                  <img src={metadata.app.logo} alt={metadata.app.title} />
                </Link>
              </div>
              <div className="bp3-navbar-heading heading-title">
                <Link to="/">{metadata.app.title}</Link>
              </div>
            </div>

            <div className={searchOpen ? 'full-length-input visible-sm-flex' : 'hide'}>
              <button type="button" className="back-button visible-sm-block bp3-button bp3-large bp3-minimal bp3-icon-arrow-left" onClick={this.onToggleSearch} />
              {!isHomepage && (
              <form onSubmit={this.onSubmit} autoComplete="off" className="navbar-search-form">
                <SearchBox
                  doSearch={this.doSearch}
                  placeholder={intl.formatMessage(
                    searchOpen ? messages.mobile_search_placeholder : messages.search_placeholder,
                  )}
                  updateSearchValue={this.updateSearchValue}
                  searchValue={this.state.searchValue}
                />
              </form>
              )}
            </div>


            <div className={`search-and-burger-icons ${isHomepage && 'burger-fixed'}`}>
              {!isHomepage && (
                <a className="search-icon icon visible-sm-block" href="/" onClick={this.onToggleSearch}>
                  <Icon icon="search" />
                </a>
              )}
              <a className={`menu-icon icon visible-sm-block ${isMenuOpen && 'transform'}`} href="/" onClick={this.onOpenMenu}>
                <div className="bar1" />
                <div className="bar2" />
                <div className="bar3" />
              </a>
            </div>
            <div className={`navbar-options bp3-navbar-group ${isMenuOpen && 'show-menu-dropdown'}`} id="navbarSupportedContent">
              <div className="menu-items">
                <Link to="/sources">
                  <Button icon="database" className="bp3-minimal">
                    <FormattedMessage id="nav.sources" defaultMessage="Sources" />
                  </Button>
                </Link>
                {session.loggedIn
                  && (
                  <Link to="/cases">
                    <Button icon="briefcase" className="bp3-minimal">
                      <FormattedMessage id="nav.cases" defaultMessage="Cases" />
                    </Button>
                  </Link>
                  )
                }
                <div className="bp3-navbar-divider" />
                <AuthButtons session={session} auth={metadata.auth} />
                <LanguageMenu />
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
const mapStateToProps = state => ({ session: selectSession(state) });

export default compose(
  withRouter,
  connect(mapStateToProps),
  injectIntl,
)(Navbar);
