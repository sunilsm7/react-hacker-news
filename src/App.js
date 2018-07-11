import React, { Component } from 'react';
import './App.css';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramvo, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
  {
    title: 'Django Blog',
    url: 'https://github.com/sunilsm7/django_blog',
    author: 'sunilsm7',
    num_comments: 6,
    points: 5,
    objectID: 2,
  },
  {
    title: 'React landing page',
    url: 'https://github.com/sunilsm7/landing-page',
    author: 'sunilsm7',
    num_comments: 4,
    points: 4,
    objectID: 3,
  },
];

const largeColumn = {
  width: '40%',
};

const midColumn = {
  width: '30%',
};

const smallColumn = {
  width: '10%',
};

const isSearched = (searchTerm) => item => item.title.toLowerCase().includes(searchTerm.toLocaleString());


class Button extends Component {
  render() {
    const {
      name='',
      onClick,
      className='',
      children,
    } = this.props;

    return (
      <button
        name={name}
        onClick={onClick}
        className={className}
        type="button"
      >
      { children }
      </button>
    );
  }
}


const Search = ({ value, onChange, children } ) => {
  return (
    <form className="form-inline">
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
          onChange={onChange} />
      </div>
    </form>
  )
}


class Table extends Component {
  render() {
    const {list, pattern, onDismiss, showMessage } = this.props;

    return (
      <div className="table">
        {list.filter(isSearched(pattern)).map(item =>
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



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list,
      searchTerm: '',
    };
    this.onDismiss = this.onDismiss.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  onDismiss(id) {
    console.log(id);

    const isNotId = item => item.objectID !== id;
    const updatedList = this.state.list.filter(isNotId);
    this.setState({ list: updatedList});
  }

  onSearchChange(event) {
    event.preventDefault();
    this.setState({ searchTerm: event.target.value});
  }

  showMessage(event) {
    console.log(event.target.name);
  }

  render() {
    const { searchTerm, list} = this.state;

    return (
      <div className="page">
        <div className="interactions">
          <h1 className="App-title">React Hacker News</h1>
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
          > Search
          </Search>
        </div>
        

        <Table
          list={list}
          pattern={searchTerm}
          onDismiss={this.onDismiss}
          showMessage={this.showMessage}
        />
      </div>
    );
  }
}

export default App;
