import React, { useMemo, useEffect, useState } from "react";
import { withStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Fetch from "./fetcher";
import { findURLFromCollection } from "../utils";
import PlotControl from "./plotControl";
import Slider from "@material-ui/lab/Slider";
import Typography from "@material-ui/core/Typography";
import Chart from "./charter";
import { shorten } from "../utils";

const style = theme => ({
  root: { width: "590px" },
  inputField: { marginRight: theme.spacing(2), marginLeft: "auto" },
  sliderLabel: { color: "gray" },
  sliderSpacing: { marginBottom: theme.spacing(4) }
});

function ClusterComposition({
  classes,
  jsonResp: {
    _links,
    data: { label }
  }
}) {
  const [url, setURL] = useState(findURLFromCollection(_links, "details"));
  const [clusterLabel, setClusterLabel] = useState(0);
  const [lambda, setLambda] = useState(0.6);

  useEffect(() => {
    setURL(
      url.replace(
        /cluster\/\d+\?l_=[\d.]+/,
        `cluster/${clusterLabel}?l_=${lambda}`
      )
    );
  }, [clusterLabel, lambda, url]);

  const handleClusterLabelChange = e => {
    setClusterLabel(Math.min(Math.max(...label), Math.max(0, e.target.value)));
  };
  return (
    <div className={classes.root}>
      <PlotControl
        title={"Cluster skill composition"}
        toolTipText={
          "Bar chart shows the key skills that describe the cluster. " +
          "Move the slider to adjust the relevance level of the skills to the cluster."
        }
      >
        <TextField
          label="Cluster"
          type="number"
          value={clusterLabel}
          onChange={handleClusterLabelChange}
          helperText="Choose cluster"
          style={{ width: "35%" }}
          classes={{ root: classes.inputField }}
        />
        <div>
          <Typography
            gutterBottom={true}
            variant={"caption"}
            classes={{
              root: classes.sliderLabel
              //gutterBottom: classes.sliderSpacing
            }}
          >
            Relevance scale{" "}
          </Typography>
          <Slider
            min={0}
            max={1}
            step={0.01}
            defaultValue={lambda}
            onChangeCommitted={(e, newValue) => setLambda(newValue)}
            valueLabelDisplay={"auto"}
            style={{ marginTop: "15px" }}
          />
        </div>
      </PlotControl>
      <Fetch
        url={url}
        render={(data, refetch) => (
          <ClusterCompositionChart jsonResp={data} refetch={refetch} />
        )}
      />
    </div>
  );
}

function ClusterCompositionChart({ jsonResp: { data }, refetch }) {
  const shorterName = data.name.map(i => shorten(i));
  const traces = useMemo(
    () => [
      {
        name: "Global skill count",
        y: shorterName,
        x: data.term_frequency,
        type: "bar",
        orientation: "h",
        marker: { color: "2C3E50" }
      },
      {
        name: "Expected skill count for topic",
        y: shorterName,
        x: data.pseudocount,
        type: "bar",
        orientation: "h",
        marker: { color: "4CA1AF" }
      }
    ],
    [data, shorterName]
  );

  const layout = {
    width: 580,
    height: 516,
    title: "Skill composition of cluster",
    barmode: "group",
    yaxis: {
      tickfont: { size: 11 },
      categoryorder: "array",
      categoryarray: shorterName.reverse()
    },
    margin: { l: 200 },
    legend: { orientation: "h", x: 0, y: -0.2 }
  };
  return <Chart data={traces} layout={layout} />;
}

const StyledClusterComposition = withStyles(style)(ClusterComposition);

export default function(props) {
  return (
    <Fetch
      url={"/api/v2/cluster"}
      render={data => <StyledClusterComposition jsonResp={data} />}
    />
  );
}
