import { readConfig, setUser } from "./config.js";

function main() {
  setUser("Clinton"); // or your own name
  const cfg = readConfig();
  console.log(cfg);
}

main();