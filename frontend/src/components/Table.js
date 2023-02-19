import React, { Component } from 'react';
import '../css/Table.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'


class Table extends Component {

  constructor(props) {
    super(props);
    this.state = {
      headers: this.props.headers,
      initialData: this.props.initialData,
      sortby: null,
      descending: false,
      edit: {},
      search: true,

    };

    this._sort = this._sort.bind(this);
    this._showEditor = this._showEditor.bind(this);
    this._save = this._save.bind(this);
    this._renderSearch = this._renderSearch.bind(this);
    this._search = this._search.bind(this);
    this._toggleSearch = this._toggleSearch.bind(this);
    this._renderToolbar = this._renderToolbar.bind(this);
    this._preSearchData = this.state.initialData;


  }

  _sort(e) {
    let column = e.target.cellIndex;
    let initialData = this.state.initialData.slice();
    let descending = this.state.sortby === column && !this.state.descending;

    initialData.sort(function (a, b) {
      return descending
        ? (a[column] < b[column] ? 1 : -1)
        : (a[column] > b[column] ? 1 : -1);
    });

    this.setState({
      initialData: initialData,
      sortby: column,
      descending: descending,
    });
  }

  _showEditor(e) {
    console.log('haider', e.target.dataset.abc);
    this.setState({
      edit: {
        row: parseInt(e.target.dataset.row, 10),
        cell: e.target.cellIndex,
      }
    });
  }

  _save(e) {
    e.preventDefault();
    let input = e.target.firstChild;
    let initialData = this.state.initialData.slice();
    initialData[this.state.edit.row][this.state.edit.cell] = input.value;
    this.setState({
      edit: null,
      initialData: initialData,
    });
  }

  _toggleSearch() {
    if (this.state.search) {
      this.setState({
        initialData: this._preSearchData,
        search: false,
      });
      this._preSearchData = null;
    } else {
      this._preSearchData = this.state.initialData;
      this.setState({
        search: true,
      });
    }
  }

  _preSearchData = null;

  _search(e) {
    var needle = e.target.value.toLowerCase();
    if (!needle) {
      this.setState({ initialData: this._preSearchData });
      return;
    }
    var idx = e.target.dataset.idx;
    var searchdata = this._preSearchData.filter((row) => {
      return row[idx].toString().toLowerCase().indexOf(needle) > -1;
    });
    this.setState({ initialData: searchdata });
  }


  _renderSearch() {
    if (!this.state.search) {
      return null;
    }
    return (
      <tr class="search-row" onChange={this._search}>
        {this.props.headers.map(function (_ignore, idx) {
          return <td key={idx}>
            <div class="search-div" >
              <input type="text" data-idx={idx}></input>
              <i><FontAwesomeIcon icon={faSearch} /></i>
            </div>
          </td>
        })}
      </tr>
    );
  }
  _renderToolbar() {
    return <button onClick={this._toggleSearch} className='btn btn-primary'>
      Filter Leaves
    </button >
  }


  _renderTable() {
    return (
      <div className="container">
        <table className="table">
          <thead>
            <tr>
              {this.state.headers.map((v, i) => {
                if (this.state.sortby === i) {
                  v += this.state.descending ? ' \u2191' : ' \u2193'
                }
                return (
                  <th key={i} onClick={this._sort}>
                    {v}
                  </th>
                )
              }, this)
              }
            </tr>
          </thead>
          <tbody className="table-body" onDoubleClick={this._showEditor}>
            {this._renderSearch()}
            {this.state.initialData.map((row, rowidx) => {
              return (
                <tr key={rowidx} className="cell-1" data-toggle="modal" data-target={"#modal-" + row[0]}>
                  {row.map((cell, idx) => {
                    var content = cell;
                    var edit = this.state.edit;
                    if (edit && edit.row === rowidx && edit.cell === idx) {
                      content = (
                        <form onSubmit={this._save}>
                          <input type="text" defaultValue={cell} />
                        </form>
                      )
                    }
                    return (
                      <td key={idx} data-row={rowidx}>{content}</td>
                    )
                  }, this)
                  }
                </tr>
              )
            }, this)
            }
          </tbody>
        </table >
      </div>
    )
  }





  render() {
    return (
      <div>
        {this._renderTable()}
        {/* {this._renderToolbar()} */}
      </div>
    )
  }
}

export default Table;

