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

const isSearched = (searchTerm) => item => item.title.toLowerCase().includes(searchTerm.toLocaleString());

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
      <div className="App">
        <h1 className="App-title">Hacker News React</h1>
        <div className="Search-form">
          <form className="form-inline">
            <div className="form-group">
              <input
                type="text"
                name="q"
                className="form-control"
                placeholder="Search posts ...."
                onChange={this.onSearchChange} />
            </div>
          </form>
        </div>
        {list.filter(isSearched(searchTerm)).map((item)=> {

          return(
            <div key={item.objectID} className="card mb-2">
              <div className="card-body">
                <h5 className="card-title">
                  <a href={item.url}>{item.title}</a>
                </h5>
                <p className="card-text">
                  
                  <span>Author: {item.author}</span>
                  <span>Comments: {item.num_comments}</span>
                  <span>Points: {item.points}</span>
                </p>
                <span>
                  <button
                    onClick={() => this.onDismiss(item.objectID)}
                    type="button"
                    className="btn btn-primary mr-2">
                    Dismiss
                  </button>
                  <button
                    type="button"
                    name="btn-message"
                    className="btn btn-info"
                    onClick={this.showMessage}
                    >Show More
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default App;
