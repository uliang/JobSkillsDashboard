import React, { useState, useMemo } from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Layout } from "./components/layout";
import SelectSector from "./components/selector";
import Fetch from "./components/fetcher";
import ChartLayout from "./components/chartLayout";
import { CollectionsContext } from "./context";
import { findURLFromCollection } from "./utils";
import Navigation from "./components/navBar";
import "./app.styles.css";

const useStyles = makeStyles(theme => ({
  sectorTitle: { marginBottom: theme.spacing(2) }
}));
const AppLayout = ({ data }) => {
  const classes = useStyles();
  const [value, setValue] = useState("");
  // const [options, setOptions ] = useState([])

  const options = useMemo(() => {
    let href = findURLFromCollection(data._links, "collection");
    return data.data.map(({ id, sector }) => ({
      key: id,
      label: sector,
      value: href.replace(/\/\d+/, `/${id}`)
    }));
  }, [data]);

  return (
    <React.Fragment>
      <Navigation />
      <Layout>
        <SelectSector
          TextFieldProps={{
            style: { width: "480px" },
            label: "Sectors",
            helperText: "Select sector...",
            onChange: e => {
              setValue(e.target.value);
            },
            value
          }}
          options={options}
        />
        {value !== "" && (
          <Fetch
            url={value}
            render={({ sector, _links: { collections } }, _) => (
              <CollectionsContext.Provider value={collections}>
                <Typography
                  variant="h5"
                  align="center"
                  className={classes.sectorTitle}
                >
                  {sector}
                </Typography>
                <ChartLayout />
              </CollectionsContext.Provider>
            )}
          />
        )}
      </Layout>
    </React.Fragment>
  );
};

const App = props => {
  return (
    <Fetch
      url={"/api/v2/sector"}
      render={(data, _) => <AppLayout data={data} />}
    />
  );
};
export default App;
