export const DisplayPriceInPesos = (price) => {
  const number = new Intl.NumberFormat('es-CO').format(price);
  return `$${number} COP`;
};