import { ethers } from "hardhat";
import { BASE_ROUTER, BASE_WETH } from "../utils/constants";

async function main() {
  const [signer] = await ethers.getSigners();
  const TOKEN = "0x30d19fb77c3ee5cfa97f73d72c6a1e509fa06aef";
  const router = new ethers.Contract(
    BASE_ROUTER,
    [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
      "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external",
    ],
    signer
  );
  const token = new ethers.Contract(
    TOKEN,
    [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
    ],
    signer
  );

  const balance = await token.balanceOf(signer.address);
  if (balance.isZero()) {
    console.log("🚫 No tokens to sell. Run the buy-tax script first.");
    return;
  }

  const deadline = Math.floor(Date.now() / 1000) + 300;
  const path = [TOKEN, BASE_WETH];
  const expectedOut = await router.getAmountsOut(balance, path);
  const expectedETH = expectedOut[1];
  console.log(
    "🔍 Expected ETH out:",
    ethers.utils.formatUnits(expectedETH, 18)
  );
  await token.approve(BASE_ROUTER, balance);

  const ethBefore = await signer.getBalance();

  const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
    balance,
    0,
    path,
    signer.address,
    deadline
  );

  const receipt = await tx.wait();
  const ethAfter = await signer.getBalance();
  const gasUsed = receipt.gasUsed.mul(tx.gasPrice || 0);
  const ethReceived = ethAfter.sub(ethBefore).add(gasUsed);
  console.log(
    "💰 Actual ETH received:",
    ethers.utils.formatUnits(ethReceived, 18)
  );
  const sellTaxBps = Math.round(
    (1 - Number(ethReceived) / Number(expectedETH)) * 10000
  );
  console.log("📉 Sell Tax Bps:", sellTaxBps);
}

main().catch(console.error);
