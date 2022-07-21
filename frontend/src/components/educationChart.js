import React, { useMemo, useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import PlotControl from "./plotControl";
import Chart from "./charter";
import * as chroma from "chroma-js";
import Selector from "./selector";
import Fetch from "./fetcher";
import { CollectionsContext } from "../context";
import { findURLFromCollection } from "../utils";

const style = { root: { width: "1200px" } };

const EducationChart = ({ jsonResp, refetch, classes }) => {
  const [value, setValue] = useState(
    findURLFromCollection(jsonResp._links, "self")
  );
  const options = useMemo(
    () =>
      jsonResp.args.year.map((item, i) => ({
        key: i,
        label: item,
        value: value.replace(/year=[\w\d]+/, `year=${item}`)
      })),
    [jsonResp, value]
  );

  const handleChange = e => {
    setValue(e.target.value);
    refetch({ url: e.target.value });
  };
  const traces = useMemo(
    function() {
      const markerColors = chroma.scale(["2C3E50", "4CA1AF"]).colors(5);

      return jsonResp.data.map(({ Education, Experience, num_of_jobs }, i) => ({
        name: Experience,
        x: num_of_jobs,
        y: Education,
        marker: { color: markerColors[i] },
        type: "bar",
        orientation: "h"
      }));
    },
    [jsonResp]
  );

  return (
    <div className={classes.root}>
      <PlotControl
        title={`Education requirements and experience for ${
          jsonResp.sector
        } sector`}
        toolTipText={
          "Graph showing break down of jobs available for level of education " +
          "and minumim experience required"
        }
      >
        <Selector
          TextFieldProps={{
            helperText: "Select year...",
            value,
            onChange: handleChange,
            label: "Year"
            //style: { width: "20%" }
          }}
          options={options.reverse()}
        />
      </PlotControl>
      <Chart
        data={traces}
        layout={{
          width: 1200,
          height: 516,
          title: "Education and experience",
          xaxis: {
            title: { text: "Number of job postings" }
          },
          yaxis: {
            categoryorder: "array",
            categoryarray: jsonResp.category_array
          },
          margin: { l: 300 },
          barmode: "stack",
          legend: { orientation: "h", x: 0, y: -0.2 }
        }}
      />
    </div>
  );
};

const StyledEducationChart = withStyles(style)(EducationChart);

export default function(props) {
  return (
    <CollectionsContext.Consumer>
      {value => (
        <Fetch
          url={findURLFromCollection(value, "education")}
          render={(data, refetch) => (
            <StyledEducationChart jsonResp={data} refetch={refetch} />
          )}
        />
      )}
    </CollectionsContext.Consumer>
  );
}
