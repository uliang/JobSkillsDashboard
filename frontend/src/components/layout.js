import React from "react";
import { withStyles } from "@material-ui/core/styles";

export const Layout = withStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  margins: {
    ...theme.mixins.gutters(),
    marginTop: theme.spacing.unit * 2
  },
  section: {}
}))(props => {
  const classNames = require("classnames");
  return (
    <div className={classNames(props.classes.root, props.className)}>
      {props.children.map((child, index) => (
        <div
          className={classNames(props.classes.section, props.classes.margins)}
          key={index}
        >
          {child}
        </div>
      ))}
    </div>
  );
});

export const RowLayout = withStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "row",
    width: "1200px",
    justifyContent: "space-between"
  },
  section: {}
}))(props => (
  <div className={props.classes.root}>
    {props.children.map((child, index) => (
      <div key={index} className={props.classes.section}>
        {child}
      </div>
    ))}
  </div>
));
