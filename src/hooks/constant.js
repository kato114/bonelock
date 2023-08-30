export const trimAddress = (addr) => {
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const contract = {
  lockAddress: "0x1d348E7E7A4A641494ad53a2923483668AD936Ab",
  multicallAddress: "0x37b8C638d89d78333af8E809A24f309EA33CfFEa",
};
