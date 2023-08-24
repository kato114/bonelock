export const trimAddress = (addr) => {
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const contract = {
  lockAddress: "0x26876b1Df5b0ffdE038123F40490D287B81aB3F5",
  multicallAddress: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
};

// lockAddress: "0xfc3484a4C65f7356e57d6721EC938e52CC639A5B",
// multicallAddress: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e",
