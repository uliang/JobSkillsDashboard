import React, { useMemo, useState } from "react";
import PlotControl from "./plotControl";
import Chart from "./charter";
import Selector from "./selector";
import { withStyles } from "@material-ui/core/styles";
import * as chroma from "chroma-js";
import { CollectionsContext } from "../context";
import Fetch from "./fetcher";
import { findURLFromCollection } from "../utils";

const style = theme => ({ root: { width: "1200px" } });

const EmployersChart = ({ jsonResp, refetch, classes }) => {
  const [value, setValue] = useState(
    findURLFromCollection(jsonResp._links, "self")
  );
  const options = useMemo(
    () =>
      jsonResp.args.limit.map((item, i) => ({
        key: i,
        value: value.replace(/limit=\d+/, `limit=${item}`),
        label: item
      })),
    [jsonResp, value]
  );

  const handleChange = e => {
    setValue(e.target.value);
    refetch({ url: e.target.value });
  };
  const traces = useMemo(
    function() {
      const markerColors = chroma.scale(["2C3E50", "4CA1AF"]).colors(3);

      return jsonResp.data.map(({ Employer, job_postings, year }, i) => ({
        name: year,
        y: Employer,
        x: job_postings,
        type: "bar",
        orientation: "h",
        marker: { color: markerColors[i] }
      }));
    },
    [jsonResp]
  );

  return (
    <div className={classes.root}>
      <PlotControl
        title={`Top ${jsonResp.limit} employers for ${jsonResp.sector} sector`}
        toolTipText={
          "Graph showing total number advertised job postings from companies or " +
          "organizations in Singapore for the past three years."
        }
      >
        <Selector
          TextFieldProps={{
            helperText: "Select number of employers...",
            value,
            onChange: handleChange,
            label: "Top employers"
            //style: { width: "20%" }
          }}
          options={options}
        />{" "}
      </PlotControl>
      <Chart
        data={traces}
        layout={{
          width: 1200,
          height: 516,
          title: `Top ${jsonResp.limit} Employers`,
          xaxis: {
            title: { text: "Number of job postings" }
          },
          yaxis: {
            tickfont: { size: 10 },
            categoryorder: "array",
            categoryarray: jsonResp.category_array.reverse()
          },
          barmode: "stack",
          margin: { l: 300 },
          legend: { orientation: "h", x: 0, y: -0.2 }
        }}
      />
    </div>
  );
};

const StyledEmployersChart = withStyles(style)(EmployersChart);

export default function(props) {
  return (
    <CollectionsContext.Consumer>
      {value => (
        <Fetch
          url={findURLFromCollection(value, "employers")}
          render={(data, refetch) => (
            <StyledEmployersChart jsonResp={data} refetch={refetch} />
          )}
        />
      )}
    </CollectionsContext.Consumer>
  );
}
