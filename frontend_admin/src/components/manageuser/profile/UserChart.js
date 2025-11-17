import React from "react";
import { Card, CardBody } from "reactstrap";
import { Useroptions, userseries } from "../../../data/manage-profile/profiledata";
import ReactApexChart from "react-apexcharts";

const UserChart = () => {
  return (
    <Card>
      <CardBody>
        <div className='title-about'>
          <h5>Total users</h5>
        </div>
        <div className='total-container'>
          <div id='userchart' />
          <ReactApexChart options={Useroptions} series={userseries} type='donut' width={320} />
        </div>
      </CardBody>
    </Card>
  );
};

export default UserChart;
