export const conciseAddress = (address, startSlice = 6, endSlice = 3) => {
  if (address) {
    return `${address.slice(0, startSlice)}...${address.slice(address.length - endSlice, address.length)}`;
  }
  return '';
};