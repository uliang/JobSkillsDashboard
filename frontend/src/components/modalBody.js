import React from "react";
import { withStyles, DialogTitle, Typography } from "@material-ui/core";
import CardList from "./cardList";

const style = {
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around"
  }
};

function ModalBody(props) {
  const { resourceURL, modalTitle, classes, urlField } = props;

  return (
    <>
      <DialogTitle disableTypography={true}>
        <Typography variant="subtitle2" align="center">
          {modalTitle}
        </Typography>
      </DialogTitle>
      <CardList
        resourceURL={resourceURL}
        urlField={urlField}
        className={classes.root}
      />
    </>
  );
}

export default withStyles(style)(ModalBody);
