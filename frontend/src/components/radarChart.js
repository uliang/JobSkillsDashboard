import React, { useMemo } from "react";
import { withStyles } from "@material-ui/core/styles";
import Fetch from "./fetcher";
import { CollectionsContext } from "../context";
import { findURLFromCollection } from "../utils";
import Chart from "./charter";
import PlotControl from "./plotControl";

const style = { root: { width: "1200px" } };

function RadarChart({ jsonResp: { data } }) {
  const traces = useMemo(
    () => [
      {
        type: "bar",
        x: data.cluster_label,
        y: data.probability,
        marker: { color: "4CA1AF" }
      }
    ],
    [data]
  );
  return (
    <React.Fragment>
      <PlotControl
        title={"Cluster importances within sector"}
        toolTipText={
          "Bar chart shows the importance in terms of estimated percentage" +
          " of jobs a cluster has to this sector. The higher the bar, the more likely " +
          "we are to find jobs requiring such skill sets for this sector."
        }
      />
      <Chart
        data={traces}
        layout={{
          title: "Cluster importance",
          width: 1200,
          height: 400,
          yaxis: { title: "Probability" },
          xaxis: {
            title: "Cluster Label",
            type: "category",
            tickmode: "array",
            tickvals: data.cluster_label
          }
        }}
      />{" "}
    </React.Fragment>
  );
}

const StyledRadarChart = withStyles(style)(RadarChart);

export default function(props) {
  return (
    <CollectionsContext.Consumer>
      {value => (
        <Fetch
          url={findURLFromCollection(value, "centroid")}
          render={(data, refetch) => <StyledRadarChart jsonResp={data} />}
        />
      )}
    </CollectionsContext.Consumer>
  );
}
