import React, { useState } from "react";
import { RowLayout, Layout } from "./layout";
import TrendChart from "./trendChart";
import EmployerChart from "./employerChart";
import EducationChart from "./educationChart";
import TopOccupations from "./topOccupations";
import TopSkills from "./topSkills";
import SkillRankTrend from "./skillRankTrend";
import SkillComposition from "./skillComposition";
import { withStyles, AppBar, Tabs, Tab } from "@material-ui/core";
import ClusterChart from "./clusterChart";
import ClusterComposition from "./clusterComposition";
import RadarChart from "./radarChart";

const style = {};

function ChartLayout(props) {
  const [tab, setTab] = useState(0);

  return (
    <>
      <AppBar position="static" color="default">
        <Tabs
          value={tab}
          onChange={(event, newValue) => setTab(newValue)}
          centered
        >
          <Tab label="Clusters" />
          <Tab label="Skills" />
          <Tab label="Occupations" />
        </Tabs>
      </AppBar>
      {tab === 1 && (
        <Layout>
          <RowLayout>
            <TopSkills />
            <SkillRankTrend />
          </RowLayout>
          <SkillComposition />
        </Layout>
      )}
      {tab === 2 && (
        <Layout>
          <RowLayout>
            <TopOccupations />
            <TrendChart />
          </RowLayout>
          <EmployerChart />
          <EducationChart />
        </Layout>
      )}
      {tab === 0 && (
        <Layout>
          <RadarChart />
          <RowLayout>
            <ClusterChart />
            <ClusterComposition />
          </RowLayout>
          <div />
        </Layout>
      )}
    </>
  );
}

export default withStyles(style)(ChartLayout);
