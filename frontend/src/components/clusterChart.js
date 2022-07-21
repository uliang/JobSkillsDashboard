import React, { useMemo } from "react";
import { withStyles } from "@material-ui/core";
import Fetch from "./fetcher";
import Chart from "./charter";
import PlotControl from "./plotControl";

const style = { root: { width: "590px" }, padding: { height: "4.3rem" } };

function ClusterChart({ jsonResp: { data }, classes }) {
  const info = useMemo(() => {
    const zip = require("lodash.zip");
    return zip(data.label, data.prevalence).map(
      ([label, size]) =>
        `Cluster ${label}<br> Prevalence: ${Math.round(size * 100) /
          100} <extra></extra>`
    );
  }, [data]);
  return (
    <div className={classes.root}>
      <PlotControl
        title={"Cluster distribution"}
        toolTipText={
          "Distribution of basic skill set clusters. Individual jobs are a " +
          "combination of one or more of such clusters." +
          " The closer the clusters are to each other, the more similar there are " +
          " in the sense that some of the skills they contain are distributed similiarly " +
          " to another set of skills from the other cluster."
        }
      >
        <div className={classes.padding} />
      </PlotControl>
      <Chart
        data={[
          {
            x: data.component_1,
            y: data.component_2,
            name: "Skill clusters",
            mode: "markers+text",
            text: data.label.map(i => `Cluster ${i}`),
            textposition: "bottom center",
            marker: {
              size: data.prevalence,
              sizemode: "area",
              sizeref: 0.035
            },
            hovertemplate: info,
            textfont: { size: 8 }
          }
        ]}
        layout={{
          width: 590,
          height: 516,
          title: "Skill Cluster Similiarity Map",
          hovermode: "closest",
          xaxis: { color: "white" },
          yaxis: { color: "white" }
        }}
      />
    </div>
  );
}

const StyledClusterChart = withStyles(style)(ClusterChart);

export default function(props) {
  return (
    <Fetch
      url={"/api/v2/cluster"}
      render={(data, _) => <StyledClusterChart jsonResp={data} />}
    />
  );
}
