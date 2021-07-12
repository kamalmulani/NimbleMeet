import { Grid } from '@material-ui/core';
import React, {Component} from 'react';
import '../../App.css';

class DataTrack extends Component {
    constructor(props) {
        super(props)
        this.ref = React.createRef();
      }

      componentDidMount() {
        if (this.props.track != null) {
          var child = this.props.track.attach();
          this.ref.current.classList.add(this.props.track.kind);
          this.ref.current.appendChild(child);
        }
      }
    

      render() {
        return (
          <Grid item >
          <div className="track" ref={this.ref}>
          </div> 
          </Grid>
        )
      }
  
}

export default DataTrack;
