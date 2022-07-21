import React from "react";
import { DialogContent, DialogTitle, Typography } from "@material-ui/core";
import CardList from "./cardList";

export default ({ jsonResp, country, modalTitle }) => {
  const { data, limit } = jsonResp;
  return (
    <DialogContent>
      <DialogTitle disableTypography={true}>
        <Typography variant="subtitle2" align="center">
          {modalTitle(limit)}
        </Typography>
      </DialogTitle>
      <CardList data={data.filter(i => i.country === country)} />
    </DialogContent>
  );
};
