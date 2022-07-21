import React from "react";
import useAxios from "axios-hooks";

export default function Fetch({ url, render }) {
  console.log(url);

  const [{ data, loading, error }, refetch] = useAxios(url);

  console.log(data);

  if (loading) return "loading...";
  if (error) return <div style={{ color: "red" }}> {"Error!"} </div>;
  return render(data, refetch);
}
