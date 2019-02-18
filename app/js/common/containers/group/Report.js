import React from 'react'
import {connect} from 'react-redux'
import {fetchData} from 'app/actions';

@connect((state) => {
    return {
        group: state
    }
})

export default class Report extends React.PureComponent {
    state = {
    }

    componentDidMount() {
        this.fetchData();
    }

    render() {

        console.log('All state', this.props)
        return (
            <div className="report-page">
                <h2>Data visual: people</h2>
            </div>
        )
    }
}