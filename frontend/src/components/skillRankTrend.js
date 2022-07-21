import React, { useEffect, useState, useMemo } from "react";
import { withStyles } from "@material-ui/core/styles";
import Chart from "./charter";
import PlotControl from "./plotControl";
import Selector from "./selector";
import chroma from "chroma-js";
import { range, findURLFromCollection } from "../utils";
import { CollectionsContext } from "../context";
import Fetch from "./fetcher";

const style = { root: { width: "868px" } };
const markerColors = [
  ...chroma.scale(["2C3E50", "4CA1AF"]).colors(5),
  ...chroma.scale(["8856a7", "9ebcda"]).colors(5)
];

const SkillRank = ({ jsonResp, refetch, classes }) => {
  const [value, setValue] = useState(
    findURLFromCollection(jsonResp._links, "self")
  );
  const [layout, setLayout] = useState({});

  const options = useMemo(
    () =>
      jsonResp.args.base_year.map((item, i) => ({
        key: i,
        label: item === 9999 ? "All" : item,
        value: value.replace(/base_year=[\w\d]+/, `base_year=${item}`)
      })),
    [value, jsonResp]
  );

  const handleChange = e => {
    setValue(e.target.value);
    refetch({ url: e.target.value });
  };

  const traces = useMemo(
    () =>
      jsonResp.data.map(({ name, value, year, country }, i) => {
        let draftTrace = {
          name,
          x: year,
          y: value,
          type: "scatter",
          mode: "lines+markers",
          marker: { color: markerColors[i] },
          legendgroup: country
        };
        if (country === "United States") {
          return { ...draftTrace, xaxis: "x2", yaxis: "y2" };
        }
        return draftTrace;
      }),
    [jsonResp]
  );

  useEffect(() => {
    const yaxis2 = {
      showgrid: false,
      showline: false,
      // showticklabels: false,
      ticks: "",
      autorange: "reversed",
      rangemode: "tozero",
      zerolinecolor: "white"
      // tickmode: "array",
      // tickvals: Array(10)
      //   .fill(1)
      //   .map((n, i) => n + i)
    };
    const xaxis = {
      tickmode: "array",
      tickvals: range(2016, 2019),
      title: "Singapore"
    };
    const xaxis2 = { ...xaxis, title: "United States" };
    let draftLayout = {
      width: 868,
      height: 516,
      title: "Trends in skill demand",
      legend: {
        orientation: "h",
        x: 0.25,
        y: -0.25,
        tracegroupgap: 5,
        // traceorder: "grouped",
        font: { size: 10 }
        // yanchor: "bottom"
      },
      grid: {
        rows: 1,
        columns: 2,
        pattern: "independent"
      },
      yaxis: { title: jsonResp.value_field },
      xaxis,
      xaxis2
    };
    draftLayout =
      jsonResp.value_field === "Rank"
        ? {
            ...draftLayout,
            yaxis2,
            yaxis: Object.assign(draftLayout.yaxis, yaxis2)
          }
        : draftLayout;

    setLayout(draftLayout);
  }, [jsonResp]);

  return (
    <div className={classes.root}>
      <PlotControl
        title={"Skill demand trends"}
        toolTipText={`Graph showing the change in ${
          jsonResp.value_field !== "Rank" ? "absolute" : "ranked"
        } job postings for skills for the past 3 years.`}
      >
        <Selector
          TextFieldProps={{
            helperText: "Select year...",
            value,
            onChange: handleChange,
            label: "Year"
          }}
          options={options}
        />
      </PlotControl>
      <Chart data={traces} layout={layout} />
    </div>
  );
};

const StyledSkillRank = withStyles(style)(SkillRank);

export default function(props) {
  return (
    <CollectionsContext.Consumer>
      {value => (
        <Fetch
          url={findURLFromCollection(value, "skill_trends")}
          render={(data, refetch) => (
            <StyledSkillRank jsonResp={data} refetch={refetch} />
          )}
        />
      )}
    </CollectionsContext.Consumer>
  );
}
