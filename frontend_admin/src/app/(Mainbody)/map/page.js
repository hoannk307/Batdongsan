"use client";
import { VectorMap } from '@south-paw/react-vector-maps';
import React, { Fragment } from 'react'
import { Container } from 'reactstrap';
import india from '../../../data/map/india.json';
import world from '../../../data/map/world.json';
import usa from '../../../data/map/usa.json';
import australia from '../../../data/map/australia.json';
import Breadcrumb from '@/components/Common/Breadcrumb';

const Map = () => {
    return (
        <Fragment>
            <Breadcrumb title='Map' titleText='Welcome to admin panel' parent='Map' />
            <Container fluid={true}>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-header pb-0">
                                <h5>Vector world map</h5>
                            </div>
                            <div className="card-body">
                                <VectorMap {...world} style={{ fill: '#F34451' }} className="jvector-map-height simplemap" id="world-map" />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-header pb-0">
                                <h5>Vector USA map</h5>
                            </div>
                            <div className="card-body">
                                <VectorMap {...usa} style={{ fill: '#F35D43' }} className="jvector-map-height simplemap" id="usa" />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-header pb-0">
                                <h5>Vector Australia map</h5>
                            </div>
                            <div className="card-body">
                                <VectorMap {...australia} style={{ fill: '#89C826' }} className="jvector-map-height simplemap" id="australia" />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card">
                            <div className="card-header pb-0">
                                <h5>Vector India map</h5>
                            </div>
                            <div className="card-body">
                                <VectorMap {...india} style={{ fill: '#FFCC33' }} className="jvector-map-height simplemap" id="india" />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Fragment>
    )
}

export default Map