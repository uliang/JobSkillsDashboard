import React from "react";
import { CollectionsContext } from "../context";
import { findURLFromCollection } from "../utils";
import Fetch from "./fetcher";
import TopList from "./topList";

export default function(props) {
  return (
    <CollectionsContext.Consumer>
      {value => (
        <Fetch
          url={findURLFromCollection(value, "top_bgtoccs")}
          render={(data, refetch) => (
            <TopList
              jsonResp={data}
              refetch={refetch}
              fieldName={"occupations"}
            />
          )}
        />
      )}
    </CollectionsContext.Consumer>
  );
}
