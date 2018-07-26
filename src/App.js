import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { sortBy } from 'lodash';

import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};


const largeColumn = {
  width: '40%',
};

const midColumn = {
  width: '30%',
};

const smallColumn = {
  width: '10%',
};



const Loading = () => <div> Loading...</div>;

const withLoading = (Component)  => ({ isLoading, ...rest}) =>
  isLoading
  ? <Loading />
  : <Component { ...rest } />;


const Button = ({
  onClick,
  className,
  children
}) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    { children }
  </button>


const ButtonWithLoading = withLoading(Button);

Button.defaultProps = {
  className: '',
}


Button.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

const Sort = ({ 
  sortKey,
  onSort,
  activeSortKey,
  children 
}) =>{
  const sortClass = classNames(
    'button-inline',
    {'button-active': sortKey === activeSortKey }
  )

  return (
    <Button
    onClick={ () => onSort(sortKey)}
    className={sortClass}
  >
    { children }
  </Button>
  );
}
  

class Search extends Component {

  componentDidMount() {
    if(this.input) {
      this.input.focus();
    }
  }

  render() {
    const {
      value,
      onChange,
      onSubmit,
      children
    } = this.props;

    return (
      <form className="form-inline" onSubmit={onSubmit}>
        <div className="form-group">
          { children }
        </div>

        <div className="form-group">
          <input
            type="text"
            name="q"
            value={value}
            className="form-control"
            placeholder="Search posts ...."
            onChange={onChange}
            ref={(node) => { this.input = node; }}
          />
        </div>
        <Button
          type="submit"
          className="btn btn-primary mr-2"
          onClick={onSubmit}>
          {children}
        </Button>
      </form>
    )
  }
}

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);

  }

 onSort(sortKey) {
  const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;

  this.setState({ sortKey, isSortReverse });
  }


  render() {
    const {
      list,
      onDismiss,
      showMessage 
    } = this.props;

    const {
      sortKey,
      isSortReverse,
    } = this.state;

    const sortedList = SORTS[sortKey](list);

    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;

    return (
      <div className="table">
        <div className="table-header">
          <span style={largeColumn}>
            <Sort
              sortKey={'TITLE'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >TITLE
            </Sort>
          </span>
          <span style={midColumn}>
            <Sort
              sortKey={'AUTHOR'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >AUTHOR
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey={'COMMENTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >COMMENTS
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey={'POINTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >POINTS
            </Sort>
          </span>
          <span style={smallColumn}>
            ARCHIVE
          </span>
        </div>
        {reverseSortedList.map(item =>
          <div key={item.objectID} className="table-row">
            <span style={largeColumn}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={midColumn}>
              Author: {item.author}
            </span>
            <span style={smallColumn}>
              Comments: {item.num_comments}
            </span>
            <span style={smallColumn}>
              Points: {item.points}
            </span>
              
            <span style={smallColumn}>
              <Button
                onClick={() => onDismiss(item.objectID)}
                className="button-inline btn btn-outline-primary mr-2">
                Dismiss
              </Button>
              <Button                
                name="btn-message"
                className="button-inline btn btn-outline-info mr-2"
                onClick={showMessage}
                >More
              </Button>
            </span>
          </div> 
        )}
      </div>
    )
  }
}

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
    objectID: PropTypes.string.isRequired,
    author: PropTypes.string,
    url: PropTypes.string,
    num_comments: PropTypes.number,
    points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
  showMessage: PropTypes.func,
}


const updateSearchTopStoriesState = (hits, page) => (prevState) => {
  const { searchKey, results } = prevState;

  const oldHits = results && results[searchKey]
    ? results[searchKey].hits
    : [];

  const updatedHits = [
    ...oldHits,
    ...hits
  ];

  return { 
    results: { 
      ...results,
      [searchKey]: { hits: updatedHits, page }
    } ,
    isLoading: false
  }
};


class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result){
    const { hits, page } = result;
    this.setState(updateSearchTopStoriesState(hits, page));
  }

  fetchSearchTopStories(searchTerm, page=0) {
    const search_url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
    this.setState({ isLoading: true });

    axios.get(search_url)
    .then(result => this._isMounted && this.setSearchTopStories(result.data))
    .catch(error => this._isMounted && this.setState({ error }));
  }

  componentDidMount() {
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      result: {
        ...results,
        [searchKey]: {hits: updatedHits, page }
      }
    });
  }

  onSearchChange(event) {
    event.preventDefault();
    this.setState({ searchTerm: event.target.value});
  }

  onSearchSubmit(event) {
    event.preventDefault();
    const { searchTerm } = this.state;
    console.log(searchTerm);

    this.setState({ searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
  }

  showMessage(event) {
    console.log(event.target.name);
  }

  render() {
    const {
      searchTerm,
      results,
      searchKey,
      error,
      isLoading
    } = this.state;

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <h1 className="App-title">React Hacker News</h1>
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          > Search
          </Search>
        </div>
        { error 
          ? <div className="interactions">
              <p>Something went wrong. </p>
            </div>
          : <Table
              list={list}
              onDismiss={this.onDismiss}
              showMessage={this.showMessage}
            />

        }
        
       
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
  
        </div>
      </div>
    );
  }
}

export default App;

export {
  Button,
  Search,
  Table
}