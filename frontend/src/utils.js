export function range(start, stop, step = 1) {
  let h = Math.floor((stop - start) / step);
  return Array(h)
    .fill(start)
    .map((n, i) => n + i * step);
}

export function findURLFromCollection(arr, rel) {
  let find = require("lodash.find");
  return find(arr, { rel }).href;
}

export function groupByAndChunk(arr, key) {
  let groupBy = require("lodash.groupby");
  return Object.entries(groupBy(arr, key));
}

export function shorten(s, maxLen = 25) {
  return s.replace(new RegExp("^(.{" + maxLen + "}).*"), "$1...");
}
