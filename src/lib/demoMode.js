export function activarDemo(tipo) {
  localStorage.setItem("demo_institucion", tipo);
}

export function leerDemo() {
  return localStorage.getItem("demo_institucion");
}

export function limpiarDemo() {
  localStorage.removeItem("demo_institucion");
}
