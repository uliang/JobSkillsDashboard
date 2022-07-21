import React from "react";
import { Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "./toolTip";

const PlotTitle = ({ children, ...props }) => (
  <Typography {...props} variant="subtitle2">
    {children}
  </Typography>
);

const ModalIcon = withStyles(theme => ({
  root: {
    paddingLeft: "8px"
  }
}))(({ classes, ...props }) => {
  let classNames = require("classnames");
  return (
    <Tooltip
      title={props.toolTipText}
      placement="top"
      classes={{ tooltip: classes.toolTip }}
      interactive={true}
      leaveDelay={1000}
    >
      <i className={classNames(classes.root, props.className)}>
        <img src="/assets/tooltip.png" alt="tooltip" width="15px" />
      </i>
    </Tooltip>
  );
});

export default withStyles(theme => ({
  root: {
    display: "flex"
  },
  placing: {
    paddingBottom: "10px",
    alignSelf: "flex-end"
  },
  input: {
    marginTop: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    marginLeft: "auto",
    display: "flex",
    flexDirection: "row",
    paddingBottom: "10px"
  }
}))(function PlotControl({ classes, ...props }) {
  let { root, placing, input } = classes;
  return (
    <div className={root}>
      <PlotTitle className={placing}>{props.title}</PlotTitle>
      <ModalIcon className={placing} {...props} />
      <div className={input}> {props.children} </div>
    </div>
  );
});
