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
          url={findURLFromCollection(value, "top_skills")}
          render={(data, refetch) => (
            <TopList jsonResp={data} refetch={refetch} fieldName={"skills"} />
          )}
        />
      )}
    </CollectionsContext.Consumer>
  );
}
