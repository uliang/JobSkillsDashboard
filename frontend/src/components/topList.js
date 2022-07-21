import React, { useMemo, useState } from "react";
import { withStyles } from "@material-ui/core";
import PlotControl from "./plotControl";
import Selector from "./selector";
import TopListCard from "./topListCard";
import { TopListCardContext } from "../context";
import { groupByAndChunk, findURLFromCollection } from "../utils";
import Fetch from "./fetcher";
import SeeMoreModal from "./modal";

const style = theme => ({
  root: {
    width: "320px"
  }
});

const TopList = withStyles(style)(
  ({ jsonResp, refetch, fieldName, ...props }) => {
    console.log(jsonResp);

    const { sector, _links, args, data, limit } = jsonResp;
    const [value, setValue] = useState(findURLFromCollection(_links, "self"));
    const {
      year,
      limit: [_, limitMore]
    } = args;

    const options = useMemo(() => {
      return year.map((y, i) => ({
        key: i,
        value: value.replace(/year=[\w\d]+/, `year=${y}`),
        label: y !== 9999 ? y : "All"
      }));
    }, [year, value]);

    const handleChange = e => {
      setValue(e.target.value);
      refetch({ url: e.target.value });
    };

    return (
      <div className={props.classes.root}>
        <PlotControl
          title={`Top ${fieldName}`}
          toolTipText={`Top ${limit} most requested skills in the ${sector} sector`}
        >
          <Selector
            TextFieldProps={{
              helperText: "Select year..",
              value,
              onChange: handleChange,
              label: "Year"
            }}
            options={options}
          />
        </PlotControl>
        <TopListCardContext.Provider
          value={value.replace(/limit=\d+/, `limit=${limitMore}`)}
        >
          {groupByAndChunk(data, "country").map(([country, dataChunk], i) => (
            <TopListCard
              key={i}
              data={dataChunk}
              cardTitle={`Top ${limit} ${fieldName} in ${country}`}
              renderMore={seeMoreUrl => (
                <Fetch
                  url={seeMoreUrl}
                  render={(data, _) => (
                    <SeeMoreModal
                      jsonResp={data}
                      country={country}
                      modalTitle={limit =>
                        `Top ${limit} ${fieldName} in ${country}`
                      }
                    />
                  )}
                />
              )}
            />
          ))}
        </TopListCardContext.Provider>
      </div>
    );
  }
);

export default TopList;
