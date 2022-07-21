import React from "react";
import { TextField, MenuItem } from "@material-ui/core";

export default props => (
  <TextField select {...props.TextFieldProps}>
    {props.options.length > 0 ? (
      props.options.map(({ value, key, label }) => (
        <MenuItem key={key} value={value}>
          {label}
        </MenuItem>
      ))
    ) : (
        <MenuItem />
      )}
  </TextField>
);
