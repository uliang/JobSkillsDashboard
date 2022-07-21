import React, { useMemo, useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import PlotControl from "./plotControl";
import Chart from "./charter";
import { findURLFromCollection } from "../utils";
import Selector from "./selector";
import { CollectionsContext } from "../context";
import Fetch from "./fetcher";

const style = theme => ({
  root: {
    width: "868px"
  }
});

export default function(props) {
  return (
    <CollectionsContext.Consumer>
      {value => (
        <Fetch
          url={findURLFromCollection(value, "bgtocc_trends")}
          render={(data, _) => <TrendChart jsonResp={data} />}
        />
      )}
    </CollectionsContext.Consumer>
  );
}

function BgtoccTrendChart({ data, layout }) {
  const traces = useMemo(
    function() {
      return data.map(({ country, year, percentage }) => ({
        name: country,
        x: year,
        y: percentage,
        marker: {
          color: country === "Singapore" ? "#2C3E50" : "#4CA1AF",
          symbol: "circle",
          size: 8
        },
        type: "scatter",
        mode: "lines+markers"
      }));
    },
    [data]
  );

  return <Chart data={traces} layout={layout} />;
}

const TrendChart = withStyles(style)(function({ classes, jsonResp }) {
  const [value, setValue] = useState(
    findURLFromCollection(jsonResp._links, "details")
  );
  const options = useMemo(() => {
    return jsonResp.data.map((item, i) => ({
      key: i,
      label: item.bgtocc,
      value: value.replace(/trend\/[\w\d]+/, `trend/${item.bgtocc_hash}`)
    }));
  }, [jsonResp, value]);

  const handleChange = e => {
    setValue(e.target.value);
  };

  return (
    <div className={classes.root}>
      <PlotControl
        title={"Job Openings Trend by Occupation"}
        toolTipText={
          "Graph showing the trend of job openings for the past 5 years as a" +
          " percentage of total job openings for that year"
        }
      >
        <Selector
          TextFieldProps={{
            helperText: "Select occupation...",
            value,
            onChange: handleChange,
            label: "Occupation"
            //style: { width: "40%" }
          }}
          options={options}
        />
      </PlotControl>
      <Fetch
        url={value}
        render={({ data, bgtocc }, _) => (
          <BgtoccTrendChart
            data={data}
            layout={{
              width: 868,
              height: 516,
              title: `${bgtocc}`,
              xaxis: {
                title: { text: "Year" },
                tickmode: "array",
                tickvals: data[0].year
              },
              yaxis: { title: { text: "Percentage (%)" } },
              legend: { orientation: "h", x: 0, y: -0.2 }
            }}
          />
        )}
      />
    </div>
  );
});
