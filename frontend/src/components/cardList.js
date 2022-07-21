import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider
} from "@material-ui/core";
import Tooltip from "./toolTip";

export default function({ data, ...props }) {
  return (
    <List dense={true}>
      {data.map(item => (
        <React.Fragment key={item.rank}>
          <Tooltip
            title={
              <>
                <Typography variant="subtitle2">{item.name}</Typography>
                <Divider />
                {item.description === ""
                  ? "No description available"
                  : item.description}
              </>
            }
          >
            <ListItem
              alignItems="flex-start"
              divider={true}
              style={{ height: "35px" }}
            >
              <ListItemText
                primary={`${item.rank}. ${item.name}`}
                primaryTypographyProps={{
                  noWrap: true,
                  variant: "body2",
                  gutterBottom: true
                }}
              />
            </ListItem>
          </Tooltip>
        </React.Fragment>
      ))}
    </List>
  );
}
