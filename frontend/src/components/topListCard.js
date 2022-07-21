import React, { useState } from "react";
import {
  Paper,
  Typography,
  withStyles,
  Button,
  Dialog
} from "@material-ui/core";
import CardList from "./cardList";
import { TopListCardContext } from "../context";

const styles = theme => ({
  root: {
    height: "250px",
    width: "320px",
    marginBottom: theme.spacing.unit * 2,
    display: "flex",
    flexDirection: "column"
  },
  headline: {
    paddingLeft: "0.5rem",
    paddingTop: "0.5rem"
  },
  button: {
    display: "flex",
    flexDirection: "row-reverse"
  },
  label: {
    textTransform: "none"
  },
  list: {
    flexBasis: "60%"
  }
});

function TopListCard({ classes, cardTitle, data, renderMore, ...props }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Paper className={classes.root} elevation={2}>
        <Typography className={classes.headline} variant="subtitle2">
          {cardTitle}
        </Typography>
        <CardList data={data} />
        {renderMore && (
          <TopListCardContext.Consumer>
            {seeMoreURL => (
              <div className={classes.button}>
                <Button
                  color="primary"
                  classes={{ label: classes.label }}
                  onClick={() => setOpen(true)}
                >
                  See more
                </Button>
                <Dialog
                  open={open}
                  onClose={() => setOpen(false)}
                  maxWidth="sm"
                >
                  {renderMore(seeMoreURL)}
                </Dialog>
              </div>
            )}
          </TopListCardContext.Consumer>
        )}
      </Paper>
    </div>
  );
}

export default withStyles(styles)(TopListCard);
