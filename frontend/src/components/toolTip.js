import React from "react";
import { Tooltip, withStyles } from "@material-ui/core";

const style = theme => ({
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "black",
    fontSize: theme.typography.pxToRem(12)
  }
});

function MyTooltip({ classes, ...props }) {
  return <Tooltip {...props} classes={{ tooltip: classes.tooltip }} />;
}

export default withStyles(style)(MyTooltip);
