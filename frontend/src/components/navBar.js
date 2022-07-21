import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import ToolBar from "@material-ui/core/ToolBar";
import Button from "@material-ui/core/Button";
const useStyles = makeStyles(theme => ({
  root: { flexGrow: 1 },
  icon: { flexGrow: 1 },
  brand: { marginRight: theme.spacing(2) },
  button: { marginRight: theme.spacing(1) }
}));

function Navigation(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <ToolBar variant="dense">
          <i className={classes.icon}>
            <img
              src="/assets/product-logo@3x.png"
              alt="brand"
              width="25%"
              className={classes.brand}
            />
          </i>
          <Button color="inherit" className={classes.button} href="/">
            {" "}
            Home{" "}
          </Button>
          <Button color="inherit" className={classes.button} href="/about.html">
            {" "}
            About{" "}
          </Button>
          <Button
            color="inherit"
            className={classes.button}
            href="/feedback.html"
          >
            {" "}
            Feedback{" "}
          </Button>
        </ToolBar>
      </AppBar>
    </div>
  );
}

export default Navigation;
