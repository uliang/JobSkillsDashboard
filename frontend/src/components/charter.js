import React from "react";
import { Paper, withStyles } from "@material-ui/core";
import Plot from "react-plotly.js";

const style = {
  root: { display: "flex", justifyContent: "flex-end" }
};

function Chart({ classes, ...props }) {
  let classNames = require("classnames");
  return (
    <Paper elevation={2} className={classNames(classes.root, props.className)}>
      <Plot {...props} />
    </Paper>
  );
}

export default withStyles(style)(Chart);
