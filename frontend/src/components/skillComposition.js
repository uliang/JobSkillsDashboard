import React, { useEffect, useState, useMemo } from "react";
import { withStyles } from "@material-ui/core";
import PlotControl from "./plotControl";
import Chart from "./charter";
import Selector from "./selector";
import chroma from "chroma-js";
import { findURLFromCollection } from "../utils";
import { CollectionsContext } from "../context";
import Fetch from "./fetcher";

const markerColors = chroma.scale(["2C3E50", "4CA1AF"]).colors(3);

const style = theme => ({
  root: { width: "1200px" },
  inputContainer: {
    marginLeft: "auto",
    display: "flex"
  },
  dropDown: {
    marginTop: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit * 2
    // paddingBottom: "10px"
  }
});

function SkillCompositionChart({ data }) {
  const traces = useMemo(
    () =>
      data.data.map(({ country, job_postings_skill, skill_name, year }) => {
        let draftTrace = {
          name: year,
          x: job_postings_skill,
          y: skill_name,
          marker: { color: markerColors[year - 2016] },
          type: "bar",
          orientation: "h"
        };
        if (country === "United States") {
          return { ...draftTrace, xaxis: "x2", yaxis: "y2" };
        }
        return draftTrace;
      }),
    [data]
  );
  const groupBy = require("lodash.groupby");
  const arrangement = groupBy(data.category_array, "country");

  const flatMap = require("lodash.flatmap");

  return (
    <Chart
      data={traces}
      layout={{
        width: 1200,
        height: 516,
        title: `Occupational skill requirements for ${data.bgtocc}`,
        xaxis: {
          title: { text: "Singapore" },
          domain: [0, 0.35]
        },
        xaxis2: { title: { text: "United States" }, domain: [0.65, 1] },
        barmode: "stack",
        legend: {
          orientation: "h",
          x: 0,
          y: -0.2
          //traceorder: "reversed"
        },
        grid: {
          rows: 1,
          columns: 2,
          pattern: "independent"
        },
        yaxis: {
          categoryorder: "array",
          categoryarray: flatMap(
            arrangement["Singapore"],
            "skill_name"
          ).reverse(),
          tickfont: { size: 10 }
        },
        yaxis2: {
          categoryorder: "array",
          categoryarray: flatMap(
            arrangement["United States"],
            "skill_name"
          ).reverse(),
          tickfont: { size: 10 }
        },
        margin: { l: 250 }
      }}
    />
  );
}

function SkillComposition({ jsonResp, refetch, classes }) {
  const [value, setValue] = useState(
    findURLFromCollection(jsonResp._links, "details")
  );

  const [bgtoccValue, setBgtoccValue] = useState(
    jsonResp.data[0].bgtocc_name_hash
  );
  const [skillTypeValue, setSkillTypeValue] = useState(
    jsonResp.args.skill_types[0]
  );
  const [limitValue, setLimitValue] = useState(jsonResp.args.limit[0]);

  const bgtoccOptions = useMemo(
    () =>
      jsonResp.data.map(({ bgtocc_name_hash, bgtocc }, i) => ({
        value: bgtocc_name_hash,
        label: bgtocc,
        key: i
      })),
    [jsonResp]
  );

  const skillTypeOptions = useMemo(
    () =>
      jsonResp.args.skill_types.map((skill_type, i) => ({
        key: i,
        label: skill_type,
        value: skill_type
      })),
    [jsonResp]
  );

  const limitOptions = useMemo(
    () =>
      jsonResp.args.limit.map((lim, i) => ({
        key: i,
        label: lim,
        value: lim
      })),
    [jsonResp]
  );

  useEffect(() => {
    setValue(
      value.replace(
        /\/bgtocc\/.+\?limit=\d+&skill_type=\w+/,
        `/bgtocc/${bgtoccValue}?limit=${limitValue}&skill_type=${skillTypeValue}`
      )
    );
  }, [bgtoccValue, skillTypeValue, limitValue, value]);

  return (
    <div className={classes.root}>
      <PlotControl
        title={`Occupational skill requirements`}
        toolTipText={
          "Comparison between skill requirements " +
          "for occupations in the United States " +
          "and Singapore"
        }
      >
        <div className={classes.inputContainer}>
          <Selector
            TextFieldProps={{
              helperText: "Select occupation...",
              value: bgtoccValue,
              onChange: e => {
                setBgtoccValue(e.target.value);
              },
              label: "Occupation",
              classes: { root: classes.dropDown }
            }}
            options={bgtoccOptions}
          />
          <Selector
            TextFieldProps={{
              helperText: "Select skill type...",
              value: skillTypeValue,
              onChange: e => {
                setSkillTypeValue(e.target.value);
              },
              label: "Type of skill",
              classes: { root: classes.dropDown }
            }}
            options={skillTypeOptions}
          />
          <Selector
            TextFieldProps={{
              helperText: "Select number...",
              value: limitValue,
              onChange: e => {
                setLimitValue(e.target.value);
              },
              label: "Top n skills",
              classes: { root: classes.dropDown }
            }}
            options={limitOptions}
          />
        </div>
      </PlotControl>
      <Fetch
        url={value}
        render={(data, _) => <SkillCompositionChart data={data} />}
      />
    </div>
  );
}

const StyledSkillComposition = withStyles(style)(SkillComposition);

export default function(props) {
  return (
    <CollectionsContext.Consumer>
      {value => (
        <Fetch
          url={findURLFromCollection(value, "bgtocc_collection")}
          render={(data, refetch) => (
            <StyledSkillComposition jsonResp={data} refetch={refetch} />
          )}
        />
      )}
    </CollectionsContext.Consumer>
  );
}
