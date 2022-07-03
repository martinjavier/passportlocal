import { floor } from "mathjs";
import { random } from "mathjs";

function between(min, max) {
  return floor(random() * (max - min) + min);
}

function randoms() {
  return between(1, 20000);
}

process.on("message", (msg) => {
  console.log(msg);
  const resultado = randoms();
  process.send(resultado);
});
